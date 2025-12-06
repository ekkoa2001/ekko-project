# 🚀 Ekko 项目部署运维手册 (Deployment Guide)

本手册将指导你如何将 Ekko 项目部署到 **Zeabur** 生产环境。

## 1. GitHub 同步指南

在将代码部署到云端之前，必须先同步到 GitHub 仓库。

### 初始化与推送
打开终端 (Terminal)，在项目根目录执行：

```bash
# 1. 初始化 Git 仓库 (如果尚未初始化)
git init

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "Release: Ekko Production Ready v1.0"

# 4. 关联远程仓库 (替换为你的 GitHub 仓库地址)
git remote add origin https://github.com/your-username/ekko-project.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 2. Zeabur 上线指南

### Step 1: 创建项目
1. 登录 [Zeabur Dashboard](https://zeabur.com)。
2. 点击 **Create Project**，选择区域（推荐 HK 或 SG）。
3. 点击 **Deploy New Service** -> **GitHub**。
4. 选择你刚刚推送的 `ekko-project` 仓库。

### Step 2: 部署 Server (后端)
1. 在 Zeabur 项目视图中，选择导入的仓库。
2. 可以在设置中修改服务名称为 `ekko-server`。
3. **配置 Root Directory**: 设置为 `ekko-project/server`。
4. **环境变量 (Environment Variables)**:
   进入 **Variables** 标签页，批量添加以下 Key-Value：
   ```text
   PORT=3001
   FRONTEND_URL=https://<你的前端域名>.zeabur.app
   SUPABASE_URL=<你的Supabase URL>
   SUPABASE_SERVICE_KEY=<你的Supabase Service Key>
   JWT_SECRET=<自定义的强密码>
   R2_ACCOUNT_ID=<Cloudflare Account ID>
   R2_ACCESS_KEY_ID=<R2 Access Key>
   R2_SECRET_ACCESS_KEY=<R2 Secret Key>
   R2_BUCKET_NAME=<R2 Bucket Name>
   R2_PUBLIC_DOMAIN=<R2 Public Domain>
   ```
5. Zeabur 会自动识别 Node.js 项目并开始构建。无需手动暴露端口，Zeabur 自动处理。

### Step 3: 部署 Client (前台)
1. 再次点击 **Deploy New Service** -> **GitHub** -> 选择同一仓库。
2. 修改服务名称为 `ekko-client`。
3. **配置 Root Directory**: 设置为 `ekko-project/client`。
4. **环境变量**:
   ```text
   VITE_API_URL=https://<你的后端服务域名>/api
   ```
   *(注意：你需要先完成 Server 的域名绑定，才能填入此项)*

### Step 4: 部署 Admin (后台)
1. 再次点击 **Deploy New Service** -> **GitHub** -> 选择同一仓库。
2. 修改服务名称为 `ekko-admin`。
3. **配置 Root Directory**: 设置为 `ekko-project/admin`。
4. **环境变量**:
   ```text
   VITE_API_URL=https://<你的后端服务域名>/api
   ```

---

## 3. 域名绑定 (Domain Binding)

Zeabur 提供免费的二级域名，也支持自定义域名。

### 生成公网域名
1. 点击对应的服务 (如 `ekko-server`)。
2. 进入 **Networking** (网络) 标签页。
3. 点击 **Generate Domain** (生成域名)。
   - 例如生成：`ekko-api-prod.zeabur.app`
4. 将此域名更新到 Client 和 Admin 的 `VITE_API_URL` 环境变量中，并**Redeploy** (重新部署)。

### 自定义域名 (CNAME)
如果你有自己的域名 (如 `ekko.com`)：
1. 在 Networking 中点击 **Custom Domain**。
2. 输入 `api.ekko.com`。
3. 在你的域名服务商 (阿里云/腾讯云/Cloudflare) 添加 CNAME 记录：
   - 主机记录: `api`
   - 记录值: `zeabur.app` (或 Zeabur 提供的具体 CNAME 地址)
4. 等待生效。

---

## ✅ 部署检查清单

- [ ] 数据库 (Supabase) 表结构已通过 SQL 初始化。
- [ ] 后端环境变量全部填入且正确。
- [ ] 前端 `VITE_API_URL` 指向了正确的后端域名。
- [ ] 访问首页，Navbar 菜单正常加载 (验证 API 通通)。
- [ ] 尝试登录后台，上传一张图片 (验证 R2 存储)。
