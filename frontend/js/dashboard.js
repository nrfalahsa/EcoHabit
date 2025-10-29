// (Data aktivitas tidak lagi di hardcode di sini)

let userData = null;
let progressData = null; // Data progress 7 hari
let allActivities = []; // Daftar semua aktivitas dari backend
let myChartInstance = null; 

// Element selectors
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const dashboardContent = document.getElementById('dashboardContent');
const logoutModal = document.getElementById('logoutModal');

document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  userData = JSON.parse(localStorage.getItem('ecohabit_user'));
  setupEventListeners();
  loadDashboardData();
});

function setupEventListeners() {
  // Event listener untuk modal (aman, tidak akan error jika elemen tidak ada)
  document.getElementById('logoutBtn')?.addEventListener('click', () => showModal(logoutModal));
  document.getElementById('closeModalBtn')?.addEventListener('click', () => hideModal(logoutModal));
  document.getElementById('cancelLogoutBtn')?.addEventListener('click', () => hideModal(logoutModal));
  document.getElementById('confirmLogoutBtn')?.addEventListener('click', () => logout());
  
  // PERBAIKAN: Cek apakah elemen 'userName' ada
  const userNameEl = document.getElementById('userName');
  if(userData && userNameEl) {
    userNameEl.textContent = userData.name;
  }
}

async function loadDashboardData() {
  showLoading(true);
  try {
    // 1. Ambil semua data yang diperlukan secara bersamaan
    // (Jika salah satu gagal, semua akan masuk ke catch block)
    const [progressResponse, activitiesResponse, savingsResponse, leaderboardResponse, quoteResponse] = await Promise.all([
      authFetch('/progress'),        // Data progress 7 hari & poin
      authFetch('/activities'),      // Daftar aktivitas
      authFetch('/progress/savings'),  // Total dampak
      authFetch('/users/leaderboard'),
      fetch(`${API_BASE_URL}/quotes/random`) // Quote
    ]);

    // 2. Simpan data
    progressData = progressResponse;
    allActivities = activitiesResponse;
    
    // 3. Render semua komponen
    updateLevelBadge();
    renderActivities();
    renderChart();
    renderImpactStats(savingsResponse); // <-- Ini yang mungkin menyebabkan error
    renderLeaderboard(leaderboardResponse);
    
    // Cek quote
    if (quoteResponse.ok) {
      const quote = await quoteResponse.json();
      renderQuote(quote.text, quote.author);
    } else {
      // Jika quote gagal, jangan hentikan semua, beri default
      console.error('Gagal memuat quote');
      renderQuote("Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan.", "EcoHabit");
    }
    
    showLoading(false);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorState(error.message || 'Gagal terhubung ke server');
  }
}



function showLoading(isLoading) {
  if (isLoading) {
    loadingState?.classList.remove('hidden');
    dashboardContent?.classList.add('hidden');
    errorState?.classList.add('hidden');
  } else {
    loadingState?.classList.add('hidden');
    dashboardContent?.classList.remove('hidden');
  }
}

function showErrorState(message) {
  loadingState?.classList.add('hidden');
  dashboardContent?.classList.add('hidden');
  
  const errorStateEl = document.getElementById('errorState');
  const errorMessageTextEl = document.getElementById('errorMessageText');

  if (errorStateEl) errorStateEl.classList.remove('hidden');
  // Tampilkan pesan error yang diterima
  if (errorMessageTextEl) errorMessageTextEl.textContent = `Gagal memuat data: ${message}. Silakan coba muat ulang halaman.`;
}

function updateLevelBadge() {
  // PERBAIKAN: Cek setiap elemen sebelum diisi
  const levelBadgeEl = document.getElementById('levelBadge');
  const levelTextEl = document.getElementById('levelText');
  const pointsTextEl = document.getElementById('pointsText');
  
  if(levelBadgeEl) levelBadgeEl.textContent = getBadgeIcon(progressData.totalPoints);
  if(levelTextEl) levelTextEl.textContent = progressData.level;
  if(pointsTextEl) pointsTextEl.textContent = `${progressData.totalPoints} Total Poin`;
}

function getBadgeIcon(points) {
  if (points <= 50) return '🌱';
  if (points <= 150) return '🌿';
  if (points <= 300) return '🌎';
  return '🔥';
}

function renderActivities() {
  const activitiesContainer = document.getElementById('activitiesList');
  if (!activitiesContainer) return; // Jika kontainer tidak ada, hentikan fungsi

  activitiesContainer.innerHTML = '';
  
  const completedToday = progressData.todayProgress ? 
    progressData.todayProgress.map(a => a.name) : [];
  
  allActivities.forEach(activity => {
    const isCompleted = completedToday.includes(activity.name);
    
    const activityElement = document.createElement('div');
    activityElement.className = `activity-item ${isCompleted ? 'completed' : ''}`;
    activityElement.innerHTML = `
      <div class="activity-checkbox ${isCompleted ? 'checked' : ''}" 
           data-activity-name="${activity.name}">
        ${isCompleted ? '✔' : ''} 
      </div>
      <div class="activity-info">
        <div class="activity-name">${activity.name}</div>
        <div class="activity-points">+${activity.points} poin</div>
      </div>
    `;
    
    const checkbox = activityElement.querySelector('.activity-checkbox');
    if (checkbox && !isCompleted) {
      checkbox.addEventListener('click', () => completeActivity(activity.name, checkbox));
    }
    
    activitiesContainer.appendChild(activityElement);
  });
}

async function completeActivity(activityName, checkboxElement) {
  checkboxElement.classList.add('checked', 'loading');
  checkboxElement.innerHTML = '...';
  
  try {
    const response = await authFetch('/progress/update', {
      method: 'POST',
      body: JSON.stringify({ activityName })
    });
    
    // Perbarui data lokal
    progressData.totalPoints = response.totalPoints;
    progressData.level = response.level;
    
    if (progressData.todayProgress) {
        progressData.todayProgress.push({ name: activityName, points: response.points });
    } else {
        progressData.todayProgress = [{ name: activityName, points: response.points }];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let todayChartData = progressData.chartData.find(d => d.date === todayStr);
    if(todayChartData) {
      todayChartData.points += response.points;
    } else {
      progressData.chartData.push({ date: todayStr, points: response.points });
    }

    // Muat ulang total dampak
    const savingsResponse = await authFetch('/progress/savings');
    renderImpactStats(savingsResponse);

    // Render ulang UI
    updateLevelBadge();
    renderActivities();
    renderChart();
    
    showAlert(response.message, 'success');
    
  } catch (error) {
    console.error('Error completing activity:', error);
    showAlert(error.message || 'Gagal menyimpan aktivitas', 'error');
    // Rollback UI
    checkboxElement.classList.remove('checked', 'loading');
    checkboxElement.innerHTML = '';
  }
}

// PERBAIKAN: Cek elemen sebelum mengisi. Ini adalah sumber error Anda.
function renderImpactStats(data) {
  const totalCo2El = document.getElementById('totalCo2');
  const totalWaterEl = document.getElementById('totalWater');
  const totalPlasticEl = document.getElementById('totalPlastic');

  if(totalCo2El) totalCo2El.textContent = `${data.total_co2_kg || 0} kg`;
  if(totalWaterEl) totalWaterEl.textContent = `${data.total_water_liter || 0} L`;
  if(totalPlasticEl) totalPlasticEl.textContent = `${data.total_plastic_gram || 0} gr`;
}

function renderLeaderboard(users) {
  const listEl = document.getElementById('leaderboardList');
  if (!listEl) return; // Cek keamanan

  listEl.innerHTML = ''; // Kosongkan list

  if (!users || users.length === 0) {
    listEl.innerHTML = '<p>Belum ada data peringkat.</p>';
    return;
  }

  users.forEach((user, index) => {
    const rank = index + 1;
    const li = document.createElement('li');
    li.className = 'leaderboard-item';
    
    li.innerHTML = `
      <span class="leaderboard-rank">${rank}</span>
      <div class="leaderboard-info">
        <span class="leaderboard-name">${user.name}</span>
        <span class="leaderboard-points">${user.totalPoints} Poin (${user.level})</span>
      </div>
    `;
    
    listEl.appendChild(li);
  });
}

function renderChart() {
  const ctxEl = document.getElementById('progressChart');
  if (!ctxEl) return; // Jika canvas tidak ada, jangan render chart

  const ctx = ctxEl.getContext('2d');
  
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  const chartDataPoints = last7Days.map(date => {
    const dayData = progressData.chartData.find(d => d.date === date);
    return dayData ? dayData.points : 0;
  });
  
  if (myChartInstance) {
    myChartInstance.destroy();
  }
  
  myChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Poin Harian',
        data: chartDataPoints,
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
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// PERBAIKAN: Cek elemen sebelum mengisi
function renderQuote(text, author) {
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');

  if(quoteTextEl) quoteTextEl.textContent = `"${text}"`;
  if(quoteAuthorEl) quoteAuthorEl.textContent = `- ${author}`;
}

// Modal Helper Functions
function showModal(modalElement) {
  if (modalElement) modalElement.classList.remove('hidden');
}

function hideModal(modalElement) {
  if (modalElement) modalElement.classList.add('hidden');
}