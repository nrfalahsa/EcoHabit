// src/components/dashboard/ActivityItem.js
import React, { useState } from 'react';
import Modal from '../common/Modal';

function ActivityItem({ activity, isCompleted, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = async () => {
    if (isCompleted || isLoading) return;
    
    setIsLoading(true);
    await onComplete(activity.name);
    // isLoading di-reset oleh parent re-render, 
    // tapi kita set false jika terjadi error & parent tidak re-render
    setIsLoading(false); 
  };

  const checkboxClass = `activity-checkbox ${isCompleted ? 'checked' : ''} ${isLoading ? 'loading' : ''}`;

  return (
    <>
      <div className={`activity-item ${isCompleted ? 'completed' : ''}`}>
        <div 
          className={checkboxClass} 
          onClick={handleClick}
          role="checkbox"
          aria-checked={isCompleted}
          tabIndex={0}
        >
          {isLoading ? '...' : (isCompleted ? '✓' : '')}
        </div>
        <div className="activity-info">
          <div className="activity-name">{activity.name}</div>
          <div className="activity-points">+{activity.points} poin</div>
        </div>
        <button className="activity-info-btn" onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}>💡</button>
      </div>

      {/* Modal Edukasi */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={activity.name}
      >
        <div className="education-modal-body">
            <h4>Mengapa aktivitas ini penting?</h4>
            <p>{activity.description || 'Informasi belum tersedia.'}</p>
            <h4>Bagaimana caranya?</h4>
            <p>{activity.howTo || 'Tips belum tersedia.'}</p>
        </div>
        <div className="modal-footer">
            <button onClick={() => setIsModalOpen(false)} className="btn">Mengerti</button>
        </div>
      </Modal>
    </>
  );
}

export default ActivityItem;