// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Menggunakan proxy di package.json

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
 * Upload file ke Catbox.moe
 */
export async function uploadToCatbox(file) {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);
  // formData.append('userhash', 'YOUR_USER_HASH'); // Opsional, jika punya akun catbox

  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal mengupload gambar');
    }

    const imageUrl = await response.text(); // Catbox mengembalikan raw text URL
    return imageUrl;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
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