import React, { createContext, useState, useCallback } from 'react';
import ToastContainer from '../components/layout/ToastContainer';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export default ToastContext;