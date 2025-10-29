// Utility functions untuk autentikasi

// Gunakan relative path karena sekarang backend dan frontend di server yang sama
const API_BASE_URL = '/api';

// Cek jika user sudah login
function checkAuth() {
  const token = localStorage.getItem('ecohabit_token');
  const currentPath = window.location.pathname;
  
  // Jika sudah login dan mencoba akses halaman auth, redirect ke dashboard
  if (token && ['/', '/login', '/register', '/forgot'].includes(currentPath)) {
    window.location.href = '/dashboard';
    return;
  }
  
  // Jika belum login dan mencoba akses dashboard, redirect ke login
  if (!token && currentPath === '/dashboard') {
    window.location.href = '/login';
    return;
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
  window.location.href = '/login';
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
function handleApiError(error) {
  console.error('API Error:', error);
  if (error.status === 401) {
    logout();
  }
  throw error;
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
      const error = await response.json();
      throw { status: response.status, message: error.message };
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} fade-in`;
  alertDiv.textContent = message;
  
  // Tambah alert ke container atau body
  const container = document.querySelector('.alert-container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  // Hapus alert setelah 5 detik
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Test koneksi ke backend
async function testBackendConnection() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('✅ Backend connected:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}

// Initialize connection test ketika module loaded
testBackendConnection();