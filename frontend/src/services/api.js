const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
 * Upload file via Backend Proxy (Menghindari CORS)
 */
export async function uploadToCatbox(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file); 

  try {
    const response = await fetch(`${API_BASE_URL}/upload/catbox`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengupload gambar');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

/**
 * Fungsi fetch terautentikasi
 * @param {string} url - URL Endpoint API
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

    if (response.status === 204) {
      return true;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && url !== '/auth/login') {
         clearAuthStorage();
         window.location.href = '/login';
      }
      throw new Error(data.message || 'Terjadi kesalahan pada server');
    }

    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}