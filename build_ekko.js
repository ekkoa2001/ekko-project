const fs = require('fs');
const path = require('path');

const rootDir = 'ekko-project';

// --- 1. 定义所有文件的内容 ---

// [Server] 后端代码
const serverIndexJs = `
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// 模拟数据库
const DB = {
  users: [
    { id: 1, email: 'user@test.com', password: '123', role: 'user', name: 'Alex' },
    { id: 99, email: 'admin@ekko.com', password: 'admin', role: 'admin', name: 'Admin Boss' }
  ],
  courses: [
    {
      id: 1,
      title: "Shopify 独立站从 0 到 1 全案实战",
      price: 1299,
      category: "独立站建站",
      sales: 2100,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "TikTok 流量变现与短视频带货特训",
      price: 899,
      category: "社媒运营",
      sales: 5600,
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
    }
  ],
  orders: [
    { id: 'ORD-1001', userId: 1, courseId: 1, amount: 1299, status: 'paid', date: '2024-03-20' }
  ]
};

// API 路由
app.get('/api/courses', (req, res) => res.json({ success: true, data: DB.courses }));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: '账号或密码错误 (试用: user@test.com / 123)' });
  }
});

app.post('/api/orders/create', (req, res) => {
  const { userId, courseId, amount } = req.body;
  const newOrder = {
    id: \`ORD-\${Date.now()}\`,
    userId,
    courseId,
    amount,
    status: 'paid',
    date: new Date().toISOString().split('T')[0]
  };
  DB.orders.unshift(newOrder);
  console.log(\`[新订单] 用户 \${userId} 购买了课程 \${courseId}\`);
  res.json({ success: true, order: newOrder });
});

app.get('/api/admin/stats', (req, res) => {
  const totalSales = DB.orders.reduce((sum, order) => order.status !== 'refunded' ? sum + order.amount : sum, 0);
  res.json({
    success: true,
    data: { totalSales, orderCount: DB.orders.length, userCount: DB.users.length }
  });
});

app.get('/api/admin/orders', (req, res) => {
  const ordersWithDetails = DB.orders.map(order => {
    const course = DB.courses.find(c => c.id === order.courseId);
    const user = DB.users.find(u => u.id === order.userId);
    return { ...order, courseTitle: course?.title, userName: user?.name };
  });
  res.json({ success: true, data: ordersWithDetails });
});

app.post('/api/admin/refund', (req, res) => {
  const { orderId } = req.body;
  const order = DB.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'refunded';
    console.log(\`[退款] 订单 \${orderId} 已退款\`);
    res.json({ success: true, message: '退款成功' });
  } else {
    res.status(404).json({ success: false, message: '订单不存在' });
  }
});

app.listen(PORT, () => {
  console.log(\`Backend running at http://localhost:\${PORT}\`);
});
`;

const serverPackageJson = JSON.stringify({
  name: "ekko-server",
  version: "1.0.0",
  main: "index.js",
  scripts: { "start": "node index.js" },
  dependencies: { "express": "^4.18.2", "cors": "^2.8.5", "body-parser": "^1.20.2" }
}, null, 2);

// [Client & Admin] 通用配置
const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;

const tailwindConfig = `
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
`;

const postcssConfig = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

// [Client] 前端代码
const clientPackageJson = JSON.stringify({
  name: "ekko-client",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1" },
  devDependencies: { "@types/react": "^18.2.15", "@types/react-dom": "^18.2.7", "@vitejs/plugin-react": "^4.0.3", "autoprefixer": "^10.4.14", "postcss": "^8.4.27", "tailwindcss": "^3.3.3", "vite": "^4.4.5" }
}, null, 2);

const clientHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ekko Learning Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const clientMainJsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

const clientAppJsx = `
import React, { useState, useEffect } from 'react';
import { Play, Search, User, Lock, ChevronRight, Star, Layout, BookOpen, CheckCircle, Shield, Menu, X, CreditCard, BarChart, Settings, LogOut, Heart, Share2, Globe, TrendingUp, Smartphone, Zap } from 'lucide-react';

const API_URL = "http://localhost:3001/api";

// --- Components ---
const Button = ({ children, variant = 'primary', className, onClick, icon: Icon }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5", 
    secondary: "bg-white text-slate-800 border border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-sm",
  };
  return (
    <button onClick={onClick} className={\`\${baseStyle} \${variants[variant]} \${className || ''}\`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default function App() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(\`\${API_URL}/courses\`)
      .then(res => res.json())
      .then(res => res.success && setCourses(res.data))
      .catch(err => console.error("后端未连接"));
  }, []);

  const handleLogin = () => {
    setLoading(true);
    fetch(\`\${API_URL}/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@test.com', password: '123' })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) { setUser(res.user); alert(\`欢迎 \${res.user.name}\`); }
      else alert(res.message);
    })
    .finally(() => setLoading(false));
  };

  const handleBuy = (course) => {
    if (!user) return alert("请先登录");
    if (!confirm(\`确认花费 ¥\${course.price} 购买吗？\`)) return;
    fetch(\`\${API_URL}/orders/create\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, courseId: course.id, amount: course.price })
    })
    .then(res => res.json())
    .then(res => {
      if(res.success) alert(\`购买成功！订单号: \${res.order.id}\`);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-2xl">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">E</div>
          Ekko
        </div>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{user.name}</span>
              <button onClick={() => setUser(null)} className="text-red-500 text-sm">退出</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold">
              {loading ? '...' : '登录'}
            </button>
          )}
        </div>
      </nav>

      <div className="pt-20 pb-16 text-center px-4">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
            <Zap size={16} /> Ekko 跨境电商实战平台
         </div>
         <h1 className="text-5xl font-extrabold text-slate-900 mb-6">掌握 Shopify & TikTok</h1>
         <p className="text-xl text-slate-500 mb-8">实战派大卖导师手把手教学</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-8">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
             <img src={course.image} className="w-full h-48 object-cover" />
             <div className="p-6">
               <h3 className="text-xl font-bold mb-2">{course.title}</h3>
               <div className="flex justify-between items-center mt-6">
                 <span className="text-2xl font-bold text-blue-600">¥{course.price}</span>
                 <Button onClick={() => handleBuy(course)}>立即购买</Button>
               </div>
             </div>
          </div>
        ))}
        {courses.length === 0 && <div className="text-slate-400">正在连接服务器...</div>}
      </div>
    </div>
  );
}
`;

// [Admin] 后台代码
const adminPackageJson = JSON.stringify({
  name: "ekko-admin",
  private: true,
  version: "0.0.0",
  type: "module",
  scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  dependencies: { "react": "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1" },
  devDependencies: { "@types/react": "^18.2.15", "@types/react-dom": "^18.2.7", "@vitejs/plugin-react": "^4.0.3", "autoprefixer": "^10.4.14", "postcss": "^8.4.27", "tailwindcss": "^3.3.3", "vite": "^4.4.5" }
}, null, 2);

const adminHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ekko Admin Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const adminMainJsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
`;

const adminAppJsx = `
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, RefreshCcw, Users, TrendingUp, DollarSign } from 'lucide-react';

const API_URL = "http://localhost:3001/api";

export default function AdminApp() {
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0 });
  const [orders, setOrders] = useState([]);
  
  const refreshData = () => {
    fetch(\`\${API_URL}/admin/stats\`).then(res => res.json()).then(res => res.success && setStats(res.data));
    fetch(\`\${API_URL}/admin/orders\`).then(res => res.json()).then(res => res.success && setOrders(res.data));
  };

  useEffect(() => { refreshData(); }, []);

  const handleRefund = (orderId) => {
    if(!confirm('确定退款吗？')) return;
    fetch(\`\${API_URL}/admin/refund\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) { alert("退款成功！"); refreshData(); }
      else alert("失败：" + res.message);
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col p-6">
        <h1 className="text-2xl font-black text-white mb-8">Ekko Admin</h1>
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl"><LayoutDashboard size={20}/> 控制台</div>
          <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl cursor-pointer"><ShoppingCart size={20}/> 订单</div>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <p className="text-slate-500">GMV</p>
             <h3 className="text-2xl font-bold">¥{stats.totalSales}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <p className="text-slate-500">订单数</p>
             <h3 className="text-2xl font-bold">{stats.orderCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between">
            <h3 className="font-bold">交易记录</h3>
            <button onClick={refreshData} className="text-blue-600 flex items-center gap-1"><RefreshCcw size={14}/> 刷新</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr><th className="p-4">ID</th><th className="p-4">课程</th><th className="p-4">用户</th><th className="p-4">金额</th><th className="p-4">状态</th><th className="p-4">操作</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-slate-50">
                  <td className="p-4 font-mono text-slate-500">{o.id}</td>
                  <td className="p-4">{o.courseTitle}</td>
                  <td className="p-4">{o.userName}</td>
                  <td className="p-4">¥{o.amount}</td>
                  <td className="p-4">{o.status}</td>
                  <td className="p-4">
                    {o.status === 'paid' && <button onClick={() => handleRefund(o.id)} className="text-red-500 border border-red-200 px-2 py-1 rounded">退款</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
`;

// --- 2. 创建文件系统结构 ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  const absolutePath = path.join(rootDir, filePath);
  ensureDir(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, content.trim());
  console.log(`Created: ${filePath}`);
}

console.log(`Start building Ekko Project in ./${rootDir}...`);

// 创建 Server 文件
writeFile('server/package.json', serverPackageJson);
writeFile('server/index.js', serverIndexJs);

// 创建 Client 文件
writeFile('client/package.json', clientPackageJson);
writeFile('client/index.html', clientHtml);
writeFile('client/vite.config.js', viteConfig);
writeFile('client/tailwind.config.js', tailwindConfig);
writeFile('client/postcss.config.js', postcssConfig);
writeFile('client/src/main.jsx', clientMainJsx);
writeFile('client/src/App.jsx', clientAppJsx);
writeFile('client/src/index.css', indexCss);

// 创建 Admin 文件
writeFile('admin/package.json', adminPackageJson);
writeFile('admin/index.html', adminHtml);
writeFile('admin/vite.config.js', viteConfig);
writeFile('admin/tailwind.config.js', tailwindConfig);
writeFile('admin/postcss.config.js', postcssConfig);
writeFile('admin/src/main.jsx', adminMainJsx);
writeFile('admin/src/AdminApp.jsx', adminAppJsx);
writeFile('admin/src/index.css', indexCss);

console.log(`
=============================================
✅ 项目构建完成！
=============================================
请按照以下步骤运行项目 (需要开启 3 个终端窗口):

1. [终端 1] 启动后端服务器:
   cd ${rootDir}/server
   npm install
   node index.js

2. [终端 2] 启动用户端前端:
   cd ${rootDir}/client
   npm install
   npm run dev

3. [终端 3] 启动管理员后台:
   cd ${rootDir}/admin
   npm install
   npm run dev

玩得开心！
`);