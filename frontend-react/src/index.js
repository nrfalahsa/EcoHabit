// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Menghapus <React.StrictMode> untuk mengatasi masalah hook
  // yang tersembunyi dalam mode pengembangan.
  <App />
);