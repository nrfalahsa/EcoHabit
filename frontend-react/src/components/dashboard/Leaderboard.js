// src/components/dashboard/Leaderboard.js
import React from 'react';

function Leaderboard({ users = [] }) {
  return (
    <div className="card">
      <h2 className="card-title">🏆 Papan Peringkat</h2>
      <div className="leaderboard">
        <ol id="leaderboardList">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={user._id} className="leaderboard-item">
                <span className="leaderboard-rank">{index + 1}</span>
                <div className="leaderboard-info">
                  <span className="leaderboard-name">{user.name}</span>
                  <span className="leaderboard-points">{user.totalPoints} Poin ({user.level})</span>
                </div>
              </li>
            ))
          ) : (
            <p>Belum ada data peringkat.</p>
          )}
        </ol>
      </div>
    </div>
  );
}

export default Leaderboard;