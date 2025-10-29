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
  document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
    }
  });
  
  // User info
  document.getElementById('userName').textContent = userData.name;
}

async function loadDashboardData() {
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
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showAlert('Gagal memuat data dashboard', 'error');
  }
}

function updateLevelBadge() {
  const badgeElement = document.getElementById('levelBadge');
  const levelText = document.getElementById('levelText');
  const pointsText = document.getElementById('pointsText');
  
  badgeElement.textContent = getBadgeIcon(progressData.totalPoints);
  levelText.textContent = progressData.level;
  pointsText.textContent = `${progressData.totalPoints} Total Poin`;
}

function getBadgeIcon(points) {
  if (points <= 50) return '🌱';
  if (points <= 150) return '🌿';
  if (points <= 300) return '🌎';
  return '🔥';
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
        ${isCompleted ? '✓' : ''}
      </div>
      <div class="activity-info">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-points">+${activity.points} poin</div>
      </div>
    `;
    
    // Add click event
    const checkbox = activityElement.querySelector('.activity-checkbox');
    if (!isCompleted) {
      checkbox.addEventListener('click', () => completeActivity(activity.name, activity.points));
    }
    
    activitiesContainer.appendChild(activityElement);
  });
}

async function completeActivity(activityName, points) {
  try {
    const response = await authFetch('/progress/update', {
      method: 'POST',
      body: JSON.stringify({
        activityName,
        points
      })
    });
    
    // Update local data
    userData.totalPoints = response.totalPoints;
    userData.level = response.level;
    localStorage.setItem('ecohabit_user', JSON.stringify(userData));
    
    // Update UI
    updateLevelBadge();
    renderActivities();
    renderChart();
    
    showAlert(response.message, 'success');
    
  } catch (error) {
    console.error('Error completing activity:', error);
    showAlert('Gagal menyimpan aktivitas', 'error');
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
    const dayData = progressData.chartData.find(d => d.date === date);
    return dayData ? dayData.points : 0;
  });
  
  // Hancurkan chart lama jika ada
  if (window.progressChart) {
    window.progressChart.destroy();
  }
  
  // Buat chart baru
  window.progressChart = new Chart(ctx, {
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
        fill: true
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
    const quote = await response.json();
    
    document.getElementById('quoteText').textContent = `"${quote.text}"`;
    document.getElementById('quoteAuthor').textContent = `- ${quote.author}`;
    
  } catch (error) {
    console.error('Error loading quote:', error);
    document.getElementById('quoteText').textContent = '"Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan."';
    document.getElementById('quoteAuthor').textContent = '- EcoHabit';
  }
}
