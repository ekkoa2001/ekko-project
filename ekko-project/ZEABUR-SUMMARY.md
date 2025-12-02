# Ekko Zeabur 部署版本总结

## 🎯 目标

创建一个针对 **Zeabur 云平台**优化的 Ekko 生产版本，使用：
- **Zeabur** - Node.js 容器托管
- **Supabase** - PostgreSQL 数据库
- **Cloudflare R2** - 对象存储

## ✅ 已完成的工作

### 1. 数据库初始化脚本

**文件**: `server/supabase-init.sql`

创建了完整的数据库结构：
- ✅ 4 个核心表（users, courses, orders, download_logs）
- ✅ 索引优化
- ✅ 自动更新时间戳触发器
- ✅ 测试数据

**使用方法**:
```sql
-- 在 Supabase SQL Editor 中执行
-- 复制 supabase-init.sql 的内容并运行
```

### 2. Supabase 辅助函数

**文件**: `server/supabase-functions.sql`

创建了 4 个辅助函数：
- ✅ `increment_download_count()` - 增加下载计数
- ✅ `check_user_purchase()` - 检查购买状态
- ✅ `get_user_downloads()` - 获取下载历史
- ✅ `get_course_download_stats()` - 获取下载统计

### 3. 生产级后端服务器

**文件**: `server/index.js`

**核心特性**:
- ✅ Express.js 标准服务器（非 Serverless）
- ✅ Supabase PostgreSQL 集成
- ✅ Cloudflare R2 集成
- ✅ Helmet 安全头
- ✅ Rate Limiting 防刷
- ✅ CORS 严格配置
- ✅ JWT 认证
- ✅ 防盗链下载（10分钟有效期）

**API 端点**:
```
GET  /health                      - 健康检查
GET  /                            - API 信息
POST /api/auth/register           - 用户注册
POST /api/auth/login              - 用户登录
GET  /api/courses                 - 获取课程列表
GET  /api/courses/:id             - 获取课程详情
GET  /api/courses/:id/download    - 安全下载（需认证）
POST /api/orders/create           - 创建订单
```

### 4. 配置文件

**文件**: `server/package.json`

- ✅ 所有必要依赖
- ✅ 启动脚本配置
- ✅ Node.js 版本要求

**文件**: `server/.env.example`

- ✅ 完整的环境变量模板
- ✅ 详细的配置说明

### 5. 部署文档

**文件**: `ZEABUR-DEPLOYMENT.md`

完整的部署指南，包括：
- ✅ Supabase 配置步骤
- ✅ Cloudflare R2 配置步骤
- ✅ Zeabur 部署步骤
- ✅ 环境变量配置
- ✅ 测试流程
- ✅ 故障排查
- ✅ 成本估算

### 6. 测试脚本

**文件**: 
- `server/test-api.sh` (Linux/Mac)
- `server/test-api.ps1` (Windows)

自动化测试脚本，测试所有 API 端点：
- ✅ 健康检查
- ✅ 用户注册/登录
- ✅ 课程列表/详情
- ✅ 订单创建
- ✅ 安全下载
- ✅ Rate Limiting

## 🔒 安全特性

### 防盗链核心实现

```javascript
// 1. 验证用户认证
verifyToken(req, res, next)

// 2. 检查购买记录
checkUserPurchase(userId, courseId)

// 3. 生成临时签名 URL（10分钟有效）
getSignedUrl(r2Client, command, { expiresIn: 600 })

// 4. 记录下载日志
download_logs.insert({ user_id, course_id, ip, user_agent })
```

### Rate Limiting

```javascript
// 全局限流：100 次/15分钟
globalLimiter: 100 requests / 15 minutes

// 登录限流：5 次/1小时
loginLimiter: 5 requests / 1 hour
```

### 安全头（Helmet）

```javascript
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
```

## 📊 架构图

```
┌─────────────────────────────────────────┐
│         Zeabur Cloud Platform           │
│  ┌───────────────────────────────────┐  │
│  │   Node.js Container               │  │
│  │   - Express.js Server             │  │
│  │   - Helmet + Rate Limiting        │  │
│  │   - JWT Authentication            │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│   Supabase    │    │ Cloudflare R2  │
│  PostgreSQL   │    │ Object Storage │
│               │    │                │
│ - users       │    │ - Course Files │
│ - courses     │    │ - Signed URLs  │
│ - orders      │    │ - 10min TTL    │
│ - logs        │    │                │
└───────────────┘    └────────────────┘
```

## 🚀 部署流程

### 快速部署（3 步）

```bash
# 1. 在 Supabase 执行 SQL
supabase-init.sql + supabase-functions.sql

# 2. 在 Zeabur 配置环境变量
SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET,
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY

# 3. 部署到 Zeabur
git push → Zeabur 自动构建部署
```

### 详细步骤

参考 [ZEABUR-DEPLOYMENT.md](./ZEABUR-DEPLOYMENT.md)

## 🧪 测试

### 本地测试

```bash
# Linux/Mac
chmod +x server/test-api.sh
./server/test-api.sh http://localhost:3001

# Windows
.\server\test-api.ps1 -ApiUrl "http://localhost:3001"
```

### 生产测试

```bash
# Linux/Mac
./server/test-api.sh https://your-api.zeabur.app

# Windows
.\server\test-api.ps1 -ApiUrl "https://your-api.zeabur.app"
```

## 💰 成本估算

### 小规模运营（100 用户）

| 服务 | 套餐 | 成本 |
|------|------|------|
| Zeabur | Hobby | $5/月 |
| Supabase | Free | $0/月 |
| Cloudflare R2 | Pay-as-you-go | ~$2/月 |
| **总计** | | **$7/月** |

### 中等规模（1000 用户）

| 服务 | 套餐 | 成本 |
|------|------|------|
| Zeabur | Pro | $20/月 |
| Supabase | Pro | $25/月 |
| Cloudflare R2 | Pay-as-you-go | ~$10/月 |
| **总计** | | **$55/月** |

## 📝 环境变量清单

### 必需变量

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-32-char-secret
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=ekko-courses
```

### 可选变量

```bash
FRONTEND_URL=https://your-frontend.zeabur.app
NODE_ENV=production
PORT=3001
```

## 🔍 监控和日志

### Zeabur 日志

```bash
# 在 Zeabur Dashboard 中查看
Logs → Real-time logs
```

### Supabase 监控

```bash
# 在 Supabase Dashboard 中查看
Database → Reports
- Query Performance
- Connection Pool
- Disk Usage
```

### Cloudflare R2 监控

```bash
# 在 Cloudflare Dashboard 中查看
R2 → Metrics
- Storage Usage
- Request Count
- Bandwidth
```

## 🎓 最佳实践

### 1. 安全

- ✅ 定期更换 JWT_SECRET
- ✅ 监控异常登录
- ✅ 限制下载次数
- ✅ 使用 HTTPS

### 2. 性能

- ✅ 启用 CDN
- ✅ 使用数据库索引
- ✅ 缓存课程列表
- ✅ 压缩响应

### 3. 可靠性

- ✅ 健康检查端点
- ✅ 错误日志记录
- ✅ 数据库备份
- ✅ 优雅关闭

## 📞 获取帮助

### 文档

- [Zeabur 部署指南](./ZEABUR-DEPLOYMENT.md)
- [API 测试脚本](./server/test-api.sh)
- [环境变量模板](./server/.env.example)

### 社区

- GitHub Issues
- Discord 社区
- Email 支持

## 🎉 下一步

1. ✅ 部署到 Zeabur
2. ⏳ 配置自定义域名
3. ⏳ 添加支付网关
4. ⏳ 实现邮件通知
5. ⏳ 添加数据分析

---

**恭喜！你的 Ekko 项目已准备好部署到 Zeabur！** 🚀

开始部署: [ZEABUR-DEPLOYMENT.md](./ZEABUR-DEPLOYMENT.md)
