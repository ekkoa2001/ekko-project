# GitHub 上传 + Zeabur 部署完整指南

## 📋 前置准备

- ✅ GitHub 账号
- ✅ Zeabur 账号（使用 GitHub 登录）
- ✅ Git 已安装

---

## Step 1: 创建 .gitignore 文件

首先，确保不上传敏感信息和不必要的文件。

在项目根目录创建 `.gitignore`:

```bash
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 环境变量（重要！）
.env
.env.local
.env.production.local
.env.development.local

# 构建输出
dist/
build/
*.log

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 数据库文件（如果有本地数据）
ekko-project/server/db/data/*.json
!ekko-project/server/db/data/.gitkeep

# 临时文件
*.tmp
*.temp
```

---

## Step 2: 初始化 Git 仓库

打开终端（PowerShell 或 CMD），在项目根目录执行：

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 创建第一次提交
git commit -m "Initial commit: Ekko project with Zeabur deployment support"
```

---

## Step 3: 在 GitHub 创建仓库

### 方法 1: 通过 GitHub 网站

1. 访问 https://github.com
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - Repository name: `ekko-project`
   - Description: `Ekko - 在线课程销售平台`
   - 选择 **Public** 或 **Private**
   - ⚠️ **不要**勾选 "Initialize with README"
4. 点击 **Create repository**

### 方法 2: 使用 GitHub CLI（可选）

```bash
# 安装 GitHub CLI: https://cli.github.com/
gh repo create ekko-project --public --source=. --remote=origin
```

---

## Step 4: 连接并推送到 GitHub

在终端执行：

```bash
# 1. 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/ekko-project.git

# 2. 推送到 GitHub
git branch -M main
git push -u origin main
```

**如果遇到认证问题：**

```bash
# 使用 Personal Access Token
# 1. 访问 https://github.com/settings/tokens
# 2. 生成新 Token (classic)
# 3. 勾选 repo 权限
# 4. 复制 Token
# 5. 推送时使用 Token 作为密码
```

---

## Step 5: 验证上传成功

访问你的 GitHub 仓库：
```
https://github.com/YOUR_USERNAME/ekko-project
```

应该看到所有文件已上传。

---

## Step 6: 部署到 Zeabur

### 6.1 登录 Zeabur

1. 访问 https://zeabur.com
2. 点击 **Sign in with GitHub**
3. 授权 Zeabur 访问你的 GitHub

### 6.2 创建新项目

1. 在 Zeabur Dashboard，点击 **Create Project**
2. 输入项目名称：`ekko-production`
3. 选择区域（推荐：Hong Kong 或 Tokyo）
4. 点击 **Create**

### 6.3 部署后端服务

1. 在项目中，点击 **Add Service**
2. 选择 **Git**
3. 选择你的 GitHub 仓库：`ekko-project`
4. Zeabur 会自动检测到 `ekko-project/server/package.json`

**配置服务：**
- Service Name: `ekko-server`
- Branch: `main`
- Root Directory: `ekko-project/server`
- Build Command: 自动检测（`npm install`）
- Start Command: 自动检测（`npm start`）

5. 点击 **Deploy**

### 6.4 配置环境变量

在服务部署后，点击服务 → **Variables** 标签：

```bash
# 必需变量
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=生成一个32字符随机字符串
R2_ACCOUNT_ID=你的Cloudflare账号ID
R2_ACCESS_KEY_ID=你的R2访问密钥
R2_SECRET_ACCESS_KEY=你的R2密钥
R2_BUCKET_NAME=ekko-courses

# 可选变量
NODE_ENV=production
FRONTEND_URL=https://your-frontend.zeabur.app
```

**生成 JWT_SECRET:**
```bash
# 在本地终端执行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. 点击 **Save** 并等待服务重启

### 6.5 获取服务域名

部署成功后，Zeabur 会自动分配一个域名：

```
https://ekko-server-xxxxx.zeabur.app
```

点击服务 → **Networking** 标签查看。

### 6.6 测试后端

```bash
# 测试健康检查
curl https://ekko-server-xxxxx.zeabur.app/health

# 应该返回
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "service": "Ekko API Server"
}
```

---

## Step 7: 部署前端（可选）

### 7.1 添加前端服务

1. 在同一个 Zeabur 项目中，点击 **Add Service**
2. 选择 **Git**
3. 选择同一个仓库：`ekko-project`

**配置服务：**
- Service Name: `ekko-client`
- Branch: `main`
- Root Directory: `ekko-project/client`
- Build Command: `npm run build`
- Output Directory: `dist`

### 7.2 配置前端环境变量

```bash
VITE_API_URL=https://ekko-server-xxxxx.zeabur.app/api
```

### 7.3 更新后端 CORS

回到后端服务，更新环境变量：

```bash
FRONTEND_URL=https://ekko-client-xxxxx.zeabur.app
```

---

## Step 8: 配置 Supabase（如果还没配置）

### 8.1 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 **New Project**
3. 填写信息并创建

### 8.2 执行数据库初始化

1. 在 Supabase Dashboard，进入 **SQL Editor**
2. 复制 `ekko-project/server/supabase-init.sql` 的内容
3. 粘贴并点击 **Run**
4. 等待执行完成

### 8.3 执行辅助函数

1. 复制 `ekko-project/server/supabase-functions.sql` 的内容
2. 在 SQL Editor 中粘贴并运行

### 8.4 获取 Supabase 凭证

在 Supabase Dashboard → **Settings** → **API**:

```
Project URL: https://xxxxx.supabase.co
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ 使用 `service_role key`，不是 `anon key`

---

## Step 9: 配置 Cloudflare R2（如果还没配置）

### 9.1 创建 R2 Bucket

1. 访问 https://dash.cloudflare.com
2. 进入 **R2 Object Storage**
3. 点击 **Create bucket**
4. 名称：`ekko-courses`

### 9.2 生成 API Token

1. 点击 **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 权限：**Object Read & Write**
4. 记录：
   - Access Key ID
   - Secret Access Key
   - Account ID（在 R2 主页右侧）

---

## Step 10: 完整测试

### 10.1 运行测试脚本

```bash
# Windows
cd ekko-project/server
.\test-api.ps1 -ApiUrl "https://ekko-server-xxxxx.zeabur.app"

# Linux/Mac
cd ekko-project/server
chmod +x test-api.sh
./test-api.sh https://ekko-server-xxxxx.zeabur.app
```

### 10.2 手动测试

```bash
# 1. 注册用户
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# 2. 登录
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 保存返回的 token

# 3. 获取课程列表
curl https://ekko-server-xxxxx.zeabur.app/api/courses

# 4. 创建订单（需要 token）
curl -X POST https://ekko-server-xxxxx.zeabur.app/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "courseId": "课程ID",
    "amount": 299
  }'

# 5. 下载课程（需要 token 和购买记录）
curl https://ekko-server-xxxxx.zeabur.app/api/courses/课程ID/download \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 后续更新流程

当你修改代码后，推送到 GitHub，Zeabur 会自动重新部署：

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "描述你的更改"

# 3. 推送到 GitHub
git push origin main

# 4. Zeabur 自动检测并重新部署（约 2-3 分钟）
```

---

## 🎯 自定义域名（可选）

### 在 Zeabur 中配置

1. 进入服务 → **Networking** 标签
2. 点击 **Add Domain**
3. 输入你的域名：`api.yourdomain.com`
4. 在你的 DNS 提供商添加 CNAME 记录：
   ```
   CNAME api.yourdomain.com → ekko-server-xxxxx.zeabur.app
   ```
5. 等待 DNS 生效（几分钟到几小时）
6. Zeabur 自动配置 SSL 证书

---

## 🔍 故障排查

### 问题 1: 推送到 GitHub 失败

**错误**: `Permission denied`

**解决**:
```bash
# 使用 Personal Access Token
# 1. 生成 Token: https://github.com/settings/tokens
# 2. 推送时使用 Token 作为密码
```

### 问题 2: Zeabur 构建失败

**检查**:
1. 查看 Zeabur Logs
2. 确认 `package.json` 路径正确
3. 确认所有依赖都在 `package.json` 中

**解决**:
```bash
# 在本地测试构建
cd ekko-project/server
npm install
npm start
```

### 问题 3: 服务启动失败

**检查**:
1. 查看 Zeabur Logs
2. 确认所有环境变量已配置
3. 确认 Supabase 和 R2 凭证正确

**解决**:
```bash
# 测试 Supabase 连接
curl https://your-project.supabase.co/rest/v1/

# 检查环境变量
# 在 Zeabur Dashboard → Service → Variables
```

### 问题 4: CORS 错误

**症状**: 前端无法访问 API

**解决**:
1. 确认 `FRONTEND_URL` 环境变量正确
2. 重启后端服务
3. 清除浏览器缓存

---

## 📊 监控和维护

### Zeabur 监控

在 Zeabur Dashboard 中查看：
- **Logs**: 实时日志
- **Metrics**: CPU、内存使用
- **Deployments**: 部署历史

### Supabase 监控

在 Supabase Dashboard 中查看：
- **Database** → **Reports**: 查询性能
- **Database** → **Backups**: 备份状态

### Cloudflare R2 监控

在 Cloudflare Dashboard 中查看：
- **R2** → **Metrics**: 存储和请求统计

---

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Zeabur 服务已创建
- [ ] 所有环境变量已配置
- [ ] Supabase 数据库已初始化
- [ ] Cloudflare R2 Bucket 已创建
- [ ] 健康检查通过
- [ ] 注册/登录功能正常
- [ ] 课程列表可以获取
- [ ] 订单创建功能正常
- [ ] 下载功能正常
- [ ] 日志正常输出
- [ ] 自定义域名已配置（如需要）

---

## 🎉 完成！

你的 Ekko 项目现在已经：
- ✅ 托管在 GitHub
- ✅ 部署在 Zeabur
- ✅ 使用 Supabase 数据库
- ✅ 使用 Cloudflare R2 存储
- ✅ 自动 HTTPS
- ✅ 全球 CDN

**访问你的 API:**
```
https://ekko-server-xxxxx.zeabur.app
```

**下一步:**
1. 配置自定义域名
2. 添加支付网关
3. 实现邮件通知
4. 优化性能

---

## 📞 需要帮助？

- **Zeabur 文档**: https://zeabur.com/docs
- **GitHub 文档**: https://docs.github.com
- **Supabase 文档**: https://supabase.com/docs
- **Cloudflare R2 文档**: https://developers.cloudflare.com/r2/

**祝你部署顺利！** 🚀
