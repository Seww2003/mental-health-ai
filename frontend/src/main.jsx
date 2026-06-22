import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// ✅ 1. Base URL set කරන්න
axios.defaults.baseURL = 'http://localhost:5000';

// ✅ 2. Token එක හැම request එකටම add කරන Interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url);
    } else {
      console.log('⚠️ No token found for:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ 3. 401 error handle කරන Interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.config?.url);
    
    if (error.response?.status === 401) {
      console.log('🔴 401 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

console.log('🚀 MindMate App Starting...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);