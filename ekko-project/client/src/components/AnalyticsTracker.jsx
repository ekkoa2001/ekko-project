import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const AnalyticsTracker = () => {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(localStorage.getItem('analytics_session_id'));

  // Initialize Session ID
  if (!sessionIdRef.current) {
    sessionIdRef.current = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionIdRef.current);
  }

  const sendEvent = (type, data = {}) => {
    fetch(`${API_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sessionId: sessionIdRef.current,
        path: location.pathname,
        referrer: document.referrer,
        ...data
      })
    }).catch(err => console.error('Analytics Error:', err));
  };

  useEffect(() => {
    // 1. Track Page View
    sendEvent('pageview');
    startTimeRef.current = Date.now();

    // 2. Heartbeat (every 10s)
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      sendEvent('heartbeat', { duration });
    }, 10000);

    return () => clearInterval(interval);
  }, [location]);

  return null; // Invisible component
};

export default AnalyticsTracker;
