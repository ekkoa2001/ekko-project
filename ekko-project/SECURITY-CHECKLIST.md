# Ekko 安全配置检查清单

## 🔐 部署前安全检查

### 环境变量安全

- [ ] **JWT_SECRET** 已更改为强随机密钥（至少 32 字符）
  ```bash
  # 生成强密钥
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Supabase Service Key** 仅在后端使用，从未暴露到前端
- [ ] **R2 Secret Key** 安全存储，未提交到 Git
- [ ] 所有 `.env` 文件已添加到 `.gitignore`
- [ ] 生产环境使用独立的密钥（不同于开发环境）

### CORS 配置

- [ ] `FRONTEND_URL` 设置为实际的前端域名
- [ ] `ADMIN_URL` 设置为实际的管理后台域名
- [ ] 移除了 `localhost` 地址（生产环境）
- [ ] 未使用通配符 `*` 允许所有源

**正确配置示例：**
```javascript
const allowedOrigins = [
  'https://ekko.com',
  'https://www.ekko.com',
  'https://admin.ekko.com'
];
```

### Rate Limiting

- [ ] 全局限流已启用（推荐：100次/15分钟）
- [ ] 登录限流已启用（推荐：5次/1小时）
- [ ] 注册限流已启用（推荐：3次/1小时）
- [ ] 下载限流已启用（推荐：10次/1小时）

**调整建议：**
```bash
# 根据实际流量调整
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX_REQUESTS=5
```

### 数据库安全

- [ ] Supabase RLS（行级安全）已启用
- [ ] 用户只能访问自己的数据
- [ ] Service Role Key 仅在后端使用
- [ ] 数据库连接使用 SSL
- [ ] 定期备份已配置

**验证 RLS：**
```sql
-- 在 Supabase SQL Editor 中执行
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- rowsecurity 应该为 true
```

### 文件上传安全

- [ ] 文件类型白名单已配置
- [ ] 文件大小限制已设置（推荐：50MB）
- [ ] 文件名已清理（防止路径遍历）
- [ ] 上传需要认证
- [ ] 病毒扫描已集成（可选）

**配置示例：**
```javascript
const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'application/pdf',
  'image/jpeg',
  'image/png'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

### 密码安全

- [ ] 密码最小长度：8 字符
- [ ] 使用 bcrypt 加密（cost factor >= 10）
- [ ] 密码复杂度验证（可选）
- [ ] 密码重置功能安全实现
- [ ] 防止密码枚举攻击

**密码策略：**
```javascript
// 推荐的密码验证
function validatePassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // 至少一个大写
  if (!/[a-z]/.test(password)) return false; // 至少一个小写
  if (!/[0-9]/.test(password)) return false; // 至少一个数字
  return true;
}
```

## 🛡️ 运行时安全

### HTTP 安全头（Helmet）

- [ ] Helmet 中间件已启用
- [ ] Content Security Policy (CSP) 已配置
- [ ] X-Frame-Options 已设置
- [ ] X-Content-Type-Options 已设置
- [ ] Strict-Transport-Security 已设置

**验证方法：**
```bash
curl -I https://your-domain.com/api/health
# 检查响应头
```

### SSL/TLS

- [ ] HTTPS 已启用
- [ ] SSL 证书有效且未过期
- [ ] 强制 HTTPS 重定向
- [ ] TLS 1.2+ 已启用
- [ ] 弱加密套件已禁用

**Nginx 配置：**
```nginx
# 强制 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 防盗版保护

- [ ] 动态水印已启用
- [ ] 水印显示用户标识（手机号/邮箱）
- [ ] 水印位置随机浮动
- [ ] 多层水印防止遮挡
- [ ] 下载次数限制已启用（推荐：5次）

**测试水印：**
```javascript
// 在浏览器控制台测试
document.querySelectorAll('[style*="position: fixed"]').length
// 应该看到至少 3 个水印元素
```

### 安全下载

- [ ] 下载需要 JWT 认证
- [ ] 验证用户已购买课程
- [ ] 使用临时签名 URL（5分钟有效）
- [ ] 下载次数已记录
- [ ] 超过限制时拒绝下载

**测试流程：**
```bash
# 1. 未登录访问
curl http://localhost:3001/api/download/file-id
# 应返回 401

# 2. 未购买访问
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/download/file-id
# 应返回 403

# 3. 超过次数
# 下载 6 次后应返回 403
```

## 🔍 监控和日志

### 日志记录

- [ ] 所有认证尝试已记录
- [ ] 失败的登录已记录
- [ ] 敏感操作已记录（删除、退款等）
- [ ] IP 地址已记录
- [ ] User Agent 已记录

**检查日志：**
```sql
-- 查看最近的失败登录
SELECT * FROM activity_logs 
WHERE action_type = 'login' 
  AND status = 'failure'
ORDER BY created_at DESC 
LIMIT 10;
```

### 异常检测

- [ ] 多次失败登录告警
- [ ] 异常 IP 访问告警
- [ ] 大量下载告警
- [ ] 错误率告警
- [ ] 性能下降告警

**设置告警：**
```javascript
// 示例：检测暴力破解
async function detectBruteForce(userId) {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('action_type', 'login')
    .eq('status', 'failure')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());
  
  if (data.length >= 5) {
    // 发送告警
    sendAlert(`User ${userId} has 5+ failed logins in 1 hour`);
  }
}
```

### 性能监控

- [ ] API 响应时间监控
- [ ] 数据库查询性能监控
- [ ] 错误率监控
- [ ] 资源使用监控
- [ ] 用户行为分析

## 🚨 应急响应

### 数据泄露响应

- [ ] 数据泄露响应计划已制定
- [ ] 紧急联系人已确定
- [ ] 用户通知流程已准备
- [ ] 密钥轮换流程已测试

**应急步骤：**
1. 立即更换所有密钥
2. 强制所有用户重新登录
3. 审查访问日志
4. 通知受影响用户
5. 修复漏洞
6. 发布安全公告

### DDoS 防护

- [ ] Cloudflare DDoS 防护已启用
- [ ] Rate Limiting 已配置
- [ ] IP 黑名单功能已实现
- [ ] 备用服务器已准备

**Cloudflare 设置：**
- Security Level: High
- Challenge Passage: 30 minutes
- Browser Integrity Check: On

### 账户安全

- [ ] 可疑活动自动锁定
- [ ] 管理员账户使用 2FA
- [ ] 密码重置需要邮箱验证
- [ ] 会话超时已设置（24小时）

## 📋 定期检查（每月）

### 安全审计

- [ ] 检查所有用户权限
- [ ] 审查管理员账户
- [ ] 检查异常登录记录
- [ ] 审查文件下载记录
- [ ] 检查 API 使用情况

### 依赖更新

- [ ] 检查 npm 安全漏洞
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] 更新依赖包
  ```bash
  npm outdated
  npm update
  ```

- [ ] 测试更新后的功能

### 备份验证

- [ ] 数据库备份完整性
- [ ] 备份恢复测试
- [ ] 文件备份验证
- [ ] 配置文件备份

### 性能优化

- [ ] 清理旧日志（保留 90 天）
  ```sql
  DELETE FROM activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  ```

- [ ] 优化数据库索引
- [ ] 清理未使用的文件
- [ ] 检查 CDN 缓存命中率

## 🎯 合规检查

### GDPR（如适用）

- [ ] 用户数据导出功能
- [ ] 用户数据删除功能
- [ ] 隐私政策已发布
- [ ] Cookie 同意已实现
- [ ] 数据处理协议已签署

### 其他法规

- [ ] 用户协议已发布
- [ ] 退款政策已明确
- [ ] 版权声明已添加
- [ ] 联系方式已公开

## ✅ 安全评分

计算你的安全分数：

- 环境变量安全：___ / 5
- CORS 配置：___ / 4
- Rate Limiting：___ / 4
- 数据库安全：___ / 5
- 文件上传安全：___ / 5
- 密码安全：___ / 5
- HTTP 安全头：___ / 5
- SSL/TLS：___ / 5
- 防盗版保护：___ / 5
- 安全下载：___ / 5
- 日志记录：___ / 5
- 异常检测：___ / 5
- 性能监控：___ / 5

**总分：___ / 63**

- 60-63: 优秀 ✅
- 50-59: 良好 ⚠️
- 40-49: 需改进 ⚠️
- <40: 高风险 ❌

## 📞 安全问题报告

如发现安全漏洞，请：

1. **不要**公开披露
2. 发送邮件至：security@ekko.com
3. 包含详细的复现步骤
4. 等待我们的响应（24小时内）

**负责任的披露政策：**
- 我们会在 24 小时内确认收到
- 在 7 天内提供修复计划
- 在 30 天内发布补丁
- 致谢安全研究人员

## 🔗 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Cloudflare Security](https://www.cloudflare.com/learning/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
