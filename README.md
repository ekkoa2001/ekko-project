# Ekko Project

这是一个使用 React、Node.js 和 Express 构建的全栈在线课程销售平台。

## 技术栈

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Tailwind CSS** - 样式框架
- **React Quill** - 富文本编辑器
- **DOMPurify** - XSS 防护
- **Lucide React** - 图标库

### 后端
- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **Supabase (PostgreSQL)** - 生产级数据库
- **Cloudflare R2** - 对象存储（兼容 S3）
- **JWT** - 身份认证
- **bcrypt** - 密码加密
- **Helmet** - 安全头
- **express-rate-limit** - 请求限流

### 开发环境（可选）
- **LowDB** - 本地开发用 JSON 数据库

## 功能特性

### 用户端
- ✅ 用户注册和登录
- ✅ 课程浏览和搜索
- ✅ 课程详情查看
- ✅ 课程购买和支付
- ✅ 开屏引导动画
- ✅ 响应式设计

### 管理后台
- ✅ 课程管理（创建、编辑、删除）
- ✅ 富文本编辑器
- ✅ 图片上传
- ✅ 订单管理和退款
- ✅ 用户管理
- ✅ 销售统计
- ✅ 活动日志查看
- ✅ IP 地址追踪

## 快速开始

### 部署选项

#### 选项 1: 生产部署（推荐）- Zeabur

**一键部署到 Zeabur 云平台：**

1. 阅读 [ZEABUR-DEPLOYMENT.md](./ekko-project/ZEABUR-DEPLOYMENT.md)
2. 配置 Supabase 数据库
3. 配置 Cloudflare R2 存储
4. 在 Zeabur 中部署

**优势：**
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动扩展
- ✅ 零运维

#### 选项 2: 本地开发

### 前置要求

- Node.js 16+ 
- npm 或 yarn

### 安装步骤

你需要打开 **3 个独立的终端窗口** 来分别启动后端、客户端和管理后台。

#### 1. 启动后端服务 (Terminal 1)

```bash
# 进入后端目录
cd ekko-project/server

# 安装依赖
npm install

# 启动服务 (运行在 http://localhost:3001)
npm start
```

#### 2. 启动客户端 (Terminal 2)

```bash
# 进入客户端目录
cd ekko-project/client

# 安装依赖
npm install

# 启动开发服务器 (运行在 http://localhost:5173)
npm run dev
```

#### 3. 启动管理后台 (Terminal 3)

```bash
# 进入管理后台目录
cd ekko-project/admin

# 安装依赖
npm install

# 启动开发服务器 (运行在 http://localhost:5174)
npm run dev
```

## 访问地址

- **后端 API**: http://localhost:3001
- **客户端**: http://localhost:5173
- **管理后台**: http://localhost:5174

## 环境变量

### 客户端 (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### 管理后台 (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### 后端 (.env)
```
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## API 文档

### 认证接口

#### 注册
```
POST /api/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 登录
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 课程接口

#### 获取所有课程
```
GET /api/courses
```

#### 获取课程详情
```
GET /api/courses/:id
```

#### 创建课程 (需要管理员权限)
```
POST /api/admin/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "课程标题",
  "price": 299,
  "category": "分类",
  "description": "课程描述",
  "image": "图片URL"
}
```

### 订单接口

#### 创建订单 (需要认证)
```
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": 1,
  "amount": 299,
  "paymentMethod": "wechat"
}
```

#### 退款 (需要管理员权限)
```
POST /api/admin/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "ORD-1234567890"
}
```

### 用户管理接口

#### 获取用户列表 (需要管理员权限)
```
GET /api/admin/users?search=keyword
Authorization: Bearer <token>
```

#### 更新用户角色 (需要管理员权限)
```
PUT /api/admin/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

## 项目结构

```
ekko-project/
├── client/                 # 客户端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   └── App.jsx        # 主应用组件
│   └── package.json
├── admin/                  # 管理后台
│   ├── src/
│   │   └── AdminApp.jsx   # 管理后台主组件
│   └── package.json
└── server/                 # 后端服务
    ├── db/                # 数据库
    ├── middleware/        # 中间件
    ├── routes/            # 路由
    ├── index.js           # 服务器入口
    └── package.json
```

## 数据存储

项目使用 LowDB 作为数据库，数据以 JSON 文件形式存储在 `server/db/data/` 目录下：

- `courses.json` - 课程数据
- `users.json` - 用户数据
- `orders.json` - 订单数据
- `activityLogs.json` - 活动日志

## 安全特性

### 基础安全
- ✅ 密码使用 bcrypt 加密存储
- ✅ JWT Token 认证（24小时过期）
- ✅ XSS 防护 (DOMPurify)
- ✅ CORS 严格配置
- ✅ IP 地址追踪
- ✅ 活动日志记录
- ✅ 文件上传验证（类型、大小）

### 生产级安全（新增）
- ✅ **Helmet** - 安全 HTTP 头
- ✅ **Rate Limiting** - 防爆破攻击
  - 全局：100次/15分钟
  - 登录：5次/1小时
- ✅ **动态水印** - 防录屏盗版
- ✅ **安全下载** - 临时签名 URL（5分钟有效）
- ✅ **下载次数限制** - 每个文件最多下载5次
- ✅ **Supabase RLS** - 行级安全策略
- ✅ **Cloudflare R2** - 安全文件存储

## 开发指南

### 添加新的 API 端点

1. 在 `server/index.js` 中添加路由
2. 实现业务逻辑
3. 添加必要的中间件（认证、权限检查）
4. 更新 API 文档

### 添加新的前端页面

1. 在 `client/src/pages/` 创建页面组件
2. 在 `App.jsx` 中添加路由
3. 更新导航组件

### 数据库迁移

当前使用 LowDB，适合开发和小规模应用。生产环境建议迁移到：
- PostgreSQL
- MongoDB
- MySQL

## 常见问题

### 后端无法启动
- 检查端口 3001 是否被占用
- 确保已安装所有依赖 `npm install`
- 检查 Node.js 版本是否 >= 16

### 前端无法连接后端
- 确保后端服务已启动
- 检查 `.env` 文件中的 API_URL 配置
- 检查浏览器控制台的 CORS 错误

### 图片上传失败
- 检查文件大小是否超过 5MB
- 检查文件格式是否为 JPEG/PNG/WebP
- 确保 `server/uploads` 目录存在且有写入权限

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。