# Ekko 数据迁移指南

从 LowDB (JSON) 迁移到 Supabase (PostgreSQL)

## 准备工作

### 1. 备份现有数据

```bash
cd ekko-project/server/db/data
cp courses.json courses.json.backup
cp users.json users.json.backup
cp orders.json orders.json.backup
cp activityLogs.json activityLogs.json.backup
```

### 2. 安装迁移工具

```bash
npm install --save-dev @supabase/supabase-js
```

## 迁移脚本

创建 `server/migrate-to-supabase.js`:

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateUsers() {
  console.log('📦 迁移用户数据...');
  
  const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db/data/users.json'), 'utf8')
  );

  for (const user of usersData.users) {
    try {
      // 注意：密码已经是 bcrypt hash，直接使用
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          password_hash: user.password,
          name: user.name,
          phone: user.phone || null,
          role: user.role || 'user',
          status: user.status || 'active',
          registration_ip: user.registrationIp || null,
          registration_date: user.registrationDate || user.createdAt,
          last_login_ip: user.lastLoginIp || null,
          last_login_date: user.lastLoginDate || null,
          user_agent: user.userAgent || null,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        });

      if (error) {
        console.error(`❌ 用户 ${user.email} 迁移失败:`, error.message);
      } else {
        console.log(`✅ 用户 ${user.email} 迁移成功`);
      }
    } catch (err) {
      console.error(`❌ 用户 ${user.email} 迁移异常:`, err.message);
    }
  }
}

async function migrateCourses() {
  console.log('📦 迁移课程数据...');
  
  const coursesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db/data/courses.json'), 'utf8')
  );

  for (const course of coursesData.courses) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          id: course.id,
          title: course.title,
          description: course.description || '',
          price: parseFloat(course.price),
          category: course.category,
          image_url: course.image || course.imageUrl,
          video_url: course.videoUrl || null,
          sales: course.sales || 0,
          status: course.status || 'active',
          instructor_id: course.instructorId || null,
          created_at: course.createdAt,
          updated_at: course.updatedAt
        });

      if (error) {
        console.error(`❌ 课程 ${course.title} 迁移失败:`, error.message);
      } else {
        console.log(`✅ 课程 ${course.title} 迁移成功`);
      }
    } catch (err) {
      console.error(`❌ 课程 ${course.title} 迁移异常:`, err.message);
    }
  }
}

async function migrateOrders() {
  console.log('📦 迁移订单数据...');
  
  const ordersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db/data/orders.json'), 'utf8')
  );

  for (const order of ordersData.orders) {
    try {
      // 创建订单
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          total_amount: parseFloat(order.amount),
          original_amount: parseFloat(order.originalAmount || order.amount),
          discount_amount: parseFloat(order.discountAmount || 0),
          payment_method: order.paymentMethod || 'wechat',
          payment_session_id: order.paymentSessionId || null,
          status: order.status || 'paid',
          ip_address: order.ipAddress || null,
          user_agent: order.userAgent || null,
          paid_at: order.paidAt || order.createdAt,
          refunded_at: order.refundedAt || null,
          refunded_by: order.refundedBy || null,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        })
        .select()
        .single();

      if (orderError) {
        console.error(`❌ 订单 ${order.id} 迁移失败:`, orderError.message);
        continue;
      }

      // 创建订单项
      if (order.courseId) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: orderData.id,
            course_id: order.courseId,
            price: parseFloat(order.amount)
          });

        if (itemError) {
          console.error(`❌ 订单项 ${order.id} 迁移失败:`, itemError.message);
        }
      }

      console.log(`✅ 订单 ${order.id} 迁移成功`);
    } catch (err) {
      console.error(`❌ 订单 ${order.id} 迁移异常:`, err.message);
    }
  }
}

async function migrateActivityLogs() {
  console.log('📦 迁移活动日志...');
  
  const logsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'db/data/activityLogs.json'), 'utf8')
  );

  for (const log of logsData.logs) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          id: log.id,
          user_id: log.userId,
          action_type: log.actionType,
          status: log.status,
          ip_address: log.ipAddress || null,
          user_agent: log.userAgent || null,
          metadata: log.metadata || {},
          created_at: log.createdAt
        });

      if (error) {
        console.error(`❌ 日志 ${log.id} 迁移失败:`, error.message);
      }
    } catch (err) {
      console.error(`❌ 日志迁移异常:`, err.message);
    }
  }
  
  console.log('✅ 活动日志迁移完成');
}

async function main() {
  console.log('🚀 开始数据迁移...\n');

  try {
    await migrateUsers();
    console.log('\n');
    
    await migrateCourses();
    console.log('\n');
    
    await migrateOrders();
    console.log('\n');
    
    await migrateActivityLogs();
    console.log('\n');

    console.log('✅ 所有数据迁移完成！');
    console.log('\n请验证数据完整性后，再切换到新服务器。');
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

main();
```

## 执行迁移

### 1. 配置环境变量

确保 `.env` 文件包含 Supabase 配置：

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 2. 运行迁移脚本

```bash
cd ekko-project/server
node migrate-to-supabase.js
```

### 3. 验证数据

在 Supabase Dashboard 中检查：

```sql
-- 检查用户数量
SELECT COUNT(*) FROM users;

-- 检查课程数量
SELECT COUNT(*) FROM courses;

-- 检查订单数量
SELECT COUNT(*) FROM orders;

-- 检查订单项
SELECT COUNT(*) FROM order_items;

-- 检查活动日志
SELECT COUNT(*) FROM activity_logs;
```

### 4. 数据对比

```javascript
// 创建 verify-migration.js
const fs = require('fs');

const oldUsers = JSON.parse(fs.readFileSync('db/data/users.json')).users;
const oldCourses = JSON.parse(fs.readFileSync('db/data/courses.json')).courses;
const oldOrders = JSON.parse(fs.readFileSync('db/data/orders.json')).orders;

console.log('原始数据统计:');
console.log(`用户: ${oldUsers.length}`);
console.log(`课程: ${oldCourses.length}`);
console.log(`订单: ${oldOrders.length}`);

// 然后在 Supabase 中查询对比
```

## 切换到新服务器

### 1. 测试新服务器

```bash
# 启动新服务器
node index-secure.js

# 测试健康检查
curl http://localhost:3001/health

# 测试登录
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. 更新启动脚本

修改 `package.json`:

```json
{
  "scripts": {
    "start": "node index-secure.js",
    "start:old": "node index.js",
    "migrate": "node migrate-to-supabase.js"
  }
}
```

### 3. 重启服务

```bash
pm2 restart ekko-server
```

## 回滚计划

如果迁移出现问题：

### 1. 保留旧服务器

```bash
# 切回旧服务器
pm2 stop ekko-server
pm2 start index.js --name ekko-server
```

### 2. 恢复备份数据

```bash
cd ekko-project/server/db/data
cp courses.json.backup courses.json
cp users.json.backup users.json
cp orders.json.backup orders.json
```

## 常见问题

### Q: UUID 格式不匹配
A: LowDB 使用的 ID 可能不是标准 UUID，需要转换：

```javascript
const { v4: uuidv4 } = require('uuid');

// 如果 ID 是数字
const newId = uuidv4();

// 或保持原 ID（如果是字符串）
const newId = oldId.toString();
```

### Q: 密码无法登录
A: 确保密码 hash 正确迁移：

```javascript
// 检查密码格式
console.log(user.password); // 应该是 $2b$10$... 格式
```

### Q: 外键约束失败
A: 确保迁移顺序正确：
1. 先迁移 users
2. 再迁移 courses
3. 最后迁移 orders 和 order_items

## 性能优化

### 批量插入

```javascript
// 不要一条条插入
for (const user of users) {
  await supabase.from('users').insert(user);
}

// 使用批量插入
const { error } = await supabase
  .from('users')
  .insert(users);
```

### 事务处理

```javascript
// 使用 Supabase 的事务功能
const { data, error } = await supabase.rpc('migrate_orders', {
  orders_data: ordersJson
});
```

## 迁移后清理

### 1. 删除旧数据文件（可选）

```bash
# 确认迁移成功后
rm -rf ekko-project/server/db/data/*.json
```

### 2. 卸载 LowDB

```bash
npm uninstall lowdb
```

### 3. 更新文档

更新 README.md 中的数据库说明。

## 监控迁移后的系统

### 1. 检查错误日志

```bash
pm2 logs ekko-server --err
```

### 2. 监控数据库性能

在 Supabase Dashboard 中查看：
- Query Performance
- Database Size
- Connection Pool

### 3. 用户反馈

密切关注用户报告的问题，特别是：
- 登录问题
- 订单查询问题
- 课程访问问题

## 完成检查清单

- [ ] 所有用户数据已迁移
- [ ] 所有课程数据已迁移
- [ ] 所有订单数据已迁移
- [ ] 活动日志已迁移
- [ ] 数据数量对比一致
- [ ] 测试登录功能正常
- [ ] 测试购买流程正常
- [ ] 测试管理后台功能正常
- [ ] 性能测试通过
- [ ] 备份策略已设置
- [ ] 监控告警已配置
- [ ] 文档已更新
