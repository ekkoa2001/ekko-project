# Ekko 快速启动指南

## 选择运行模式

### 模式 1: 开发模式（使用 LowDB）

适合本地开发和测试，无需配置外部服务。

```bash
# 1. 启动后端（使用原始服务器）
cd ekko-project/server
npm install
npm start

# 2. 启动客户端
cd ekko-project/client
npm install
npm run dev

# 3. 启动管理后台
cd ekko-project/admin
npm install
npm run dev
```

访问：
- 客户端: http://localhost:5173
- 管理后台: http://localhost:5174
- 后端 API: http://localhost:3001

### 模式 2: 生产模式（使用 Supabase + R2）

适合生产部署，提供完整的安全特性。

#### 前置准备

1. **创建 Supabase 项目**
   - 访问 https://supabase.com
   - 创建新项目
   - 执行 `server/supabase-schema.sql` 创建表

2. **创建 Cloudflare R2 Bucket**
   - 访问 https://dash.cloudflare.com
   - 创建 R2 bucket: `ekko-courses`
   - 生成 API Token

3. **配置环境变量**

创建 `server/.env`:

```bash
# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=ekko-courses

# CORS
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

#### 启动服务

```bash
# 1. 启动安全后端
cd ekko-project/server
npm install
node index-secure.js

# 2. 启动客户端
cd ekko-project/client
npm install
npm run dev

# 3. 启动管理后台
cd ekko-project/admin
npm install
npm run dev
```

## 数据迁移（从 LowDB 到 Supabase）

如果你已经有 LowDB 数据需要迁移：

```bash
cd ekko-project/server

# 1. 备份现有数据
cp db/data/users.json db/data/users.json.backup
cp db/data/courses.json db/data/courses.json.backup
cp db/data/orders.json db/data/orders.json.backup

# 2. 运行迁移脚本
node migrate-to-supabase.js

# 3. 验证数据
# 在 Supabase Dashboard 中检查表数据
```

详细迁移指南请查看 [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

## 功能测试

### 测试用户注册和登录

```bash
# 注册新用户
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "password123",
    "phone": "13800138000"
  }'

# 登录
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 测试 Rate Limiting

```bash
# 快速发送多个请求，触发限流
for i in {1..10}; do
  curl http://localhost:3001/api/courses
done
```

### 测试安全下载

```bash
# 1. 获取 token（从登录响应中）
TOKEN="your-jwt-token"

# 2. 请求下载链接
curl -X GET http://localhost:3001/api/download/file-id \
  -H "Authorization: Bearer $TOKEN"

# 3. 使用返回的签名 URL 下载文件（5分钟内有效）
```

## 常见问题

### Q: 端口被占用

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Q: Supabase 连接失败

检查：
1. `.env` 文件中的 URL 和 Key 是否正确
2. Supabase 项目是否已创建表
3. 网络是否可以访问 Supabase

```bash
# 测试连接
curl https://your-project.supabase.co/rest/v1/
```

### Q: R2 上传失败

检查：
1. R2 凭证是否正确
2. Bucket 名称是否匹配
3. CORS 是否已配置

### Q: Rate Limit 太严格

调整 `.env` 中的限流配置：

```bash
RATE_LIMIT_MAX_REQUESTS=200  # 增加到 200 次
LOGIN_RATE_LIMIT_MAX_REQUESTS=10  # 登录增加到 10 次
```

## 开发建议

### 1. 使用 nodemon 自动重启

```bash
npm install -g nodemon
nodemon index-secure.js
```

### 2. 查看实时日志

```bash
# 开发模式
tail -f server.log

# 生产模式（使用 PM2）
pm2 logs ekko-server --lines 100
```

### 3. 数据库管理

使用 Supabase Dashboard:
- SQL Editor: 执行查询
- Table Editor: 可视化编辑
- Database: 查看性能指标

### 4. 调试技巧

在 `index-secure.js` 中添加调试日志：

```javascript
// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
```

## 性能优化

### 1. 启用 Gzip 压缩

```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. 添加响应缓存

```javascript
const apicache = require('apicache');
let cache = apicache.middleware;

// 缓存课程列表 5 分钟
app.get('/api/courses', cache('5 minutes'), async (req, res) => {
  // ...
});
```

### 3. 数据库连接池

Supabase 自动管理连接池，但可以优化查询：

```javascript
// 使用 select 指定字段
const { data } = await supabase
  .from('courses')
  .select('id, title, price, image_url')  // 只查询需要的字段
  .eq('status', 'active');
```

## 下一步

- 📖 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解生产部署
- 🔄 阅读 [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) 了解数据迁移
- 🔒 查看 [SECURITY.md](./SECURITY.md) 了解安全最佳实践
- 📊 配置监控和告警系统

## 获取帮助

- 📧 Email: support@ekko.com
- 💬 Discord: https://discord.gg/ekko
- 📝 Issues: https://github.com/your-repo/issues
- 📚 文档: https://docs.ekko.com
