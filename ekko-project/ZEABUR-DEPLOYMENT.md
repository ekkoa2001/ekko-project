# Ekko Zeabur 部署指南

## 🚀 快速部署到 Zeabur

### 前置准备

1. **Supabase 账号** - https://supabase.com
2. **Cloudflare 账号** - https://dash.cloudflare.com
3. **Zeabur 账号** - https://zeabur.com

---

## Step 1: 配置 Supabase 数据库

### 1.1 创建 Supabase 项目

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `ekko-production`
   - Database Password: 生成强密码
   - Region: 选择离你最近的区域

### 1.2 执行数据库初始化

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 复制 `server/supabase-init.sql` 的全部内容
3. 粘贴到 SQL Editor 并点击 **Run**
4. 等待执行完成，应该看到成功提示

### 1.3 获取 Supabase 凭证

在 Supabase Dashboard > Settings > API 中找到：

```
Project URL: https://xxxxx.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **重要**: 使用 `service_role key`（不是 anon key）

---

## Step 2: 配置 Cloudflare R2

### 2.1 创建 R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **R2 Object Storage**
3. 点击 **Create bucket**
4. Bucket 名称: `ekko-courses`
5. 位置: 自动选择

### 2.2 生成 API Token

1. 在 R2 页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 权限选择: **Object Read & Write**
4. 记录以下信息：
   ```
   Access Key ID: xxxxx
   Secret Access Key: xxxxx
   Account ID: xxxxx (在 R2 主页右侧)
   ```

### 2.3 上传测试文件（可选）

1. 进入 `ekko-courses` bucket
2. 上传一个测试文件，例如 `courses/test-course.zip`
3. 记录文件的 Key: `courses/test-course.zip`

---

## Step 3: 部署到 Zeabur

### 3.1 连接 GitHub 仓库

1. 登录 [Zeabur Dashboard](https://dash.zeabur.com)
2. 点击 **New Project**
3. 选择 **Deploy from GitHub**
4. 授权并选择你的仓库

### 3.2 配置服务

1. Zeabur 会自动检测到 `server/package.json`
2. 服务类型: **Node.js**
3. 启动命令: `npm start`（自动检测）
4. 根目录: `ekko-project/server`

### 3.3 配置环境变量

在 Zeabur 项目设置中，添加以下环境变量：

```bash
# Supabase 配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT 密钥（生成一个强随机字符串）
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudflare R2 配置
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=ekko-courses

# CORS 配置（部署后更新）
FRONTEND_URL=https://your-frontend.zeabur.app

# Node 环境
NODE_ENV=production
```

**生成 JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 部署

1. 点击 **Deploy**
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后，Zeabur 会提供一个域名：
   ```
   https://ekko-server-xxxxx.zeabur.app
   ```

### 3.5 验证部署

访问健康检查端点：
```bash
curl https://ekko-server-xxxxx.zeabur.app/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "service": "Ekko API Server"
}
```

---

## Step 4: 部署前端（可选）

### 4.1 配置前端环境变量

在 `client/.env.production` 中：

```bash
VITE_API_URL=https://ekko-server-xxxxx.zeabur.app/api
```

### 4.2 部署前端到 Zeabur

1. 在同一个 Zeabur 项目中，点击 **Add Service**
2. 选择 **Deploy from GitHub**（同一个仓库）
3. 根目录: `ekko-project/client`
4. 构建命令: `npm run build`
5. 输出目录: `dist`

### 4.3 更新后端 CORS

部署前端后，更新后端的 `FRONTEND_URL` 环境变量：

```bash
FRONTEND_URL=https://ekko-client-xxxxx.zeabur.app
```

---

## Step 5: 测试完整流程

### 5.1 测试注册

```bash
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 5.2 测试登录

```bash
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

保存返回的 `token`。

### 5.3 测试获取课程列表

```bash
curl https://ekko-server-xxxxx.zeabur.app/api/courses
```

### 5.4 测试安全下载

```bash
# 先创建一个测试订单（模拟购买）
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courseId": "课程ID",
    "amount": 299
  }'

# 然后请求下载链接
curl https://ekko-server-xxxxx.zeabur.app/api/courses/课程ID/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

应该返回一个临时的 R2 签名 URL。

---

## 🔧 故障排查

### 问题 1: 服务启动失败

**检查日志:**
1. 在 Zeabur Dashboard 中查看 **Logs**
2. 查找错误信息

**常见原因:**
- 环境变量配置错误
- Supabase 连接失败
- R2 凭证错误

**解决方法:**
```bash
# 验证 Supabase 连接
curl https://your-project.supabase.co/rest/v1/

# 验证环境变量
# 在 Zeabur Logs 中查看启动日志
```

### 问题 2: CORS 错误

**症状:** 前端无法访问 API

**解决方法:**
1. 确保 `FRONTEND_URL` 环境变量正确
2. 检查前端的 `VITE_API_URL` 配置
3. 重新部署后端服务

### 问题 3: 下载链接无效

**检查:**
1. R2 Bucket 名称是否正确
2. R2 API Token 权限是否足够
3. 文件 Key 是否存在

**测试 R2 连接:**
```bash
# 使用 AWS CLI 测试
aws s3 ls s3://ekko-courses \
  --endpoint-url https://xxxxx.r2.cloudflarestorage.com
```

### 问题 4: Rate Limit 触发

**症状:** 返回 429 错误

**解决方法:**
- 等待限流时间窗口过期
- 或在 Zeabur 环境变量中调整限流参数

---

## 📊 监控和维护

### 查看日志

在 Zeabur Dashboard 中：
1. 选择你的服务
2. 点击 **Logs** 标签
3. 实时查看日志输出

### 性能监控

Zeabur 提供：
- CPU 使用率
- 内存使用率
- 请求数量
- 响应时间

### 数据库监控

在 Supabase Dashboard 中：
1. 进入 **Database** > **Reports**
2. 查看查询性能
3. 监控连接数

### 存储监控

在 Cloudflare Dashboard 中：
1. 进入 **R2** > **Metrics**
2. 查看存储使用量
3. 监控请求数量

---

## 🔐 安全建议

### 1. 定期更换密钥

```bash
# 每季度更换 JWT_SECRET
# 在 Zeabur 中更新环境变量
# 重新部署服务
```

### 2. 监控异常登录

```sql
-- 在 Supabase SQL Editor 中查询
SELECT * FROM download_logs 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### 3. 备份数据库

Supabase 自动备份，但建议：
- 启用 Point-in-Time Recovery
- 定期导出重要数据

### 4. 限制 API 访问

- 使用 Zeabur 的 IP 白名单功能
- 配置更严格的 Rate Limiting
- 启用 API Key 认证（可选）

---

## 💰 成本估算

### Zeabur
- **Hobby Plan**: $5/月（适合开发）
- **Pro Plan**: $20/月（适合生产）

### Supabase
- **Free Plan**: $0/月（500MB 数据库）
- **Pro Plan**: $25/月（8GB 数据库）

### Cloudflare R2
- **存储**: $0.015/GB/月
- **出站流量**: 免费
- **请求**: $0.36/百万次

**总成本（小规模）:**
- Zeabur: $5-20/月
- Supabase: $0-25/月
- R2: ~$2/月（100GB 存储）
- **合计**: $7-47/月

---

## 🎉 部署完成检查清单

- [ ] Supabase 数据库已创建并初始化
- [ ] Cloudflare R2 Bucket 已创建
- [ ] Zeabur 服务已部署
- [ ] 所有环境变量已配置
- [ ] 健康检查通过
- [ ] 注册/登录功能正常
- [ ] 课程列表可以获取
- [ ] 下载功能正常（需先购买）
- [ ] CORS 配置正确
- [ ] 前端已部署（如需要）
- [ ] 域名已绑定（如需要）
- [ ] SSL 证书已配置
- [ ] 监控已设置

---

## 📞 获取帮助

- **Zeabur 文档**: https://zeabur.com/docs
- **Supabase 文档**: https://supabase.com/docs
- **Cloudflare R2 文档**: https://developers.cloudflare.com/r2/
- **项目 Issues**: https://github.com/your-repo/issues

---

## 🚀 下一步

1. 配置自定义域名
2. 启用 CDN 加速
3. 添加支付网关
4. 实现邮件通知
5. 添加数据分析
6. 优化 SEO

**恭喜！你的 Ekko 项目已成功部署到生产环境！** 🎊
