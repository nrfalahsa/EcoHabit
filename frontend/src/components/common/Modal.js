import React from 'react';
import ReactDOM from 'react-dom';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button id="closeModalBtn" className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

export default Modal;