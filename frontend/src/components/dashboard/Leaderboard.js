import React from 'react';

function Leaderboard({ users = [] }) {
  return (
    <div className="card">
      <h2 className="card-title">
        <i className="fa-solid fa-trophy" style={{ color: '#ffd700', marginRight: '0.5rem' }}></i> 
        Papan Peringkat
      </h2>
      <div className="leaderboard">
        <ol id="leaderboardList">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={user._id} className="leaderboard-item">
                <span className="leaderboard-rank">{index + 1}</span>
                
                <img 
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt={user.name} 
                  className="leaderboard-avatar"
                />

                <div className="leaderboard-info">
                  <span className="leaderboard-name">{user.name}</span>
                  <span className="leaderboard-points">{user.totalPoints} Poin <br/> ({user.level})</span>
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