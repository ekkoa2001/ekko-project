import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, RefreshCcw, Book, PlusCircle, Trash2, Edit, X, Users, Settings, Activity, Globe, Clock, MousePointer, TrendingUp } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];


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
      setFormData({ title: '', price: '', original_price: '', category: '', description: '', image: '' });
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
      formDataUpload.append('file', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json();

      if (data.success) {
        // The server returns the full public URL in data.url
        const imageUrl = data.url;
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
            <label className="block text-sm font-bold text-slate-700 mb-2">原价 (可选，用于展示划线价)</label>
            <input name="original_price" value={formData.original_price || ''} onChange={handleChange} placeholder="例如：599" type="number" className="w-full p-2 border rounded" />
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
            <button type="submit" disabled={uploading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-900/20">
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
        <button onClick={() => onEdit(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
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


// --- 网站设置组件 ---
const SiteSettings = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, [key]: data.url }));
        alert('图片上传成功');
      } else {
        alert('上传失败: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传出错');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        alert('设置保存成功');
      } else {
        alert('保存失败: ' + data.message);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存出错');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-4xl">
      <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Settings size={20} /> 网站设置</h3>
      
      <div className="space-y-6">
        {/* 基本设置 */}
        <div>
          <h4 className="font-bold text-lg mb-4 border-b pb-2">基本信息</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">网站标题 (Site Title)</label>
              <input name="site_title" value={config.site_title || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">联系邮箱</label>
              <input name="contact_email" value={config.contact_email || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">网站描述 (SEO)</label>
              <textarea name="site_description" value={config.site_description || ''} onChange={handleChange} className="w-full p-2 border rounded h-24" />
            </div>
          </div>
        </div>

        {/* 首页设置 */}
        <div>
          <h4 className="font-bold text-lg mb-4 border-b pb-2">首页设置 (Hero Section)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Hero 标题</label>
              <input name="hero_title" value={config.hero_title || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Hero 副标题</label>
              <input name="hero_subtitle" value={config.hero_subtitle || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* 图片设置 */}
        <div>
          <h4 className="font-bold text-lg mb-4 border-b pb-2">图片资源</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">网站 Logo</label>
              <div className="flex items-center gap-4">
                {config.site_logo && <img src={config.site_logo} alt="Logo" className="h-12 w-12 object-contain border rounded bg-slate-50" />}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'site_logo')} className="text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">首页 Banner</label>
              <div className="space-y-2">
                {config.hero_banner_url && <img src={config.hero_banner_url} alt="Banner" className="w-full h-32 object-cover border rounded" />}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_banner_url')} className="text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex justify-end">
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-900/20">
            {saving ? '保存中...' : '保存所有设置'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- 统计分析组件 ---
const AnalyticsDashboard = ({ data }) => {
  if (!data) return <div className="p-12 text-center text-slate-500">加载数据中...</div>;

  const { pv, uv, avgDuration, bounceRate, conversionRate, mapData, timeData, deviceData } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Activity size={18} /> 访问量 (PV)</div>
          <div className="text-3xl font-black text-slate-900">{pv}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Users size={18} /> 访客数 (UV)</div>
          <div className="text-3xl font-black text-slate-900">{uv}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><Clock size={18} /> 平均停留</div>
          <div className="text-3xl font-black text-slate-900">{avgDuration}s</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><MousePointer size={18} /> 跳出率</div>
          <div className="text-3xl font-black text-slate-900">{bounceRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-slate-500 mb-2"><TrendingUp size={18} /> 转化率</div>
          <div className="text-3xl font-black text-slate-900">{conversionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-6">访问时间分布 (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg mb-6">设备分布</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData && deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* World Map */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Globe size={20} /> 访客地理分布</h3>
        <div className="h-96 bg-slate-50 rounded-lg overflow-hidden relative">
           <ResponsiveContainer width="100%" height="100%">
             <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}>
               <ZoomableGroup>
                 <Geographies geography={GEO_URL}>
                   {({ geographies }) =>
                     geographies.map((geo) => {
                        const countryName = geo.properties.name;
                        // Check if we have visits from this country
                        const hasVisits = mapData && mapData.find(d => d.name === countryName || (d.name === 'United States' && countryName === 'United States of America'));
                        
                       return (
                         <Geography
                           key={geo.rsmKey}
                           geography={geo}
                           fill={hasVisits ? "#3b82f6" : "#D6D6DA"}
                           stroke="#FFFFFF"
                           strokeWidth={0.5}
                           style={{
                             default: { outline: "none" },
                             hover: { fill: "#1d4ed8", outline: "none" },
                             pressed: { fill: "#1e3a8a", outline: "none" },
                           }}
                           title={countryName}
                         />
                       );
                     })
                   }
                 </Geographies>
               </ZoomableGroup>
             </ComposableMap>
           </ResponsiveContainer>
           <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded text-xs shadow">
             * 地图数据基于 GeoIP
           </div>
        </div>
      </div>
    </div>
  );
};


// --- 登录组件 ---
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'admin') {
          setError('权限不足：非管理员账号');
          return;
        }
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        onLogin(data.token);
      } else {
        setError(data.message || '登录失败');
      }
    } catch (err) {
      console.error(err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">Ekko Admin</h1>
          <p className="text-slate-500 mt-2">请登录以继续</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">邮箱</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@ekko.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '立即登录'}
          </button>
          <button 
            type="button"
            onClick={() => {
                localStorage.setItem('adminToken', 'dev-bypass-token');
                localStorage.setItem('adminUser', JSON.stringify({ id: 'dev-admin-id', email: 'dev@admin.com', role: 'admin' }));
                onLogin('dev-bypass-token');
            }}
            className="w-full bg-slate-200 text-slate-800 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors mt-3"
          >
            访客模式 (免密进入)
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
          默认账号: admin@ekko.com / admin123
        </div>
      </div>
    </div>
  );
};

export default function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ totalSales: 0, orderCount: 0 });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  
  const refreshData = () => {
    if (!token) return;
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    fetch(`${API_URL}/admin/stats`, { headers }).then(res => res.json()).then(res => {
       if (res.success) setStats(res.data);
       else if (res.status === 401) handleLogout();
    }).catch(err => console.error(err));

    fetch(`${API_URL}/admin/analytics?range=today`, { headers }).then(res => res.json()).then(res => {
       if (res.success) setAnalyticsData(res.data);
    }).catch(err => console.error(err));
    
    fetch(`${API_URL}/admin/orders`, { headers }).then(res => res.json()).then(res => res.success && setOrders(res.data)).catch(err => console.error(err));
    fetch(`${API_URL}/admin/courses`, { headers }).then(res => res.json()).then(res => res.success && setCourses(res.data)).catch(err => console.error(err));
    fetch(`${API_URL}/admin/users`, { headers }).then(res => res.json()).then(res => res.success && setUsers(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { 
    if (token) refreshData(); 
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={setToken} />;
  }


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
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col p-6 shadow-xl z-10">
          <div className="flex items-center gap-3 mb-10">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/50">E</div>
             <h1 className="text-xl font-black text-white tracking-tight">Ekko Admin</h1>
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">Menu</p>
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={18}/> 控制台</button>
            <button onClick={() => setView('courses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'courses' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}><Book size={18}/> 课程管理</button>
            <button onClick={() => setView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}><Users size={18}/> 用户管理</button>
            <div className="pt-4"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">System</p>
            <button onClick={() => setView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}><Settings size={18}/> 网站设置</button>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-800">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors"><Trash2 size={18}/> 退出登录</button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
          {view === 'dashboard' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">数据概览 (今日)</h2>
                <button onClick={refreshData} className="text-blue-600 flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow hover:bg-blue-50 transition-all">
                  <RefreshCcw size={16}/> 刷新数据
                </button>
              </div>
              
              <AnalyticsDashboard data={analyticsData} />

              <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between">
                  <h3 className="font-bold">最新交易记录</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50"><tr><th className="p-4">ID</th><th className="p-4">课程</th><th className="p-4">用户</th><th className="p-4">金额</th><th className="p-4">状态</th><th className="p-4">操作</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
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
          {view === 'settings' && <SiteSettings />}
        </main>
      </div>
    </>
  );
}