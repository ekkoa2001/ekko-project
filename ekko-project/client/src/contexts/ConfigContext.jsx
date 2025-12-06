import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

// Default configuration to prevent crashes if API fails
const DEFAULT_CONFIG = {
  site_title: 'Ekko Academy',
  site_description: 'Master Full Stack Development',
  hero_title: '从 0 到 1\n出海实战课堂',
  hero_subtitle: 'TikTok · Shopify · Facebook Ads\n真实案例 · 可复制方法论',
  hero_cta_text: '探索课程',
  hero_banner_image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
  site_logo: '', // If empty, might fallback to text
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/config`);
        if (!response.ok) {
          throw new Error('Failed to load configuration');
        }
        const result = await response.json();
        
        if (result.success && result.data) {
          // Merge with default config to ensure all keys exist
          setConfig(prev => ({ ...prev, ...result.data }));
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError(err);
        // Keep using default config on error
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const value = {
    config,
    loading,
    error,
    refreshConfig: () => {
        // Re-fetch logic if needed
        window.location.reload();
    }
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
