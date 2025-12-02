const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database files
const coursesFile = path.join(dataDir, 'courses.json');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');
const activityLogsFile = path.join(dataDir, 'activityLogs.json');

// Create adapters
const coursesAdapter = new JSONFile(coursesFile);
const usersAdapter = new JSONFile(usersFile);
const ordersAdapter = new JSONFile(ordersFile);
const activityLogsAdapter = new JSONFile(activityLogsFile);

// Create database instances
const coursesDb = new Low(coursesAdapter, { courses: [] });
const usersDb = new Low(usersAdapter, { users: [] });
const ordersDb = new Low(ordersAdapter, { orders: [] });
const activityLogsDb = new Low(activityLogsAdapter, { logs: [] });

// Initialize databases with default data
async function initializeDatabase() {
  // Read databases
  await coursesDb.read();
  await usersDb.read();
  await ordersDb.read();
  await activityLogsDb.read();

  // Initialize with default data if empty
  if (!coursesDb.data.courses || coursesDb.data.courses.length === 0) {
    coursesDb.data.courses = [
      {
        id: 1,
        title: "Shopify 独立站从 0 到 1 全案实战",
        price: 1299,
        category: "独立站建站",
        description: "这是一门实战课程，包含真实案例和可复制的方法论。",
        sales: 2100,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "TikTok 流量变现与短视频带货特训",
        price: 899,
        category: "社媒运营",
        description: "学习TikTok短视频制作和直播带货技巧。",
        sales: 5600,
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await coursesDb.write();
  }

  if (!usersDb.data.users || usersDb.data.users.length === 0) {
    const bcrypt = require('bcrypt');
    usersDb.data.users = [
      {
        id: '1',
        email: 'user@test.com',
        password: await bcrypt.hash('123', 10),
        name: 'Alex',
        role: 'user',
        status: 'active',
        registrationIp: '127.0.0.1',
        registrationDate: new Date().toISOString(),
        userAgent: 'Mozilla/5.0',
        lastLoginIp: '127.0.0.1',
        lastLoginDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '99',
        email: 'admin@ekko.com',
        password: await bcrypt.hash('admin', 10),
        name: 'Admin Boss',
        role: 'admin',
        status: 'active',
        registrationIp: '127.0.0.1',
        registrationDate: new Date().toISOString(),
        userAgent: 'Mozilla/5.0',
        lastLoginIp: '127.0.0.1',
        lastLoginDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await usersDb.write();
  }

  if (!ordersDb.data.orders || ordersDb.data.orders.length === 0) {
    ordersDb.data.orders = [
      {
        id: 'ORD-1001',
        userId: '1',
        courseId: 1,
        amount: 1299,
        paymentMethod: 'wechat',
        status: 'paid',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: '2024-03-20T00:00:00.000Z',
        updatedAt: '2024-03-20T00:00:00.000Z'
      }
    ];
    await ordersDb.write();
  }

  if (!activityLogsDb.data.logs) {
    activityLogsDb.data.logs = [];
    await activityLogsDb.write();
  }

  console.log('✅ Database initialized successfully');
}

module.exports = {
  coursesDb,
  usersDb,
  ordersDb,
  activityLogsDb,
  initializeDatabase
};
