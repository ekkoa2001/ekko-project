# Ekko 生产环境部署指南

## Phase 1: 数据库设置 (Supabase)

### 1.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.2 执行数据库迁移

1. 在 Supabase Dashboard 中，进入 SQL Editor
2. 复制 `server/supabase-schema.sql` 的内容
3. 执行 SQL 创建所有表和索引

### 1.3 配置 Row Level Security (RLS)

SQL 脚本已包含 RLS 策略，确保：
- 用户只能查看自己的订单
- 用户只能查看自己的个人信息
- 所有人可以查看活跃课程

## Phase 2: 对象存储设置 (Cloudflare R2)

### 2.1 创建 R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 R2 Object Storage
3. 创建新 Bucket: `ekko-courses`
4. 配置 CORS:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2.2 生成 API Token

1. 在 R2 设置中创建 API Token
2. 记录：
   - Access Key ID
   - Secret Access Key
   - Account ID

### 2.3 配置公共访问（可选）

如果需要公开访问某些文件：
1. 绑定自定义域名到 R2 Bucket
2. 或使用 R2.dev 子域名

## Phase 3: 后端部署

### 3.1 环境变量配置

在服务器上创建 `.env` 文件：

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
JWT_SECRET=生成一个强随机密钥

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=你的anon-key
SUPABASE_SERVICE_KEY=你的service-role-key

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=你的account-id
R2_ACCESS_KEY_ID=你的access-key
R2_SECRET_ACCESS_KEY=你的secret-key
R2_BUCKET_NAME=ekko-courses
R2_PUBLIC_URL=https://your-bucket.r2.dev

# CORS Configuration
FRONTEND_URL=https://your-domain.com
ADMIN_URL=https://admin.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_WINDOW_MS=3600000
LOGIN_RATE_LIMIT_MAX_REQUESTS=5
```

### 3.2 使用新的安全服务器

```bash
cd ekko-project/server

# 安装依赖
npm install

# 使用安全服务器
node index-secure.js
```

### 3.3 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start index-secure.js --name ekko-server

# 设置开机自启
pm2 startup
pm2 save
```

## Phase 4: 前端部署

### 4.1 更新环境变量

**客户端 (.env.production):**
```
VITE_API_URL=https://api.your-domain.com/api
```

**管理后台 (.env.production):**
```
VITE_API_URL=https://api.your-domain.com/api
```

### 4.2 构建前端

```bash
# 客户端
cd ekko-project/client
npm run build

# 管理后台
cd ekko-project/admin
npm run build
```

### 4.3 部署到 CDN

推荐使用：
- **Vercel** (最简单)
- **Netlify**
- **Cloudflare Pages**

或使用 Nginx 托管：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/ekko-client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Phase 5: 安全加固

### 5.1 SSL/TLS 证书

使用 Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5.2 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 5.3 定期备份

设置 Supabase 自动备份：
1. 在 Supabase Dashboard 中启用 Point-in-Time Recovery
2. 设置每日备份计划

## Phase 6: 监控和日志

### 6.1 应用监控

推荐工具：
- **Sentry** - 错误追踪
- **LogRocket** - 用户会话回放
- **Datadog** - 性能监控

### 6.2 日志管理

```bash
# 查看 PM2 日志
pm2 logs ekko-server

# 查看错误日志
pm2 logs ekko-server --err

# 清空日志
pm2 flush
```

## Phase 7: 性能优化

### 7.1 启用 CDN

将静态资源托管到 CDN：
- 图片 → Cloudflare Images
- 视频 → Cloudflare Stream
- 静态文件 → Cloudflare CDN

### 7.2 数据库优化

```sql
-- 定期分析表
ANALYZE users;
ANALYZE courses;
ANALYZE orders;

-- 检查慢查询
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

### 7.3 缓存策略

在 Nginx 中配置缓存：

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 安全检查清单

- [ ] 所有密钥已更改为强随机值
- [ ] HTTPS 已启用
- [ ] CORS 已正确配置
- [ ] Rate Limiting 已启用
- [ ] 数据库 RLS 已启用
- [ ] 文件上传大小限制已设置
- [ ] 错误信息不暴露敏感信息
- [ ] 日志记录已启用
- [ ] 备份策略已设置
- [ ] 监控告警已配置

## 故障排查

### 数据库连接失败
```bash
# 检查 Supabase 连接
curl https://your-project.supabase.co/rest/v1/
```

### R2 访问失败
```bash
# 测试 R2 凭证
aws s3 ls s3://ekko-courses --endpoint-url https://xxxxx.r2.cloudflarestorage.com
```

### Rate Limit 触发
```bash
# 查看 IP 限制日志
pm2 logs ekko-server | grep "请求过于频繁"
```

## 联系支持

如遇问题，请查看：
- Supabase 文档: https://supabase.com/docs
- Cloudflare R2 文档: https://developers.cloudflare.com/r2/
- 项目 Issues: https://github.com/your-repo/issues
