// (Data aktivitas tidak lagi di hardcode di sini)

let userData = null;
let progressData = null; // Data progress 7 hari
let allActivities = []; // Daftar semua aktivitas dari backend
let myChartInstance = null; 
let currentActivityFilter = 'Semua';

const allBadges = {
  // Poin
  'POIN_1': { name: 'Poin Pertama', icon: '✨' },
  'POIN_100': { name: 'Kolektor Poin', icon: '💰' },
  'POIN_500': { name: 'Master Poin', icon: '👑' },
  // Level
  'LEVEL_EXPLORER': { name: 'Eco Explorer', icon: '🌿' },
  'LEVEL_HERO': { name: 'Planet Hero', icon: '🌎' },
  // Dampak
  'AIR_50L': { name: 'Penghemat Air', icon: '💧' },
  'AIR_200L': { name: 'Pahlawan Air', icon: '🌊' },
  'CO2_10KG': { name: 'Penyerap Karbon', icon: '💨' },
  'CO2_50KG': { name: 'Pejuang Iklim', icon: '🌳' },
  'PLASTIK_100G': { name: 'Anti-Plastik', icon: '♻️' },
  'PLASTIK_500G': { name: 'Bebas Plastik', icon: '🚫' },
};

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

  // --- EVENT LISTENER AI BARU ---
  document.getElementById('aiAskBtn')?.addEventListener('click', handleAskEco);
  document.getElementById('aiSuggestBtn')?.addEventListener('click', handleSuggestActivity);
  document.querySelectorAll('.btn-filter').forEach(button => {
    button.addEventListener('click', () => {
      // Hapus kelas .active dari tombol lama
      document.querySelector('.btn-filter.active').classList.remove('active');
      // Tambah kelas .active ke tombol baru
      button.classList.add('active');
      // Set filter global
      currentActivityFilter = button.dataset.filter;
      // Render ulang aktivitas dengan filter baru
      renderActivities();
    });
  });
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
    renderBadges(progressData.badges);

    showLoading(false);

    // 5. Muat data AI secara asinkron (tidak memblokir UI)
    loadAiMotivation();
    loadImpactAnalogies(savingsResponse);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorState(error.message || 'Gagal terhubung ke server');
  }
}

// --- FUNGSI AI BARU ---

async function loadAiMotivation() {
  try {
    const quoteTextEl = document.getElementById('aiQuoteText');
    const quoteAuthorEl = document.getElementById('aiQuoteAuthor');
    
    const response = await authFetch('/ai/motivation', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        level: progressData.level
      })
    });
    
    if(quoteTextEl) quoteTextEl.textContent = response.text;
    if(quoteAuthorEl) quoteAuthorEl.textContent = `- ${response.author}`;

  } catch (error) {
    console.warn('Gagal memuat motivasi AI:', error.message);
    renderQuote("Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan.", "EcoHabit");
  }
}

async function loadImpactAnalogies(savings) {
  try {
    const response = await authFetch('/ai/analyze-impact', {
      method: 'POST',
      body: JSON.stringify(savings)
    });

    const co2AnalogyEl = document.getElementById('co2Analogy');
    const waterAnalogyEl = document.getElementById('waterAnalogy');
    const plasticAnalogyEl = document.getElementById('plasticAnalogy');

    if (co2AnalogyEl) co2AnalogyEl.textContent = response.co2Analogy;
    if (waterAnalogyEl) waterAnalogyEl.textContent = response.waterAnalogy;
    if (plasticAnalogyEl) plasticAnalogyEl.textContent = response.plasticAnalogy;

  } catch (error) {
    console.warn('Gagal memuat analogi AI:', error.message);
  }
}

async function handleAskEco() {
  const inputEl = document.getElementById('aiQuestionInput');
  const responseArea = document.getElementById('aiResponseArea');
  const btn = document.getElementById('aiAskBtn');
  const question = inputEl.value;

  if (!question) {
    showAlert('Silakan tulis pertanyaan Anda', 'error');
    return;
  }

  responseArea.textContent = 'Asisten Eco sedang berpikir...';
  btn.disabled = true;

  try {
    const response = await authFetch('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
    responseArea.innerHTML = formatAIResponse(response.answer);
    inputEl.value = ''; // Kosongkan input
  } catch (error) {
    responseArea.innerHTML = `Maaf, terjadi kesalahan: ${error.message}`;
  } finally {
    btn.disabled = false;
  }
}

async function handleSuggestActivity() {
  const responseArea = document.getElementById('aiResponseArea');
  const btn = document.getElementById('aiSuggestBtn');
  
  const completedToday = progressData.todayProgress ? 
    progressData.todayProgress.map(a => a.name) : [];

  responseArea.textContent = 'Mencari saran aktivitas...';
  btn.disabled = true;

  try {
    const response = await authFetch('/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ completedActivities: completedToday })
    });
    responseArea.innerHTML = formatAIResponse(response.suggestion);
  } catch (error) {
    responseArea.innerHTML = `Maaf, terjadi kesalahan: ${error.message}`;
  } finally {
    btn.disabled = false;
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

/**
 * Mengubah teks AI (Markdown sederhana) menjadi HTML
 * @param {string} text Teks dari AI
 * @returns {string} String HTML
 */
function formatAIResponse(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Mengubah **bold** menjadi <strong>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')       // Mengubah *italic* menjadi <em>
    .replace(/^- (.*)$/gm, '<li>$1</li>');      // Mengubah - bullet menjadi <li>

  // Jika ada <li>, bungkus dengan <ul>
  if (html.includes('<li>')) {
    html = '<ul>' + html.replace(/<\/li>\s*<li>/g, '</li><li>') + '</ul>';
  }
  
  return html;
}

function renderActivities() {
  const activitiesContainer = document.getElementById('activitiesList');
  if (!activitiesContainer) return; // Jika kontainer tidak ada, hentikan fungsi

  activitiesContainer.innerHTML = '';
  
  const completedToday = progressData.todayProgress ? 
    progressData.todayProgress.map(a => a.name) : [];

  // --- LOGIKA FILTER DIMASUKKAN DI SINI ---
  const filteredActivities = allActivities.filter(activity => {
    if (currentActivityFilter === 'Semua') {
      return true; // Tampilkan semua
    }
    return activity.category === currentActivityFilter; // Tampilkan kategori yang cocok
  });
  
  filteredActivities.forEach(activity => {
    const isCompleted = completedToday.includes(activity.name);
    
    const activityElement = document.createElement('div');
    activityElement.className = `activity-item ${isCompleted ? 'completed' : ''}`;
    activityElement.innerHTML = `
      <div class="activity-checkbox ${isCompleted ? 'checked' : ''}" 
           data-activity-name="${activity.name}">
        ${isCompleted ? '✓' : ''} 
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
    progressData.badges = response.badges;
    
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
    // Muat ulang analogi AI
    loadImpactAnalogies(savingsResponse);

    // Render ulang UI
    updateLevelBadge();
    renderActivities();
    renderChart();
    renderBadges(progressData.badges);
    
    showAlert(response.message, 'success');

    // --- 5. TAMPILKAN ALERT LENCANA BARU ---
    if (response.newBadges && response.newBadges.length > 0) {
      response.newBadges.forEach((badge, index) => {
        // Beri sedikit jeda agar tidak tumpang tindih
        setTimeout(() => {
          showAlert(`🏆 Lencana Baru: ${badge.name}!`, 'success');
        }, (index + 1) * 1000);
      });
    }
    
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

// --- 6. TAMBAHKAN FUNGSI RENDER LENCANA BARU ---
// (Letakkan di dekat fungsi render lainnya, misal setelah renderLeaderboard)

function renderBadges(userBadges = []) {
  const badgeGrid = document.getElementById('badgeGrid');
  if (!badgeGrid) return;

  badgeGrid.innerHTML = ''; // Kosongkan grid

  // Loop melalui SEMUA lencana yang mungkin
  for (const badgeId in allBadges) {
    const badge = allBadges[badgeId];
    const isUnlocked = userBadges.includes(badgeId);

    const badgeElement = document.createElement('div');
    badgeElement.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
    
    badgeElement.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-tooltip">
        <strong>${badge.name}</strong>
      </div>
    `;
    
    badgeGrid.appendChild(badgeElement);
  }
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