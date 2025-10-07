import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for process.env in browser for Gemini SDK
// The Vite build process replaces import.meta.env.VITE_API_KEY with the actual value.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { 
    env: { 
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
