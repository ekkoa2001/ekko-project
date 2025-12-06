const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
export const handleResponse = async (response) => {
  const data = await response.json();
  
  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optional: Redirect to login or show modal
    // window.location.href = '/'; 
    throw new Error('认证已过期，请重新登录');
  }
  
  if (!data.success) {
    throw new Error(data.message || '请求失败');
  }
  
  return data;
};

// API functions
export const api = {
  // Auth
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Config
  getConfig: async () => {
    const response = await fetch(`${API_URL}/config`);
    return handleResponse(response);
  },

  // Courses
  getCourses: async () => {
    const response = await fetch(`${API_URL}/courses`);
    return handleResponse(response);
  },

  getCourse: async (id) => {
    const response = await fetch(`${API_URL}/courses/${id}`);
    return handleResponse(response);
  },

  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },
  
  // Upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
            // No Content-Type header for FormData, browser sets it with boundary
        },
        body: formData
    });
    return handleResponse(response);
  }
};

export default api;
