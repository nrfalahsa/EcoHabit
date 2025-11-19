import React from 'react';

function LevelCard({ level, totalPoints }) {
  const getLevelImage = (levelName) => {
    if (!levelName) return 'default'; 
    return levelName.replace(/\s+/g, '-');
  };

  const imageSrc = `/level/${getLevelImage(level)}.png`;

  return (
    <div className="card">
      <h2 className="card-title">Level & Badge</h2>
      <div className="level-badge">
        <div className="badge-icon" id="levelBadge">
          <img 
            src={imageSrc} 
            alt={`Lencana ${level}`} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none'; 
            }}
          />
        </div>
        
        <div className="badge-info">
          <h3 id="levelText">{level}</h3>
          <p id="pointsText">{totalPoints} Total Poin</p>
        </div>
      </div>
    </div>
  );
}

export default LevelCard;