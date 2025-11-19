import React from 'react';

const FILTERS = [
  { name: 'Semua', iconClass: 'fas fa-layer-group' }, 
  { name: 'Rumah', iconClass: 'fas fa-house' }, 
  { name: 'Konsumsi', iconClass: 'fas fa-leaf' }, 
  { name: 'Transportasi', iconClass: 'fas fa-bus' }, 
  { name: 'Lainnya', iconClass: 'fas fa-ellipsis-h' }, 
];

function ActivityFilter({ currentFilter, onFilterChange }) {
  return (
    <div className="filter-container">
      {FILTERS.map(filter => (
        <button
          key={filter.name}
          className={`btn-filter ${currentFilter === filter.name ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.name)}
        >
          <i className={`${filter.iconClass} filter-icon`} aria-hidden="true"></i>
          {filter.name}
        </button>
      ))}
    </div>
  );
}

export default ActivityFilter;