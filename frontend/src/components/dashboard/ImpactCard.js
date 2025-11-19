import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

function ImpactCard({ savings }) {
  const [analogies, setAnalogies] = useState(null);

  useEffect(() => {
    if (!savings) return;

    authFetch('/impact/analyze-impact', {
      method: 'POST',
      body: JSON.stringify(savings)
    })
    .then(setAnalogies)
    .catch(err => console.warn('Gagal memuat analogi AI:', err.message));

  }, [savings]); 

  return (
    <div className="card">
      <h2 className="card-title">Total Dampak Kamu</h2>
      <div className="impact-stats">
        <div className="impact-item">
          <span className="impact-icon">
            <i className="fa-solid fa-cloud" style={{ color: '#87CEEB' }}></i>
          </span>
          <div className="impact-text">
            <span className="impact-value" id="totalCo2">{savings.total_co2_kg || 0} kg</span>
            <span className="impact-label">CO2 Ditekan</span>
            <span className="impact-analogy">{analogies?.co2Analogy}</span>
          </div>
        </div>
        <div className="impact-item">
          <span className="impact-icon">
            <i className="fa-solid fa-tint" style={{ color: '#007bff' }}></i>
          </span>
          <div className="impact-text">
            <span className="impact-value" id="totalWater">{savings.total_water_liter || 0} L</span>
            <span className="impact-label">Air Dihemat</span>
            <span className="impact-analogy">{analogies?.waterAnalogy}</span>
          </div>
        </div>
        <div className="impact-item">
          <span className="impact-icon">
            <i className="fa-solid fa-recycle" style={{ color: '#28a745' }}></i>
          </span>
          <div className="impact-text">
            <span className="impact-value" id="totalPlastic">{savings.total_plastic_gram || 0} gr</span>
            <span className="impact-label">Plastik Dikurangi</span>
            <span className="impact-analogy">{analogies?.plasticAnalogy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImpactCard;