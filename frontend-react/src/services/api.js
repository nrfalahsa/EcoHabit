// src/services/api.js
const API_BASE_URL = '/api'; // Menggunakan proxy di package.json

export function getToken() {
  return localStorage.getItem('ecohabit_token');
}

export function saveToken(token) {
  localStorage.setItem('ecohabit_token', token);
}

export function saveUser(user) {
  localStorage.setItem('ecohabit_user', JSON.stringify(user));
}

export function getUser() {
    try {
        return JSON.parse(localStorage.getItem('ecohabit_user'));
    } catch (e) {
        return null;
    }
}

export function clearAuthStorage() {
  localStorage.removeItem('ecohabit_token');
  localStorage.removeItem('ecohabit_user');
}

/**
 * Fungsi fetch terautentikasi
 * @param {string} url - URL API (tanpa /api)
 * @param {object} options - Opsi fetch (method, body, etc.)
 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

    // Handle 204 No Content
    if (response.status === 204) {
      return true;
    }

    const data = await response.json();

    if (!response.ok) {
      // Jika token expired/invalid, auto-logout
      if (response.status === 401 && url !== '/auth/login') {
         clearAuthStorage();
         window.location.href = '/login';
      }
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }

    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error; // Lempar ulang error agar bisa ditangkap oleh komponen
  }
}