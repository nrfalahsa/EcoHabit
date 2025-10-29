// Data aktivitas hijau
const ecoActivities = [
  { name: 'Bawa tumbler minum', points: 10 },
  { name: 'Matikan lampu saat tidak digunakan', points: 5 },
  { name: 'Kurangi penggunaan AC', points: 15 },
  { name: 'Gunakan transportasi umum', points: 20 },
  { name: 'Tanam pohon', points: 30 },
  { name: 'Kurangi sampah plastik', points: 15 },
  { name: 'Kompos sampah organik', points: 25 },
  { name: 'Gunakan produk daur ulang', points: 10 }
];

let userData = null;
let progressData = null;
let myChartInstance = null; // <-- PERBAIKAN: Variabel baru untuk menyimpan chart

// Element selectors
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dashboardContent = document.getElementById('dashboardContent');
const logoutModal = document.getElementById('logoutModal');

document.addEventListener('DOMContentLoaded', function() {
  // Cek autentikasi
  if (!checkAuth()) {
    return;
  }
  
  // Load user data
  userData = JSON.parse(localStorage.getItem('ecohabit_user'));
  
  // Setup event listeners
  setupEventListeners();
  
  // Load dashboard data
  loadDashboardData();
});

function setupEventListeners() {
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    showModal(logoutModal);
  });
  
  // Modal close buttons
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    hideModal(logoutModal);
  });
  document.getElementById('cancelLogoutBtn').addEventListener('click', () => {
    hideModal(logoutModal);
  });
  
  // Confirm logout
  document.getElementById('confirmLogoutBtn').addEventListener('click', () => {
    logout();
  });
  
  // User info
  document.getElementById('userName').textContent = userData.name;
}

async function loadDashboardData() {
  showLoading(true);
  try {
    // Load progress data
    const progressResponse = await authFetch('/progress');
    progressData = progressResponse;
    
    // Update UI
    updateLevelBadge();
    renderActivities();
    renderChart();
    
    // Load random quote
    loadRandomQuote();
    
    // Show content
    showLoading(false);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorState(error.message || 'Gagal terhubung ke server');
  }
}

function showLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove('hidden');
    dashboardContent.classList.add('hidden');
    errorState.classList.add('hidden');
  } else {
    loadingState.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
  }
}

function showErrorState(message) {
  loadingState.classList.add('hidden');
  dashboardContent.classList.add('hidden');
  errorState.classList.remove('hidden');
  document.getElementById('errorMessageText').textContent = `Gagal memuat data: ${message}. Silakan coba muat ulang halaman.`;
}

function updateLevelBadge() {
  document.getElementById('levelBadge').textContent = getBadgeIcon(progressData.totalPoints);
  document.getElementById('levelText').textContent = progressData.level;
  document.getElementById('pointsText').textContent = `${progressData.totalPoints} Total Poin`;
}

function getBadgeIcon(points) {
  if (points <= 50) return '🌱'; // Green Starter
  if (points <= 150) return '🌿'; // Eco Explorer
  if (points <= 300) return '🌎'; // Planet Hero
  return '🔥'; // Climate Guardian
}

function renderActivities() {
  const activitiesContainer = document.getElementById('activitiesList');
  activitiesContainer.innerHTML = '';
  
  // Cek aktivitas yang sudah dikerjakan hari ini
  const today = new Date().toISOString().split('T')[0];
  const todayProgress = progressData.progress.find(p => 
    p.date.split('T')[0] === today
  );
  
  const completedToday = todayProgress ? 
    todayProgress.activities.map(a => a.name) : [];
  
  ecoActivities.forEach(activity => {
    const isCompleted = completedToday.includes(activity.name);
    
    const activityElement = document.createElement('div');
    activityElement.className = `activity-item ${isCompleted ? 'completed' : ''}`;
    activityElement.innerHTML = `
      <div class="activity-checkbox ${isCompleted ? 'checked' : ''}" 
           data-activity="${activity.name}" 
           data-points="${activity.points}">
        ${isCompleted ? '✔' : ''} 
      </div>
      <div class="activity-info">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-points">+${activity.points} poin</div>
      </div>
    `;
    
    // Add click event
    const checkbox = activityElement.querySelector('.activity-checkbox');
    if (!isCompleted) {
      checkbox.addEventListener('click', () => completeActivity(activity.name, activity.points, checkbox));
    }
    
    activitiesContainer.appendChild(activityElement);
  });
}

async function completeActivity(activityName, points, checkboxElement) {
  // Optimistic UI update
  checkboxElement.classList.add('checked', 'loading');
  checkboxElement.innerHTML = '...';
  
  try {
    const response = await authFetch('/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        activityName,
        points
      })
    });
    
    // Update local data
    progressData.totalPoints = response.totalPoints;
    progressData.level = response.level;

    // Update progressData.progress untuk hari ini
    const today = new Date().toISOString().split('T')[0];
    let todayProgress = progressData.progress.find(p => 
      p.date.split('T')[0] === today
    );
    if (!todayProgress) {
      // Jika progress hari ini belum ada di data lokal, buatkan
      todayProgress = { date: new Date().toISOString(), activities: [], dailyPoints: 0 };
      progressData.progress.push(todayProgress);
    }
    // Tambahkan aktivitas ke data lokal
    todayProgress.activities.push({ name: activityName, points: points, completed: true });
    todayProgress.dailyPoints += points;
    
    // Update UI
    updateLevelBadge();
    renderActivities(); // Render ulang semua aktivitas
    renderChart(); // Render ulang chart dengan data baru
    
    showAlert(response.message, 'success');
    
  } catch (error) {
    console.error('Error completing activity:', error);
    showAlert(error.message || 'Gagal menyimpan aktivitas', 'error');
    // Rollback UI
    checkboxElement.classList.remove('checked', 'loading');
    checkboxElement.innerHTML = '';
  }
}

function renderChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  
  // Siapkan data untuk 7 hari terakhir
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  const chartData = last7Days.map(date => {
    // Cari data poin harian dari progressData.progress
    const dayData = progressData.progress.find(d => d.date.split('T')[0] === date);
    return dayData ? dayData.dailyPoints : 0;
  });
  
  // Hancurkan chart lama jika ada
  if (myChartInstance) { // <-- PERBAIKAN: Cek variabel baru
    myChartInstance.destroy(); // <-- PERBAIKAN: Hancurkan variabel baru
  }
  
  // Buat chart baru
  myChartInstance = new Chart(ctx, { // <-- PERBAIKAN: Simpan ke variabel baru
    type: 'line',
    data: {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Poin Harian',
        data: chartData,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4CAF50'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Poin: ${context.parsed.y}`;
            }
          }
        }
      }
    }
  });
}

async function loadRandomQuote() {
  try {
    const response = await fetch(`${API_BASE_URL}/quotes/random`);
    if (!response.ok) throw new Error('Failed to fetch quote');
    const quote = await response.json();
    
    document.getElementById('quoteText').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;
    
  } catch (error) {
    console.error('Error loading quote:', error);
    document.getElementById('quoteText').textContent = '"Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan."';
    document.getElementById('quoteAuthor').textContent = '- EcoHabit';
  }
}

// Modal Helper Functions
function showModal(modalElement) {
  modalElement.classList.remove('hidden');
}

function hideModal(modalElement) {
  modalElement.classList.add('hidden');
}