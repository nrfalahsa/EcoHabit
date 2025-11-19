import React from 'react';

function LoadingSkeleton() {
  return (
    <main className="dashboard-main">
      <div className="container">
        <div className="dashboard-grid">
          <aside className="sidebar">
            <div className="card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
            <div className="card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          </aside>
          <section className="main-content">
            <div className="card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
            <div className="card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-chart"></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoadingSkeleton;