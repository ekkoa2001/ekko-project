-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Admin & Customers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'banned'
    registration_ip VARCHAR(45),
    last_login_ip VARCHAR(45),
    user_agent TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (Key-Value Store for Config)
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    category VARCHAR(50), -- 'general', 'hero', 'seo', 'images'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    image VARCHAR(255),
    category VARCHAR(50),
    is_published BOOLEAN DEFAULT TRUE,
    sales INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Visits (Real Traffic Tracking)
CREATE TABLE IF NOT EXISTS analytics_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id), -- Optional, if logged in
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    user_agent TEXT,
    browser VARCHAR(50),
    os VARCHAR(50),
    device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
    path VARCHAR(255),
    referrer VARCHAR(255),
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Seed Data (Admin)
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (email, password_hash, name, role)
VALUES 
('admin@ekko.com', '$2b$10$7zWj./.exampleHashPlaceholder...', 'System Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Initial Site Settings
INSERT INTO site_settings (key, value, category) VALUES
('site_title', 'Ekko Course CMS', 'general'),
('site_description', 'Professional Course Management System', 'seo'),
('contact_email', 'support@ekko.com', 'general'),
('hero_title', 'Master Your Skills', 'hero'),
('hero_subtitle', 'Learn from the best mentors in the industry.', 'hero')
ON CONFLICT (key) DO NOTHING;
