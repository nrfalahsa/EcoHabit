// src/components/dashboard/LevelCard.js
import React from 'react';

function LevelCard({ level, totalPoints }) {
  // Fungsi untuk memformat nama level menjadi nama file
  // Contoh: "Eco Warrior" -> "Eco-Warrior"
  const getLevelImage = (levelName) => {
    if (!levelName) return 'default'; 
    // Mengganti spasi dengan dash (-) agar sesuai dengan format file pada umumnya
    return levelName.replace(/\s+/g, '-');
  };

  // Path gambar: /public/level/Nama-Level.png
  const imageSrc = `/level/${getLevelImage(level)}.png`;

  return (
    <div className="card">
      <h2 className="card-title">Level & Badge</h2>
      <div className="level-badge">
        {/* Bagian Icon diganti dengan Image */}
        <div className="badge-icon" id="levelBadge">
          <img 
            src={imageSrc} 
            alt={`Lencana ${level}`} 
            // Fallback jika gambar tidak ditemukan (opsional, bisa dihapus jika yakin file selalu ada)
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none'; // Sembunyikan jika error
            }}
          />
        </div>
        
        {/* Tulisan Level dan Poin tetap dipertahankan */}
        <div className="badge-info">
          <h3 id="levelText">{level}</h3>
          <p id="pointsText">{totalPoints} Total Poin</p>
        </div>
      </div>
    </div>
  );
}

export default LevelCard;