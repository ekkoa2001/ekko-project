# 🚀 Ekko 快速部署命令

## 一键复制命令

### 1️⃣ 初始化 Git 并推送到 GitHub

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: Ekko project ready for Zeabur deployment"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ekko-project.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

### 2️⃣ 生成 JWT Secret

```bash
# 在终端执行，复制输出结果
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3️⃣ Zeabur 环境变量（复制到 Zeabur Dashboard）

```bash
# === 必需变量 ===

# Supabase（从 Supabase Dashboard > Settings > API 获取）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT（使用上面生成的）
JWT_SECRET=你生成的32字符随机字符串

# Cloudflare R2（从 Cloudflare Dashboard > R2 获取）
R2_ACCOUNT_ID=你的账号ID
R2_ACCESS_KEY_ID=你的访问密钥ID
R2_SECRET_ACCESS_KEY=你的密钥
R2_BUCKET_NAME=ekko-courses

# === 可选变量 ===

# Node 环境
NODE_ENV=production

# 前端 URL（部署前端后更新）
FRONTEND_URL=https://your-frontend.zeabur.app
```

---

### 4️⃣ 测试部署

```bash
# Windows PowerShell
cd ekko-project/server
.\test-api.ps1 -ApiUrl "https://your-api.zeabur.app"

# Linux/Mac
cd ekko-project/server
chmod +x test-api.sh
./test-api.sh https://your-api.zeabur.app
```

---

### 5️⃣ 后续更新

```bash
# 修改代码后
git add .
git commit -m "描述你的更改"
git push origin main

# Zeabur 会自动重新部署
```

---

## 📋 Zeabur 服务配置

### 后端服务

```
Service Name: ekko-server
Repository: your-username/ekko-project
Branch: main
Root Directory: ekko-project/server
Build Command: npm install (自动)
Start Command: npm start (自动)
```

### 前端服务（可选）

```
Service Name: ekko-client
Repository: your-username/ekko-project
Branch: main
Root Directory: ekko-project/client
Build Command: npm run build
Output Directory: dist
Environment Variables:
  VITE_API_URL=https://ekko-server-xxxxx.zeabur.app/api
```

---

## 🔗 重要链接

- **GitHub**: https://github.com
- **Zeabur**: https://zeabur.com
- **Supabase**: https://supabase.com
- **Cloudflare**: https://dash.cloudflare.com

---

## ✅ 检查清单

部署前确认：

- [ ] `.gitignore` 文件已创建
- [ ] `.env` 文件未上传到 GitHub
- [ ] `supabase-init.sql` 已在 Supabase 执行
- [ ] `supabase-functions.sql` 已在 Supabase 执行
- [ ] R2 Bucket 已创建
- [ ] 所有环境变量已准备好

部署后确认：

- [ ] GitHub 仓库可以访问
- [ ] Zeabur 服务显示 "Running"
- [ ] 健康检查返回 200
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 可以获取课程列表

---

## 🆘 快速故障排查

### GitHub 推送失败

```bash
# 检查远程仓库
git remote -v

# 重新设置远程仓库
git remote set-url origin https://github.com/YOUR_USERNAME/ekko-project.git

# 使用 Token 推送
# 1. 生成 Token: https://github.com/settings/tokens
# 2. 推送时使用 Token 作为密码
```

### Zeabur 构建失败

```bash
# 检查 package.json 是否存在
ls ekko-project/server/package.json

# 本地测试构建
cd ekko-project/server
npm install
npm start
```

### 服务启动失败

```bash
# 检查 Zeabur Logs
# 常见原因：
# 1. 环境变量未配置
# 2. Supabase URL 错误
# 3. R2 凭证错误

# 验证 Supabase 连接
curl https://your-project.supabase.co/rest/v1/
```

---

## 💡 提示

1. **不要上传 .env 文件** - 敏感信息会泄露
2. **使用强密码** - JWT_SECRET 至少 32 字符
3. **定期备份** - Supabase 自动备份，但建议手动导出
4. **监控日志** - 定期查看 Zeabur Logs
5. **测试先行** - 本地测试通过再部署

---

**准备好了吗？开始部署吧！** 🎉

详细步骤请查看: [GITHUB-ZEABUR-GUIDE.md](./GITHUB-ZEABUR-GUIDE.md)
