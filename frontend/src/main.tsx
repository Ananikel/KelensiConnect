import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for process.env in browser for Gemini SDK
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { 
    env: { 
      // FIX: Cast import.meta to any to resolve TypeScript error for env property.
      API_KEY: (import.meta as any).env.VITE_API_KEY 
    } 
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);