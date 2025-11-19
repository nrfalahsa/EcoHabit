import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';

function ToastContainer({ toasts, removeToast }) {
  return ReactDOM.createPortal(
    <div id="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    document.getElementById('toast-root')
  );
}

export default ToastContainer;