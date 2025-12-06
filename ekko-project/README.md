# Ekko - 商业级知识付费平台 (Production Ready)

Ekko 是一个基于 **MERN Stack (MySQL/PostgreSQL + Express + React + Node.js)** 架构的现代化知识付费平台。本项目已进行全端重构，支持 **移动端优先 (Mobile First)**、**全站动态配置 (Dynamic CMS)** 和 **商业级部署**。

## 🚀 核心功能

### 📱 前台 (Client)
- **移动端优先**: 针对手机端设计的 Hamburger Menu、触摸友好的布局与交互。
- **响应式设计**: 完美适配 Mobile, Tablet, Desktop (`grid-cols-1` -> `grid-cols-3`)。
- **全站动态化**: 首页标题、Logo、Banner、Footer 文案均由后台配置，拒绝硬编码。
- **SEO 增强**: 集成 `react-helmet-async`，自动生成每个课程页面的 Meta Tags 和 Open Graph 信息。
- **营销工具**: 优惠券系统 (Coupons)、限时折扣倒计时、Toast 通知 (`sonner`)。
- **支付流程**: 模拟支付 + 订单系统 + 防盗链视频播放。

### 🛠 后台 (Admin)
- **CMS 面板**: 
  - **全站设置**: 可视化修改网站标题、SEO 描述、Logo、Banner 图片。
  - **课程管理**: 富文本编辑器 (Quill)、真实图片上传 (Cloudflare R2)。
- **数据看板**: 
  - 实时 PV/UV 统计、地理位置分布 (GeoIP)、设备分布、访问时间段分析。
- **用户管理**: 用户列表、角色权限控制 (Admin/User)、停用账号。

### ⚡️ API 服务 (Server)
- **RESTful API**: 标准化接口设计。
- **安全性**: Helmet 安全头、CORS 策略、Rate Limit (限流)、JWT 认证。
- **存储**: 集成 **Cloudflare R2** (AWS S3 兼容) 用于低成本存储图片资源。
- **数据库**: **Supabase (PostgreSQL)** 托管核心业务数据。

---

## 📂 目录结构

```bash
my-ekko-project/
├── ekko-project/
│   ├── client/              # 前台应用 (Vite + React + Tailwind)
│   │   ├── src/
│   │   │   ├── contexts/    # ConfigContext (动态配置核心)
│   │   │   ├── components/  # Navbar (移动端适配), CourseCard 等
│   │   │   └── pages/       # Home, CourseDetail (SEO)
│   │   └── vite.config.js   # 构建优化 (Chunking)
│   │
│   ├── admin/               # 后台管理 (Vite + React + Recharts)
│   │   ├── src/             # AdminApp, SiteSettings (CMS)
│   │
│   ├── server/              # 后端 API (Express)
│   │   ├── index.js         # 核心入口 (Auth, Order, Config, Upload)
│   │   ├── phase1-schema.sql # 数据库初始化 SQL
│   │   └── package.json
│   │
│   ├── .gitignore           # 严格的 Git 忽略规则
│   └── README.md            # 项目文档
```

---

## 🚢 部署教程 (Zeabur + Supabase + Cloudflare R2)

本指南基于 **Zeabur** (PaaS) 进行一键部署，适合零基础开发者。

### 1. 准备工作
- **GitHub**: Fork 本项目到你的仓库。
- **Supabase**: 创建新项目，获取 `Database URL` 和 `Service Key`。
- **Cloudflare R2**: 创建 Bucket，获取 `Access Key`, `Secret Key`, `Account ID`。

### 2. 数据库初始化
1. 登录 Supabase Dashboard -> SQL Editor。
2. 复制 `server/phase1-schema.sql` 的内容。
3. 点击 **Run** 执行，创建表结构和预置数据。

### 3. 环境变量清单
在部署时，需配置以下环境变量：

#### Server (后端)
```env
PORT=3001
FRONTEND_URL=https://your-client-domain.zeabur.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-jwt-key

# Cloudflare R2 (图片存储)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_DOMAIN=https://pub-xxx.r2.dev (或自定义域名)
```

#### Client & Admin (前端)
前端构建时需要注入 API 地址：
```env
VITE_API_URL=https://your-server-domain.zeabur.app/api
```

### 4. Zeabur 部署步骤
1. 登录 Zeabur -> Create Project。
2. **部署 Server**:
   -选择 GitHub 仓库 -> `ekko-project/server` 目录。
   - 填写上述 **Server 环境变量**。
   - 绑定域名 (例如 `api-ekko.zeabur.app`)。
3. **部署 Admin**:
   - 选择 GitHub 仓库 -> `ekko-project/admin` 目录。
   - 添加变量 `VITE_API_URL` 指向你的 Server 域名。
   - 绑定域名 (例如 `admin-ekko.zeabur.app`)。
4. **部署 Client**:
   - 选择 GitHub 仓库 -> `ekko-project/client` 目录。
   - 添加变量 `VITE_API_URL` 指向你的 Server 域名。
   - 绑定域名 (例如 `ekko.zeabur.app`)。

---

## 🛠 本地开发

1. **安装依赖**:
   ```bash
   cd ekko-project/server && npm install
   cd ../client && npm install
   cd ../admin && npm install
   ```

2. **配置环境**:
   - 复制 `server/.env.example` 为 `server/.env` 并填入 Key。
   - 确保 `client` 和 `admin` 中的 `api.js` 或 `.env` 指向 `http://localhost:3001/api`。

3. **启动**:
   ```bash
   # 终端 1: 启动后端
   cd server && npm run dev

   # 终端 2: 启动前台
   cd client && npm run dev

   # 终端 3: 启动后台
   cd admin && npm run dev
   ```

## 🧹 代码优化
- **Strict .gitignore**: 已配置严格的忽略规则，防止敏感文件上传。
- **Tree-shaking**: 前端构建启用了 `manualChunks`，将 React 核心库拆分为独立 Chunk，优化加载速度。
- **Modular Imports**: 后端 AWS SDK 采用模块化引入，减少包体积。

---
**Ekko Team** © 2025
