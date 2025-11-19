import React from 'react';

const allBadgesDefinition = {
  // Poin
  'POIN_1': { name: 'Poin-Pertama' },
  'POIN_100': { name: 'Kolektor-Poin' },
  'POIN_500': { name: 'Master-Poin' },
  // Level
  'LEVEL_EXPLORER': { name: 'Eco-Explorer' },
  'LEVEL_HERO': { name: 'Planet-Hero' },
  // Dampak
  'AIR_50L': { name: 'Penghemat-Air' },
  'AIR_200L': { name: 'Pahlawan-Air' },
  'CO2_10KG': { name: 'Penyerap-Karbon' },
  'CO2_50KG': { name: 'Pejuang-Iklim' },
  'PLASTIK_100G': { name: 'Anti-Plastik' },
  'PLASTIK_500G': { name: 'Bebas-Plastik' },
};

function BadgeGrid({ userBadges = [] }) {
  return (
    <div className="card">
      <h2 className="card-title">
        <i className="fa-solid fa-award" style={{ color: '#FFD700', marginRight: '0.5rem' }}></i> 
        Lencana Saya
      </h2>
      <div className="badge-grid" id="badgeGrid">
        {Object.entries(allBadgesDefinition).map(([badgeId, badge]) => {
          const isUnlocked = userBadges.includes(badgeId);
          
          const imagePath = `/lencana/${badge.name}.png`;

          return (
            <div key={badgeId} className={`badge-item ${isUnlocked ? 'unlocked' : ''}`}>
              <img 
                src={imagePath} 
                alt={badge.name} 
                className="badge-image"
              />
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