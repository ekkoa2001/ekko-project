import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, RefreshCcw, Book, PlusCircle, Trash2, Edit, X, Users } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// --- 课程编辑/新增模态框 ---
const CourseModal = ({ isOpen, onClose, onSave, course }) => {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (course) {
      setFormData(course);
      setImagePreview(course.image || '');
    } else {
      setFormData({ title: '', price: '', category: '', description: '', image: '' });
      setImagePreview('');
    }
  }, [course]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (content) => {
    // Sanitize HTML content to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(content);
    setFormData(prev => ({ ...prev, description: sanitizedContent }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const token = localStorage.getItem('adminToken') || 'demo-token';
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json();

      if (data.success) {
        const imageUrl = `http://localhost:3001${data.data.url}`;
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
        alert('图片上传成功！');
      } else {
        alert('上传失败: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-bold text-lg">{course ? '编辑课程' : '新增课程'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">课程标题</label>
            <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="例如：Shopify 建站实战课程" className="w-full p-2 border rounded" required />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">价格（元）</label>
            <input name="price" value={formData.price || ''} onChange={handleChange} placeholder="例如：299" type="number" className="w-full p-2 border rounded" required />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">分类</label>
            <input name="category" value={formData.category || ''} onChange={handleChange} placeholder="例如：独立站建站" className="w-full p-2 border rounded" required />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">课程描述</label>
            <ReactQuill 
              theme="snow"
              value={formData.description || ''}
              onChange={handleDescriptionChange}
              placeholder="简要介绍课程内容..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ]
              }}
              className="bg-white"
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">课程封面</label>
            <div className="space-y-2">
              {imagePreview && (
                <div className="relative w-full h-48 border rounded overflow-hidden bg-slate-100">
                  <img src={imagePreview} alt="预览" className="w-full h-full object-cover" />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full p-2 border rounded text-sm"
              />
              {uploading && <p className="text-sm text-blue-600">上传中...</p>}
              <p className="text-xs text-slate-500">支持 JPG、PNG、WebP 格式，最大 5MB</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300">取消</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50">
              {uploading ? '上传中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 用户详情模态框 ---
const UserDetailModal = ({ isOpen, onClose, user, activityLogs, orders }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="font-bold text-lg">用户详情</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h4 className="font-bold mb-3">基本信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">用户ID:</span> <span className="font-mono">{user.id}</span></div>
              <div><span className="text-slate-500">姓名:</span> <span className="font-semibold">{user.name}</span></div>
              <div><span className="text-slate-500">邮箱:</span> {user.email}</div>
              <div><span className="text-slate-500">角色:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></div>
              <div><span className="text-slate-500">状态:</span> <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></div>
              <div><span className="text-slate-500">注册时间:</span> {new Date(user.registrationDate).toLocaleString('zh-CN')}</div>
            </div>
          </div>

          {/* IP 信息 */}
          <div>
            <h4 className="font-bold mb-3">IP 信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">注册IP:</span> <span className="font-mono">{user.registrationIp}</span></div>
              <div><span className="text-slate-500">最后登录IP:</span> <span className="font-mono">{user.lastLoginIp}</span></div>
              <div><span className="text-slate-500">最后登录时间:</span> {new Date(user.lastLoginDate).toLocaleString('zh-CN')}</div>
              <div><span className="text-slate-500">User Agent:</span> <span className="text-xs truncate">{user.userAgent}</span></div>
            </div>
          </div>

          {/* 订单历史 */}
          <div>
            <h4 className="font-bold mb-3">订单历史 ({orders?.length || 0})</h4>
            {orders && orders.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">订单ID</th>
                      <th className="p-2 text-left">课程ID</th>
                      <th className="p-2 text-left">金额</th>
                      <th className="p-2 text-left">状态</th>
                      <th className="p-2 text-left">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="p-2 font-mono text-xs">{order.id}</td>
                        <td className="p-2">{order.courseId}</td>
                        <td className="p-2 font-bold">¥{order.amount}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2 text-xs">{new Date(order.createdAt).toLocaleString('zh-CN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">暂无订单</p>
            )}
          </div>

          {/* 活动日志 */}
          <div>
            <h4 className="font-bold mb-3">活动日志 (最近 10 条)</h4>
            {activityLogs && activityLogs.length > 0 ? (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-left">操作</th>
                      <th className="p-2 text-left">状态</th>
                      <th className="p-2 text-left">IP</th>
                      <th className="p-2 text-left">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.slice(0, 10).map((log, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{log.actionType}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-xs">{log.ipAddress}</td>
                        <td className="p-2 text-xs">{new Date(log.createdAt).toLocaleString('zh-CN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">暂无活动日志</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 课程管理组件 ---
const CourseManager = ({ courses, onRefresh, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-xl flex items-center gap-2"><Book size={20} /> 课程管理</h3>
        <button onClick={() => onEdit(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-slate-800 transition-colors">
          <PlusCircle size={16} /> 新增课程
        </button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">课程标题</th>
            <th className="p-4">分类</th>
            <th className="p-4">价格</th>
            <th className="p-4">销量</th>
            <th className="p-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="p-4 font-mono text-xs text-slate-500">{c.id}</td>
              <td className="p-4 font-semibold max-w-xs truncate">{c.title}</td>
              <td className="p-4 text-slate-600">{c.category}</td>
              <td className="p-4 font-bold">¥{c.price}</td>
              <td className="p-4">{c.sales}</td>
              <td className="p-4 flex gap-2">
                <button onClick={() => onEdit(c)} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
                <button onClick={() => onDelete(c.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default function AdminApp() {
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0 });
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  
  const refreshData = () => {
    const token = localStorage.getItem('adminToken') || 'demo-token';
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    fetch(`${API_URL}/admin/stats`, { headers }).then(res => res.json()).then(res => res.success && setStats(res.data)).catch(err => console.error(err));
    fetch(`${API_URL}/admin/orders`, { headers }).then(res => res.json()).then(res => res.success && setOrders(res.data)).catch(err => console.error(err));
    fetch(`${API_URL}/admin/courses`, { headers }).then(res => res.json()).then(res => res.success && setCourses(res.data)).catch(err => console.error(err));
    fetch(`${API_URL}/admin/users`, { headers }).then(res => res.json()).then(res => res.success && setUsers(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { refreshData(); }, []);

  const handleRefund = (orderId) => {
    if(!confirm('确定退款吗？')) return;
    fetch(`${API_URL}/admin/refund`, {
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

  const handleDeleteCourse = (courseId) => {
    if(!confirm('确定要删除这个课程吗？此操作不可逆！')) return;
    fetch(`${API_URL}/admin/courses/${courseId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert("课程删除成功！");
          refreshData();
        } else {
          alert("删除失败：" + res.message);
        }
      });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = (courseData) => {
    const isEditing = !!courseData.id;
    const url = isEditing ? `${API_URL}/admin/courses/${courseData.id}` : `${API_URL}/admin/courses`;
    const method = isEditing ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert(`课程${isEditing ? '更新' : '创建'}成功！`);
        setIsModalOpen(false);
        setEditingCourse(null);
        refreshData();
      } else {
        alert("操作失败: " + res.message);
      }
    });
  };

  const handleViewUserDetail = async (userId) => {
    const token = localStorage.getItem('adminToken') || 'demo-token';
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedUser(data.data);
        setIsUserDetailOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('获取用户详情失败');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!confirm(`确定要将用户角色更改为 ${newRole} 吗？`)) return;
    
    const token = localStorage.getItem('adminToken') || 'demo-token';
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        alert('角色更新成功！');
        refreshData();
      } else {
        alert('更新失败: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('更新失败');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm('确定要停用此用户吗？')) return;
    
    const token = localStorage.getItem('adminToken') || 'demo-token';
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('用户已停用！');
        refreshData();
      } else {
        alert('操作失败: ' + data.message);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('操作失败');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <CourseModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCourse(null); }} 
        onSave={handleSaveCourse}
        course={editingCourse}
      />
      <UserDetailModal
        isOpen={isUserDetailOpen}
        onClose={() => { setIsUserDetailOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        activityLogs={selectedUser?.activityLogs}
        orders={selectedUser?.orders}
      />
      <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col p-6">
          <h1 className="text-2xl font-black text-white mb-8">Ekko Admin</h1>
          <div className="space-y-2">
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><LayoutDashboard size={20}/> 控制台</button>
            <button onClick={() => setView('courses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'courses' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Book size={20}/> 课程管理</button>
            <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Users size={20}/> 用户管理</button>
          </div>
        </aside>
        <main className="flex-1 p-8">
          {view === 'dashboard' && (
            <>
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
            </>
          )}
          {view === 'courses' && <CourseManager courses={courses} onRefresh={refreshData} onDelete={handleDeleteCourse} onEdit={handleEditCourse} />}
          {view === 'users' && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-xl flex items-center gap-2"><Users size={20} /> 用户管理</h3>
                <input
                  type="text"
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border rounded-lg text-sm w-64"
                />
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">姓名</th>
                    <th className="p-4">邮箱</th>
                    <th className="p-4">角色</th>
                    <th className="p-4">状态</th>
                    <th className="p-4">注册IP</th>
                    <th className="p-4">最后登录IP</th>
                    <th className="p-4">注册时间</th>
                    <th className="p-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-t border-slate-100">
                      <td className="p-4 font-mono text-xs text-slate-500">{u.id.substring(0, 8)}</td>
                      <td className="p-4 font-semibold">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs font-bold border"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">{u.registrationIp}</td>
                      <td className="p-4 font-mono text-xs">{u.lastLoginIp}</td>
                      <td className="p-4 text-xs text-slate-500">{new Date(u.registrationDate).toLocaleDateString('zh-CN')}</td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => handleViewUserDetail(u.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded"
                        >
                          详情
                        </button>
                        {u.status === 'active' && (
                          <button
                            onClick={() => handleDeactivateUser(u.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded"
                          >
                            停用
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}