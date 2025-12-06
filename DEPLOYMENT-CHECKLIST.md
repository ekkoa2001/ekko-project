# Ekko 海外部署检查清单

## 🎯 目标
将 Ekko 项目部署到海外服务器，无需备案，让客户可以正常访问。

---

## 📝 部署前准备

### 1. 注册必要的账号

- [ ] **Supabase 账号** - https://supabase.com （数据库）
  - 用途：存储用户、课程、订单数据
  - 费用：免费版足够（500MB 数据库）
  
- [ ] **Cloudflare 账号** - https://dash.cloudflare.com （文件存储）
  - 用途：存储课程文件、图片
  - 费用：按量付费（约 $2/月）
  
- [ ] **Zeabur 账号** - https://zeabur.com （部署平台）
  - 用途：运行你的应用
  - 费用：$5-20/月（或免费试用）

---

## 🗄️ Step 1: 配置 Supabase 数据库

### 1.1 创建项目
1. 访问 https://app.supabase.com
2. 点击 "New Project"
3. 填写信息：
   - Name: `ekko-production`
   - Database Password: **记住这个密码！**
   - Region: 选择 `Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`

### 1.2 初始化数据库
1. 在 Supabase Dashboard，点击左侧 **SQL Editor**
2. 打开你本地项目的 `ekko-project/server/supabase-init.sql` 文件
3. 复制全部内容
4. 粘贴到 SQL Editor
5. 点击 **Run** 按钮
6. 等待执行完成（应该显示成功）

### 1.3 获取连接信息
1. 点击左侧 **Settings** > **API**
2. 记录以下信息（复制到记事本）：

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **重要**：我们需要使用 `service_role key`（不是 anon key）

---

## 📦 Step 2: 配置 Cloudflare R2 存储

### 2.1 创建 R2 Bucket
1. 访问 https://dash.cloudflare.com
2. 点击左侧 **R2**
3. 点击 **Create bucket**
4. Bucket 名称：`ekko-courses`
5. 位置：自动选择
6. 点击 **Create bucket**

### 2.2 生成 API Token
1. 在 R2 页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 权限选择：**Object Read & Write**
4. 点击 **Create API Token**
5. 记录以下信息（复制到记事本）：

```
Access Key ID: xxxxxxxxxxxxx
Secret Access Key: xxxxxxxxxxxxx
```

6. 在 R2 主页右侧找到并记录：
```
Account ID: xxxxxxxxxxxxx
```

---

## 🚀 Step 3: 部署到 Zeabur

### 3.1 连接 GitHub
1. 访问 https://dash.zeabur.com
2. 使用 GitHub 账号登录
3. 点击 **New Project**
4. 点击 **Deploy New Service**
5. 选择 **Git**
6. 授权 Zeabur 访问你的 GitHub
7. 选择仓库：`ekkoa2001/ekko-project`

### 3.2 配置后端服务
1. Zeabur 会自动检测到项目
2. 服务名称：`ekko-server`
3. 根目录：`ekko-project/server`
4. 点击 **Deploy**

### 3.3 配置环境变量
1. 在服务页面，点击 **Variables** 标签
2. 添加以下环境变量（使用你之前记录的信息）：

```bash
# Supabase 配置
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=你的service_role_key

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=ekko-super-secret-key-2024-production-min-32-chars

# Cloudflare R2 配置
R2_ACCOUNT_ID=你的account_id
R2_ACCESS_KEY_ID=你的access_key
R2_SECRET_ACCESS_KEY=你的secret_key
R2_BUCKET_NAME=ekko-courses

# Node 环境
NODE_ENV=production

# CORS（先留空，部署前端后再填）
FRONTEND_URL=
ADMIN_URL=
```

### 3.4 获取后端 URL
部署完成后，Zeabur 会给你一个域名，例如：
```
https://ekko-server-xxxxx.zeabur.app
```

记录这个 URL！

---

## 🎨 Step 4: 部署前端（客户端）

### 4.1 添加前端服务
1. 在同一个 Zeabur 项目中，点击 **Add Service**
2. 选择 **Git**（同一个仓库）
3. 服务名称：`ekko-client`
4. 根目录：`ekko-project/client`

### 4.2 配置前端环境变量
在 Variables 中添加：

```bash
VITE_API_URL=https://ekko-server-xxxxx.zeabur.app/api
```

（替换为你的后端 URL）

### 4.3 获取前端 URL
部署完成后，记录前端 URL：
```
https://ekko-client-xxxxx.zeabur.app
```

---

## 🔧 Step 5: 部署管理后台

### 5.1 添加管理后台服务
1. 再次点击 **Add Service**
2. 选择 **Git**（同一个仓库）
3. 服务名称：`ekko-admin`
4. 根目录：`ekko-project/admin`

### 5.2 配置管理后台环境变量
```bash
VITE_API_URL=https://ekko-server-xxxxx.zeabur.app/api
```

### 5.3 获取管理后台 URL
```
https://ekko-admin-xxxxx.zeabur.app
```

---

## 🔄 Step 6: 更新后端 CORS

现在你有了前端和管理后台的 URL，需要更新后端的 CORS 配置：

1. 回到 `ekko-server` 服务
2. 点击 **Variables**
3. 更新以下变量：

```bash
FRONTEND_URL=https://ekko-client-xxxxx.zeabur.app
ADMIN_URL=https://ekko-admin-xxxxx.zeabur.app
```

4. 保存后，Zeabur 会自动重新部署

---

## ✅ Step 7: 测试部署

### 7.1 测试后端健康检查
在浏览器访问：
```
https://ekko-server-xxxxx.zeabur.app/health
```

应该看到：
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

### 7.2 测试前端
访问：
```
https://ekko-client-xxxxx.zeabur.app
```

应该能看到你的课程平台首页。

### 7.3 测试注册和登录
1. 在前端页面注册一个新账号
2. 尝试登录
3. 浏览课程列表

### 7.4 测试管理后台
访问：
```
https://ekko-admin-xxxxx.zeabur.app
```

使用管理员账号登录（需要在数据库中手动设置第一个管理员）。

---

## 🎯 完成检查清单

- [ ] Supabase 数据库已创建并初始化
- [ ] Cloudflare R2 Bucket 已创建
- [ ] 后端服务已部署到 Zeabur
- [ ] 前端已部署到 Zeabur
- [ ] 管理后台已部署到 Zeabur
- [ ] 所有环境变量已正确配置
- [ ] CORS 已更新
- [ ] 健康检查通过
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以浏览课程
- [ ] 管理后台可以访问

---

## 🌐 你的部署地址

部署完成后，记录你的三个地址：

```
后端 API: https://ekko-server-xxxxx.zeabur.app
客户端: https://ekko-client-xxxxx.zeabur.app
管理后台: https://ekko-admin-xxxxx.zeabur.app
```

**分享给客户的地址：**
- 客户访问：`https://ekko-client-xxxxx.zeabur.app`
- 管理员访问：`https://ekko-admin-xxxxx.zeabur.app`

---

## 💰 成本估算

- **Zeabur**: $5-20/月（或免费试用）
- **Supabase**: $0/月（免费版）
- **Cloudflare R2**: ~$2/月（100GB 存储）
- **总计**: $7-22/月

---

## 🆘 遇到问题？

### 问题 1: 部署失败
- 检查 Zeabur Logs 查看错误信息
- 确认环境变量是否正确配置

### 问题 2: 前端无法连接后端
- 检查 `VITE_API_URL` 是否正确
- 检查后端 CORS 配置

### 问题 3: 数据库连接失败
- 检查 `SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY`
- 确认 SQL 脚本已执行

### 问题 4: 文件上传失败
- 检查 R2 配置是否正确
- 确认 API Token 权限足够

---

## 📚 相关文档

- 详细部署指南：`ekko-project/ZEABUR-DEPLOYMENT.md`
- 快速启动：`ekko-project/QUICK-START.md`
- 安全检查：`ekko-project/SECURITY-CHECKLIST.md`

---

## 🎉 恭喜！

你的 Ekko 课程平台已成功部署到海外服务器！

**无需备案，客户可以直接访问！** 🚀
