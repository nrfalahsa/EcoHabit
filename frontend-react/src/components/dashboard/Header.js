// src/components/dashboard/Header.js
import React from 'react';

function Header({ userName, onLogoutClick }) {
  return (
    <header className="dashboard-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">EcoHabit</div>
          <div className="user-info">
            <span>Halo, <span id="userName">{userName || 'Pengguna'}</span>!</span>
            <button id="logoutBtn" className="btn btn-secondary btn-sm" onClick={onLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;