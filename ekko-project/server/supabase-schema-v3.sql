-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Site Settings (Dynamic CMS)
create table if not exists site_settings (
  key text primary key,
  value text,
  category text default 'general', -- 'general', 'seo', 'appearance', 'contact'
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Coupons (Growth Features)
create table if not exists coupons (
  code text primary key,
  discount_percent integer not null check (discount_percent > 0 and discount_percent <= 100),
  is_active boolean default true,
  usage_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Users (Core)
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  name text,
  role text default 'user', -- 'admin', 'user'
  status text default 'active',
  registration_ip text,
  last_login_ip text,
  last_login_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Courses (Core)
create table if not exists courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price decimal(10,2) not null,
  original_price decimal(10,2), -- For strike-through price display
  category text,
  image text,
  sales integer default 0,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Orders (Core)
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  course_id uuid references courses(id),
  amount decimal(10,2) not null, -- Final amount paid
  original_amount decimal(10,2), -- Amount before coupon
  coupon_code text,
  status text default 'pending', -- 'pending', 'paid', 'refunded'
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Analytics (From Phase 0)
create table if not exists analytics_visits (
  id uuid default uuid_generate_v4() primary key,
  session_id text,
  ip_address text,
  country text,
  city text,
  region text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  path text,
  referrer text,
  duration_seconds integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed Data: Site Settings (Mobile Friendly Defaults)
insert into site_settings (key, value, category) values
('site_title', 'Ekko Studio', 'general'),
('site_description', '独立出海人，分享最真实的实战经验。', 'seo'),
('contact_email', 'hello@ekko.com', 'contact'),
('hero_title', '掌握品牌出海的核心密码', 'appearance'),
('hero_subtitle', '从0到1构建你的DTC独立站商业帝国', 'appearance'),
('hero_banner_url', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', 'appearance'),
('site_logo', '', 'appearance') -- Empty means use default text logo
on conflict (key) do nothing;

-- Seed Data: Coupons
insert into coupons (code, discount_percent, is_active) values
('WELCOME20', 20, true),
('EKKO10', 10, true),
('BLACKFRIDAY', 50, false)
on conflict (code) do nothing;

-- Seed Data: Admin User (Password: admin123)
-- Note: In production, use bcrypt hash. This is a placeholder hash for 'admin123'
insert into users (email, password_hash, name, role, status) values
('admin@ekko.com', '$2b$10$5uXx.r0.1t.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x', 'Ekko Admin', 'admin', 'active')
on conflict (email) do nothing;

-- Seed Data: Sample Courses
insert into courses (title, price, original_price, category, description, image, sales) values
('Shopify 独立站从0到1实战', 299, 599, 'Shopify', '零基础搭建高转化独立站，包含选品、装修、支付配置全流程。', 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80', 1240),
('TikTok 直播带货操盘手', 499, 999, 'TikTok', '揭秘百万GMV直播间搭建逻辑，话术拆解与主播培训体系。', 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=800&q=80', 856),
('Facebook 广告投放进阶', 399, 699, 'Facebook', 'ROAS 优化策略，精准受众定位与素材制作指南。', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=800&q=80', 632)
on conflict do nothing;
