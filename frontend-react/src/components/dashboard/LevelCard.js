// src/components/dashboard/LevelCard.js
import React from 'react';

// Helper dari dashboard.js
function getBadgeIcon(points) {
  if (points <= 50) return '🌱';
  if (points <= 150) return '🌿';
  if (points <= 300) return '🌎';
  return '🔥';
}

function LevelCard({ level, totalPoints }) {
  return (
    <div className="card">
      <h2 className="card-title">Level & Badge</h2>
      <div className="level-badge">
        <div className="badge-icon" id="levelBadge">{getBadgeIcon(totalPoints)}</div>
        <div className="badge-info">
          <h3 id="levelText">{level}</h3>
          <p id="pointsText">{totalPoints} Total Poin</p>
        </div>
      </div>
    </div>
  );
}

export default LevelCard;