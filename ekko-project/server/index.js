require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// Clients Setup
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ============================================
// Middleware
// ============================================
app.use(helmet({ 
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false 
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  /\.zeabur\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    if (isAllowed) callback(null, true);
    else callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // DEV BYPASS
  if (token === 'dev-bypass-token') {
    req.user = { id: 'dev-admin-id', email: 'dev@admin.com', role: 'admin' };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Forbidden' });
    req.user = decoded;
    next();
  });
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required' });
    }
  });
}

// ============================================
// Routes: Config & Content (Dynamic CMS)
// ============================================

// GET /api/config - Public
app.get('/api/config', async (req, res) => {
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value, category');
    if (error) throw error;
    
    // Transform array to object for easier frontend consumption
    const config = {};
    data.forEach(item => {
      config[item.key] = item.value;
    });
    
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Config Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch config' });
  }
});

// POST /api/config - Admin Only
app.post('/api/config', verifyAdmin, async (req, res) => {
  try {
    const settings = req.body; // Expect { key: value, key2: value2 }
    
    const updates = Object.entries(settings).map(([key, value]) => {
      return supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date() })
        .select();
    });
    
    await Promise.all(updates);
    res.json({ success: true, message: 'Config updated successfully' });
  } catch (error) {
    console.error('Config Update Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update config' });
  }
});

// ============================================
// Routes: Upload (Cloudflare R2)
// ============================================

app.post('/api/upload', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `uploads/${crypto.randomUUID()}${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await r2Client.send(command);

    // Construct public URL (assuming R2 public domain is set in env or standard pattern)
    // If you have a custom domain for R2, use it. Otherwise use the R2 dev URL.
    const publicUrl = process.env.R2_PUBLIC_DOMAIN 
      ? `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.dev/${fileName}`; // Fallback

    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ============================================
// Routes: Coupons & Orders (Growth Features)
// ============================================

// POST /api/coupons/verify
app.post('/api/coupons/verify', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    res.json({ 
      success: true, 
      coupon: { 
        code: data.code, 
        discount_percent: data.discount_percent 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { course_id, coupon_code } = req.body;
    const user_id = req.user.id;

    // 1. Fetch Course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (courseError || !course) return res.status(404).json({ success: false, message: 'Course not found' });

    let finalAmount = course.price;
    let originalAmount = course.price;
    let appliedCoupon = null;

    // 2. Apply Coupon if exists
    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .eq('is_active', true)
        .single();

      if (coupon) {
        const discount = (finalAmount * coupon.discount_percent) / 100;
        finalAmount = finalAmount - discount;
        appliedCoupon = coupon.code;
        
        // Increment usage count
        await supabase.rpc('increment_coupon_usage', { coupon_code: coupon.code });
      }
    }

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id,
        course_id,
        amount: finalAmount,
        original_amount: originalAmount,
        coupon_code: appliedCoupon,
        status: 'pending', // In real app, this would be 'pending' then updated by payment webhook
        payment_method: 'mock_pay'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    res.json({ success: true, order });
  } catch (error) {
    console.error('Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// Routes: Auth (Simplified)
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name, role: 'user' }])
      .select().single();

    if (error) throw error;
    const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { id: data.id, email: data.email, name: data.name, role: data.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
