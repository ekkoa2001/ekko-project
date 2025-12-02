require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// 配置检查
// ============================================
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ 缺少必要的环境变量:', missingVars.join(', '));
  console.error('请在 Zeabur 中配置这些环境变量');
  process.exit(1);
}

// ============================================
// Supabase 客户端
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// Cloudflare R2 客户端 (S3 兼容)
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
// 中间件配置
// ============================================

// Helmet - 安全头
app.use(helmet({
  contentSecurityPolicy: false, // Zeabur 部署时可能需要关闭
  crossOriginEmbedderPolicy: false,
}));

// CORS - 允许前端域名
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  /\.zeabur\.app$/, // 允许所有 Zeabur 子域名
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如 Postman）
    if (!origin) return callback(null, true);
    
    // 检查是否在白名单中
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting - 防刷
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 个请求
  message: { success: false, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 5, // 最多 5 次登录尝试
  message: { success: false, message: '登录尝试次数过多，请1小时后再试' },
  skipSuccessfulRequests: true,
});

app.use('/api/', globalLimiter);

// 请求日志
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// ============================================
// 工具函数
// ============================================

// 获取客户端 IP
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress;
}

// 生成 JWT Token
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

// 验证 JWT Token 中间件
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

// 检查用户是否购买了课程
async function checkUserPurchase(userId, courseId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'paid')
    .single();

  return !error && data;
}

// ============================================
// API 路由
// ============================================

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    service: 'Ekko API Server'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Ekko API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
      courses: 'GET /api/courses',
      courseDetail: 'GET /api/courses/:id',
      download: 'GET /api/courses/:id/download'
    }
  });
});

// ============================================
// 认证接口
// ============================================

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码不能为空' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '密码至少需要6个字符' 
      });
    }

    // 检查用户是否存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: '该邮箱已被注册' 
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name || email.split('@')[0],
      })
      .select()
      .single();

    if (error) throw error;

    // 生成 Token
    const token = generateToken(newUser);

    // 移除密码哈希
    delete newUser.password_hash;

    res.json({
      success: true,
      user: newUser,
      token
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '注册失败，请稍后重试' 
    });
  }
});

// 用户登录
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱和密码不能为空' 
      });
    }

    // 获取用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: '账号或密码错误' 
      });
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '账号或密码错误' 
      });
    }

    // 生成 Token
    const token = generateToken(user);

    // 移除密码哈希
    delete user.password_hash;

    res.json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '登录失败，请稍后重试' 
    });
  }
});

// ============================================
// 课程接口
// ============================================

// 获取所有课程
app.get('/api/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ 
      success: true, 
      data: courses 
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取课程列表失败' 
    });
  }
});

// 获取单个课程详情
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

    res.json({ 
      success: true, 
      data: course 
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取课程详情失败' 
    });
  }
});

// ============================================
// 防盗链核心：安全下载接口
// ============================================
app.get('/api/courses/:id/download', verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    // 1. 获取课程信息
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

    // 2. 检查用户是否购买了该课程
    const hasPurchased = await checkUserPurchase(userId, courseId);

    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false, 
        message: '您尚未购买此课程，无法下载' 
      });
    }

    // 3. 生成 R2 预签名 URL（10分钟有效）
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: course.resource_file_key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { 
      expiresIn: 600 // 10 分钟
    });

    // 4. 记录下载日志
    await supabase
      .from('download_logs')
      .insert({
        user_id: userId,
        course_id: courseId,
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']
      });

    // 5. 更新用户下载次数
    await supabase.rpc('increment_download_count', { user_id: userId });

    // 6. 返回临时下载链接
    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: 600,
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        filename: course.title + '.zip'
      }
    });

    console.log(`✅ 用户 ${userId} 下载课程 ${courseId}`);
  } catch (error) {
    console.error('生成下载链接错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '生成下载链接失败，请稍后重试' 
    });
  }
});

// ============================================
// 创建订单（简化版）
// ============================================
app.post('/api/orders/create', verifyToken, async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    const userId = req.user.id;

    // 验证课程存在
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

    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: amount,
        status: 'paid', // 简化版直接标记为已支付
        payment_method: 'demo'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 更新课程销量
    await supabase
      .from('courses')
      .update({ sales: course.sales + 1 })
      .eq('id', courseId);

    res.json({ 
      success: true, 
      data: order 
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '创建订单失败' 
    });
  }
});

// ============================================
// 错误处理
// ============================================
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '接口不存在' 
  });
});

// ============================================
// 启动服务器
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Ekko API Server                     ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'production'}              ║
║   Platform: Zeabur                        ║
╚═══════════════════════════════════════════╝

✅ 服务器启动成功！
📊 数据库: Supabase PostgreSQL
💾 存储: Cloudflare R2
🔒 安全: Helmet + Rate Limiting
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;
