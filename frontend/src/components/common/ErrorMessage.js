import React from 'react';

function ErrorMessage({ message, onRetry }) {
  return (
    <main className="dashboard-main">
      <div className="container">
        <div className="card error-card">
          <h2 className="card-title">Terjadi Kesalahan</h2>
          <p>
            {message || 'Gagal memuat data dashboard.'}
          </p>
          <button onClick={onRetry} className="btn">Muat Ulang</button>
        </div>
      </div>
    </main>
  );
}

export default ErrorMessage;