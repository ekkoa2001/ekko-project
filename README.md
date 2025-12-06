# Ekko Project

商业级知识付费平台 (Production Ready)

## 🚀 快速启动

```bash
# 1. 安装依赖
cd ekko-project
cd server && npm install
cd ../client && npm install
cd ../admin && npm install

# 2. 启动服务 (需开启三个终端)
# Terminal 1 (Backend)
cd server && npm run dev

# Terminal 2 (Frontend)
cd client && npm run dev

# Terminal 3 (Admin)
cd admin && npm run dev
```

## 🛠 技术栈

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Deployment**: Zeabur

## 📂 目录结构

- `client/`: 前台应用 (Mobile First)
- `server/`: 后端 API 服务
- `admin/`: 后台管理系统
- `DEPLOY_GUIDE.md`: **部署运维手册 (必读)**
