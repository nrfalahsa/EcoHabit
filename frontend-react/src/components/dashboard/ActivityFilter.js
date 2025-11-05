// src/components/dashboard/ActivityFilter.js
import React from 'react';

const FILTERS = ['Semua', 'Rumah', 'Konsumsi', 'Transportasi', 'Lainnya'];

function ActivityFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="filter-container">
      {FILTERS.map(filter => (
        <button
          key={filter}
          className={`btn-filter ${currentFilter === filter ? 'active' : ''}`}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

export default ActivityFilter;