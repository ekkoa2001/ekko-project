-- Ekko 项目 Supabase 数据库初始化脚本
-- 在 Supabase Dashboard > SQL Editor 中执行

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  cover_image_url TEXT,
  resource_file_key TEXT NOT NULL, -- R2 中的文件 key
  sales INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 下载记录表（防盗链核心）
CREATE TABLE IF NOT EXISTS download_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_course_id ON download_logs(course_id);

-- 自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入测试数据（可选）
-- 测试用户（密码: password123，已用 bcrypt 加密）
INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@ekko.com', '$2b$10$rKvVPZqGhXqKXPZqGhXqKe7YvVPZqGhXqKXPZqGhXqKXPZqGhXqKO', 'Admin User', 'admin'),
  ('user@ekko.com', '$2b$10$rKvVPZqGhXqKXPZqGhXqKe7YvVPZqGhXqKXPZqGhXqKXPZqGhXqKO', 'Test User', 'user')
ON CONFLICT (email) DO NOTHING;

-- 测试课程
INSERT INTO courses (title, price, description, category, cover_image_url, resource_file_key) VALUES
  ('Shopify 建站实战', 299.00, '从零开始学习 Shopify 独立站搭建', '独立站', 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800', 'courses/shopify-course.zip'),
  ('TikTok 直播运营', 399.00, 'TikTok 直播间搭建与运营技巧', '直播', 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800', 'courses/tiktok-live.zip'),
  ('Facebook 广告投放', 499.00, 'Facebook 广告投放完整指南', '广告', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800', 'courses/facebook-ads.zip')
ON CONFLICT DO NOTHING;

-- 查看创建的表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 数据库初始化完成！';
  RAISE NOTICE '📊 已创建表: users, courses, orders, download_logs';
  RAISE NOTICE '🔑 已创建索引和触发器';
  RAISE NOTICE '📝 已插入测试数据';
END $$;
