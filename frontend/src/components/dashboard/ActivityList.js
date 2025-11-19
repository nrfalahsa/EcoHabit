import React, { useState } from 'react';
import ActivityFilter from './ActivityFilter';
import ActivityItem from './ActivityItem';
import { authFetch } from '../../services/api';
import { useToast } from '../../hooks/useToast';

function ActivityList({ activities, todayProgress = [], onActivityCompleted }) {
  const [currentFilter, setCurrentFilter] = useState('Semua');
  const { showToast } = useToast();
  
  const completedTodayNames = todayProgress.map(a => a.name);

  const filteredActivities = activities.filter(activity => {
    if (currentFilter === 'Semua') return true;
    return activity.category === currentFilter;
  });

  const handleCompleteActivity = async (activityName) => {
    try {
      const response = await authFetch('/progress/update', {
        method: 'POST',
        body: JSON.stringify({ activityName })
      });
      
      showToast(response.message, 'success');
      
      if (response.newBadges && response.newBadges.length > 0) {
        response.newBadges.forEach((badge, index) => {
          setTimeout(() => {
            showToast(`🏆 Lencana Baru: ${badge.name}!`, 'success');
          }, (index + 1) * 1000);
        });
      }
      
      onActivityCompleted();

    } catch (error) {
      console.error('Error completing activity:', error);
      showToast(error.message || 'Gagal menyimpan aktivitas', 'error');
      throw error;
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Aktivitas Hijau Hari Ini</h2>
      <ActivityFilter 
        currentFilter={currentFilter} 
        onFilterChange={setCurrentFilter} 
      />
      <div id="activitiesList">
        {filteredActivities.map(activity => (
          <ActivityItem 
            key={activity._id || activity.name}
            activity={activity}
            isCompleted={completedTodayNames.includes(activity.name)}
            onComplete={handleCompleteActivity}
          />
        ))}
      </div>
    </div>
  );
}

export default ActivityList;