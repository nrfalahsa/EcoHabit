import React, { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

// Import semua komponen
import Header from '../components/dashboard/Header';
import LevelCard from '../components/dashboard/LevelCard';
import ImpactCard from '../components/dashboard/ImpactCard';
import BadgeGrid from '../components/dashboard/BadgeGrid';
import Leaderboard from '../components/dashboard/Leaderboard';
import Quote from '../components/dashboard/Quote';
import AiAssistant from '../components/dashboard/AiAssistant';
import ActivityList from '../components/dashboard/ActivityList';
import ProgressChart from '../components/dashboard/ProgressChart';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';

function DashboardPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [progress, activities, savings, leaderboard] = await Promise.all([
        authFetch('/progress'),
        authFetch('/activities'),
        authFetch('/progress/savings'),
        authFetch('/users/leaderboard'),
      ]);

      setDashboardData({ progress, activities, savings, leaderboard });
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server');
      showToast(err.message || 'Gagal terhubung ke server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]); 

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const refreshImpactAndProgress = async () => {
     try {
      const [progress, savings] = await Promise.all([
        authFetch('/progress'),
        authFetch('/progress/savings'),
      ]);
  
      setDashboardData(prev => ({ 
        ...prev, 
        progress, 
        savings,  
      }));
    } catch (err) {
      console.error("Gagal refresh data", err);
      showToast('Gagal memperbarui data progress', 'error');
    }
  }

  if (isLoading && !dashboardData) {
    return (
      <>
        <Header userName={user?.name} onLogoutClick={() => setIsLogoutModalOpen(true)} />
        <LoadingSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header userName={user?.name} onLogoutClick={() => setIsLogoutModalOpen(true)} />
        <ErrorMessage message={error} onRetry={loadDashboardData} />
      </>
    );
  }

  if (!dashboardData) {
     return <Header userName={user?.name} onLogoutClick={() => setIsLogoutModalOpen(true)} />;
  }

  const { progress, activities, savings, leaderboard } = dashboardData;

  return (
    <>
      <Header userName={user?.name} onLogoutClick={() => setIsLogoutModalOpen(true)} />
      
      <main className="dashboard-main">
        <div className="container">
          <div id="dashboardContent" className="dashboard-grid">
            <aside className="sidebar">
              <LevelCard 
                level={progress.level} 
                totalPoints={progress.totalPoints} 
              />
              <ImpactCard savings={savings} />
              <BadgeGrid userBadges={progress.badges} />
              <Leaderboard users={leaderboard} />
              <Quote />
              <AiAssistant completedToday={progress.todayProgress?.map(a => a.name) || []} />
            </aside>

            <section className="main-content">
              <ActivityList 
                activities={activities} 
                todayProgress={progress.todayProgress}
                onActivityCompleted={refreshImpactAndProgress} 
              />
              <ProgressChart chartData={progress.chartData} />
            </section>
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Logout"
      >
        <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
        <div className="modal-footer">
          <button onClick={() => setIsLogoutModalOpen(false)} className="btn btn-secondary">Batal</button>
          <button onClick={logout} className="btn btn-danger">Yakin, Logout</button>
        </div>
      </Modal>
    </>
  );
}

export default DashboardPage;