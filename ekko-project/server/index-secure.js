require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SUPABASE CLIENT SETUP
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// CLOUDFLARE R2 CLIENT SETUP
// ============================================
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS - Strict origin control
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter - 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Login rate limiter - 5 requests per hour
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS) || 5,
  message: { success: false, message: '登录尝试次数过多，请1小时后再试' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get client IP address
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress;
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供认证令牌' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        success: false, 
        message: '认证令牌无效或已过期' 
      });
    }
    req.user = decoded;
    next();
  });
}

// Verify admin role middleware
function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '需要管理员权限' 
    });
  }
  next();
}

// Log activity to database
async function logActivity(userId, actionType, status, metadata, req) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      status: status,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent'],
      metadata: metadata
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码不能为空' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少需要8个字符' 
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      await logActivity(null, 'register', 'failure', { email, reason: 'email_exists' }, req);
      return res.status(400).json({ 
        success: false, 
        message: '该邮箱已被注册' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name || email.split('@')[0],
        phone,
        registration_ip: getClientIp(req),
        last_login_ip: getClientIp(req),
        last_login_date: new Date().toISOString(),
        user_agent: req.headers['user-agent']
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(newUser.id, 'register', 'success', { email }, req);

    // Generate token
    const token = generateToken(newUser);

    // Remove password hash from response
    delete newUser.password_hash;

    res.json({
      success: true,
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: '注册失败，请稍后重试' 
    });
  }
});

// User Login (with rate limiting)
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码不能为空' 
      });
    }

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      await logActivity(null, 'login', 'failure', { email, reason: 'user_not_found' }, req);
      return res.status(401).json({ 
        success: false, 
        message: '账号或密码错误' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      await logActivity(user.id, 'login', 'failure', { email, reason: 'account_inactive' }, req);
      return res.status(401).json({ 
        success: false, 
        message: '账号已被停用' 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      await logActivity(user.id, 'login', 'failure', { email, reason: 'wrong_password' }, req);
      return res.status(401).json({ 
        success: false, 
        message: '账号或密码错误' 
      });
    }

    // Update last login info
    await supabase
      .from('users')
      .update({
        last_login_ip: getClientIp(req),
        last_login_date: new Date().toISOString()
      })
      .eq('id', user.id);

    // Log successful login
    await logActivity(user.id, 'login', 'success', { email }, req);

    // Generate token
    const token = generateToken(user);

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败，请稍后重试' 
    });
  }
});

// ============================================
// COURSE ROUTES
// ============================================

// Get all active courses
app.get('/api/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取课程失败' 
    });
  }
});

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !course) {
      return res.status(404).json({ 
        success: false, 
        message: '课程不存在' 
      });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取课程失败' 
    });
  }
});

// ============================================
// SECURE DOWNLOAD ROUTE
// ============================================

app.get('/api/download/:fileId', verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // Get file info
    const { data: file, error: fileError } = await supabase
      .from('course_files')
      .select('*, courses(*)')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ 
        success: false, 
        message: '文件不存在' 
      });
    }

    // Check if user purchased the course
    const { data: purchase, error: purchaseError } = await supabase
      .from('order_items')
      .select('orders(*)')
      .eq('course_id', file.course_id)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'paid')
      .single();

    if (purchaseError || !purchase) {
      return res.status(403).json({ 
        success: false, 
        message: '您尚未购买此课程' 
      });
    }

    // Check download count
    const { data: downloadLog } = await supabase
      .from('download_logs')
      .select('download_count')
      .eq('user_id', userId)
      .eq('file_id', fileId)
      .single();

    if (downloadLog && downloadLog.download_count >= 5) {
      return res.status(403).json({ 
        success: false, 
        message: '下载次数已达上限（5次）' 
      });
    }

    // Generate signed URL (valid for 5 minutes)
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: file.r2_key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

    // Update download count
    if (downloadLog) {
      await supabase
        .from('download_logs')
        .update({ 
          download_count: downloadLog.download_count + 1 
        })
        .eq('user_id', userId)
        .eq('file_id', fileId);
    } else {
      await supabase
        .from('download_logs')
        .insert({
          user_id: userId,
          course_id: file.course_id,
          file_id: fileId,
          ip_address: getClientIp(req),
          user_agent: req.headers['user-agent'],
          download_count: 1
        });
    }

    // Log activity
    await logActivity(userId, 'download', 'success', { 
      file_id: fileId, 
      course_id: file.course_id 
    }, req);

    res.json({
      success: true,
      data: {
        url: signedUrl,
        filename: file.file_name,
        expiresIn: 300
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      message: '生成下载链接失败' 
    });
  }
});

// ============================================
// ORDER ROUTES
// ============================================

// Create order
app.post('/api/orders/create', verifyToken, async (req, res) => {
  try {
    const { courseId, amount, paymentMethod } = req.body;
    const userId = req.user.id;

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ 
        success: false, 
        message: '课程不存在' 
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: amount,
        original_amount: amount,
        payment_method: paymentMethod || 'wechat',
        status: 'paid', // In production, this would be 'pending'
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent'],
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order item
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        course_id: courseId,
        price: amount
      });

    // Increment course sales
    await supabase
      .from('courses')
      .update({ sales: course.sales + 1 })
      .eq('id', courseId);

    // Log activity
    await logActivity(userId, 'purchase', 'success', { 
      course_id: courseId, 
      order_id: order.id, 
      amount 
    }, req);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建订单失败' 
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Ekko Secure Server Running          ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Security: ✅ Helmet + Rate Limiting     ║
║   Database: ✅ Supabase PostgreSQL        ║
║   Storage: ✅ Cloudflare R2               ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
