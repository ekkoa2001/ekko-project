require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 读取 JSON 文件
function readJsonFile(filename) {
  try {
    const filePath = path.join(__dirname, 'db/data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`❌ 无法读取文件 ${filename}: ${error.message}`, 'red');
    return null;
  }
}

// 迁移用户数据
async function migrateUsers() {
  log('\n📦 开始迁移用户数据...', 'cyan');
  
  const usersData = readJsonFile('users.json');
  if (!usersData || !usersData.users) {
    log('⚠️  未找到用户数据，跳过', 'yellow');
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const user of usersData.users) {
    try {
      const { error } = await supabase
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
        log(`  ❌ ${user.email}: ${error.message}`, 'red');
        failed++;
      } else {
        log(`  ✅ ${user.email}`, 'green');
        success++;
      }
    } catch (err) {
      log(`  ❌ ${user.email}: ${err.message}`, 'red');
      failed++;
    }
  }

  log(`\n用户迁移完成: ${success} 成功, ${failed} 失败`, success > 0 ? 'green' : 'yellow');
  return { success, failed };
}

// 迁移课程数据
async function migrateCourses() {
  log('\n📦 开始迁移课程数据...', 'cyan');
  
  const coursesData = readJsonFile('courses.json');
  if (!coursesData || !coursesData.courses) {
    log('⚠️  未找到课程数据，跳过', 'yellow');
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const course of coursesData.courses) {
    try {
      const { error } = await supabase
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
        log(`  ❌ ${course.title}: ${error.message}`, 'red');
        failed++;
      } else {
        log(`  ✅ ${course.title}`, 'green');
        success++;
      }
    } catch (err) {
      log(`  ❌ ${course.title}: ${err.message}`, 'red');
      failed++;
    }
  }

  log(`\n课程迁移完成: ${success} 成功, ${failed} 失败`, success > 0 ? 'green' : 'yellow');
  return { success, failed };
}

// 迁移订单数据
async function migrateOrders() {
  log('\n📦 开始迁移订单数据...', 'cyan');
  
  const ordersData = readJsonFile('orders.json');
  if (!ordersData || !ordersData.orders) {
    log('⚠️  未找到订单数据，跳过', 'yellow');
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

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
        log(`  ❌ 订单 ${order.id}: ${orderError.message}`, 'red');
        failed++;
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
          log(`  ⚠️  订单 ${order.id} 创建成功，但订单项失败: ${itemError.message}`, 'yellow');
        }
      }

      log(`  ✅ 订单 ${order.id}`, 'green');
      success++;
    } catch (err) {
      log(`  ❌ 订单 ${order.id}: ${err.message}`, 'red');
      failed++;
    }
  }

  log(`\n订单迁移完成: ${success} 成功, ${failed} 失败`, success > 0 ? 'green' : 'yellow');
  return { success, failed };
}

// 迁移活动日志
async function migrateActivityLogs() {
  log('\n📦 开始迁移活动日志...', 'cyan');
  
  const logsData = readJsonFile('activityLogs.json');
  if (!logsData || !logsData.logs) {
    log('⚠️  未找到活动日志数据，跳过', 'yellow');
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  // 批量插入（每次 100 条）
  const batchSize = 100;
  for (let i = 0; i < logsData.logs.length; i += batchSize) {
    const batch = logsData.logs.slice(i, i + batchSize);
    
    try {
      const logsToInsert = batch.map(log => ({
        id: log.id,
        user_id: log.userId,
        action_type: log.actionType,
        status: log.status,
        ip_address: log.ipAddress || null,
        user_agent: log.userAgent || null,
        metadata: log.metadata || {},
        created_at: log.createdAt
      }));

      const { error } = await supabase
        .from('activity_logs')
        .insert(logsToInsert);

      if (error) {
        log(`  ❌ 批次 ${i / batchSize + 1}: ${error.message}`, 'red');
        failed += batch.length;
      } else {
        log(`  ✅ 批次 ${i / batchSize + 1}: ${batch.length} 条`, 'green');
        success += batch.length;
      }
    } catch (err) {
      log(`  ❌ 批次 ${i / batchSize + 1}: ${err.message}`, 'red');
      failed += batch.length;
    }
  }

  log(`\n活动日志迁移完成: ${success} 成功, ${failed} 失败`, success > 0 ? 'green' : 'yellow');
  return { success, failed };
}

// 验证迁移结果
async function verifyMigration() {
  log('\n🔍 验证迁移结果...', 'cyan');

  try {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });

    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: logsCount } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true });

    log('\n数据库统计:', 'blue');
    log(`  用户: ${usersCount}`, 'green');
    log(`  课程: ${coursesCount}`, 'green');
    log(`  订单: ${ordersCount}`, 'green');
    log(`  活动日志: ${logsCount}`, 'green');

    // 对比原始数据
    const usersData = readJsonFile('users.json');
    const coursesData = readJsonFile('courses.json');
    const ordersData = readJsonFile('orders.json');
    const logsData = readJsonFile('activityLogs.json');

    log('\n原始数据统计:', 'blue');
    log(`  用户: ${usersData?.users?.length || 0}`, 'yellow');
    log(`  课程: ${coursesData?.courses?.length || 0}`, 'yellow');
    log(`  订单: ${ordersData?.orders?.length || 0}`, 'yellow');
    log(`  活动日志: ${logsData?.logs?.length || 0}`, 'yellow');

    const allMatch = 
      usersCount === (usersData?.users?.length || 0) &&
      coursesCount === (coursesData?.courses?.length || 0) &&
      ordersCount === (ordersData?.orders?.length || 0) &&
      logsCount === (logsData?.logs?.length || 0);

    if (allMatch) {
      log('\n✅ 数据迁移完整！', 'green');
    } else {
      log('\n⚠️  数据数量不匹配，请检查失败的记录', 'yellow');
    }
  } catch (error) {
    log(`\n❌ 验证失败: ${error.message}`, 'red');
  }
}

// 主函数
async function main() {
  log('╔═══════════════════════════════════════════╗', 'cyan');
  log('║   🚀 Ekko 数据迁移工具                   ║', 'cyan');
  log('║   LowDB → Supabase PostgreSQL            ║', 'cyan');
  log('╚═══════════════════════════════════════════╝', 'cyan');

  // 检查环境变量
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    log('\n❌ 错误: 请配置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY 环境变量', 'red');
    log('提示: 复制 .env.example 为 .env 并填写配置', 'yellow');
    process.exit(1);
  }

  log('\n⚠️  警告: 此操作将向 Supabase 插入数据', 'yellow');
  log('请确保:', 'yellow');
  log('  1. 已在 Supabase 中执行了 supabase-schema.sql', 'yellow');
  log('  2. 已备份现有数据', 'yellow');
  log('  3. 数据库表为空（避免重复数据）', 'yellow');

  // 等待 3 秒
  log('\n开始迁移倒计时: 3...', 'cyan');
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('开始迁移倒计时: 2...', 'cyan');
  await new Promise(resolve => setTimeout(resolve, 1000));
  log('开始迁移倒计时: 1...', 'cyan');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const startTime = Date.now();

  try {
    // 执行迁移
    const usersResult = await migrateUsers();
    const coursesResult = await migrateCourses();
    const ordersResult = await migrateOrders();
    const logsResult = await migrateActivityLogs();

    // 验证结果
    await verifyMigration();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n╔═══════════════════════════════════════════╗', 'green');
    log('║   ✅ 迁移完成！                          ║', 'green');
    log(`║   耗时: ${duration} 秒                        ║`, 'green');
    log('╚═══════════════════════════════════════════╝', 'green');

    log('\n总结:', 'blue');
    log(`  用户: ${usersResult.success} 成功, ${usersResult.failed} 失败`);
    log(`  课程: ${coursesResult.success} 成功, ${coursesResult.failed} 失败`);
    log(`  订单: ${ordersResult.success} 成功, ${ordersResult.failed} 失败`);
    log(`  日志: ${logsResult.success} 成功, ${logsResult.failed} 失败`);

    log('\n下一步:', 'cyan');
    log('  1. 在 Supabase Dashboard 中验证数据', 'cyan');
    log('  2. 测试新服务器: node index-secure.js', 'cyan');
    log('  3. 测试登录和购买流程', 'cyan');
    log('  4. 确认无误后切换到生产环境', 'cyan');

  } catch (error) {
    log(`\n❌ 迁移过程中发生错误: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// 运行迁移
main();
