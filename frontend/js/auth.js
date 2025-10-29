// Utility functions untuk autentikasi

// Gunakan relative path karena sekarang backend dan frontend di server yang sama
const API_BASE_URL = '/api';

// Cek jika user sudah login
function checkAuth() {
  const token = localStorage.getItem('ecohabit_token');
  const currentPath = window.location.pathname.split('/').pop(); // Handle path lebih baik
  
  // Halaman auth
  const authPages = ['login.html', 'register.html', 'forgot.html', 'reset.html', ''];
  
  // Jika sudah login dan mencoba akses halaman auth, redirect ke dashboard
  if (token && authPages.includes(currentPath)) {
    window.location.href = 'dashboard.html'; // Eksplisit
    return false; // Hentikan eksekusi
  }
  
  // Jika belum login dan mencoba akses dashboard, redirect ke login
  if (!token && currentPath === 'dashboard.html') {
    window.location.href = 'login.html'; // Eksplisit
    return false; // Hentikan eksekusi
  }
  
  return token;
}

// Dapatkan token dari localStorage
function getToken() {
  return localStorage.getItem('ecohabit_token');
}

// Simpan token ke localStorage
function saveToken(token) {
  localStorage.setItem('ecohabit_token', token);
}

// Hapus token (logout)
function logout() {
  localStorage.removeItem('ecohabit_token');
  localStorage.removeItem('ecohabit_user');
  window.location.href = 'login.html'; // Eksplisit
}

// Dapatkan header dengan token untuk API requests
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Handle API errors
async function handleApiError(response) {
  const error = await response.json();
  const errorMessage = error.message || 'Terjadi kesalahan jaringan';
  
  console.error('API Error:', response.status, errorMessage);
  
  if (response.status === 401) {
    // Jika token tidak valid, logout paksa
    showAlert('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
    setTimeout(() => {
      logout();
    }, 2000);
  }
  
  throw new Error(errorMessage);
}

// Make authenticated API request
async function authFetch(url, options = {}) {
  const headers = getAuthHeaders();
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    // Handle no-content responses (misal: DELETE)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return true; // Sukses tanpa JSON body

  } catch (error) {
    console.error('Fetch Error:', error);
    // Rethrow error agar bisa ditangkap oleh pemanggil fungsi
    throw error;
  }
}

/**
 * Menampilkan toast notification.
 * @param {string} message - Pesan yang ingin ditampilkan.
 * @param {string} type - 'success' atau 'error'.
 */
function showAlert(message, type = 'success') {
  // Cari container, jika tidak ada, buat
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Buat elemen toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Tambahkan ke container
  toastContainer.appendChild(toast);
  
  // Tampilkan toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100); // Sedikit delay untuk memicu transisi CSS
  
  // Hapus toast setelah 3 detik
  setTimeout(() => {
    toast.classList.remove('show');
    // Hapus elemen dari DOM setelah transisi selesai
    toast.addEventListener('transitionend', () => {
      toast.remove();
      // Hapus container jika sudah kosong
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    });
  }, 3000);
}


// Test koneksi ke backend
async function testBackendConnection() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Bad response');
    const data = await response.json();
    console.log('✅ Backend connected:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}

// Initialize connection test ketika module loaded
// (Komentari jika tidak diperlukan di produksi)
// testBackendConnection();