// src/components/dashboard/BadgeGrid.js
import React from 'react';

// Konstanta dari dashboard.js
const allBadgesDefinition = {
  // Poin
  'POIN_1': { name: 'Poin Pertama', icon: '✨' },
  'POIN_100': { name: 'Kolektor Poin', icon: '💰' },
  'POIN_500': { name: 'Master Poin', icon: '👑' },
  // Level
  'LEVEL_EXPLORER': { name: 'Eco Explorer', icon: '🌿' },
  'LEVEL_HERO': { name: 'Planet Hero', icon: '🌎' },
  // Dampak
  'AIR_50L': { name: 'Penghemat Air', icon: '💧' },
  'AIR_200L': { name: 'Pahlawan Air', icon: '🌊' },
  'CO2_10KG': { name: 'Penyerap Karbon', icon: '💨' },
  'CO2_50KG': { name: 'Pejuang Iklim', icon: '🌳' },
  'PLASTIK_100G': { name: 'Anti-Plastik', icon: '♻️' },
  'PLASTIK_500G': { name: 'Bebas Plastik', icon: '🚫' },
};

function BadgeGrid({ userBadges = [] }) {
  return (
    <div className="card">
      <h2 className="card-title">🏆 Lencana Saya</h2>
      <div className="badge-grid" id="badgeGrid">
        {Object.entries(allBadgesDefinition).map(([badgeId, badge]) => {
          const isUnlocked = userBadges.includes(badgeId);
          return (
            <div key={badgeId} className={`badge-item ${isUnlocked ? 'unlocked' : ''}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-tooltip">
                <strong>{badge.name}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeGrid;