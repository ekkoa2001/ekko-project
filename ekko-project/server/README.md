# Ekko Server

基于 Express + Supabase 构建的 RESTful API 服务。

## 🔌 核心服务

- **Auth**: JWT 认证与权限管理。
- **Order**: 订单创建、优惠券验证。
- **CMS**: 全站动态配置接口。
- **Storage**: Cloudflare R2 文件上传。

## 🔑 环境变量

部署时必须配置以下变量：

```env
PORT=3001
FRONTEND_URL=https://your-client-domain.zeabur.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=
```
