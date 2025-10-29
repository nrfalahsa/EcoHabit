document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  const loginForm = document.getElementById('loginForm');
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';
  loginForm.parentNode.insertBefore(alertContainer, loginForm);
  
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('#loginForm .btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        saveToken(data.token);
        localStorage.setItem('ecohabit_user', JSON.stringify(data.user));
        showAlert('Login berhasil! Mengarahkan ke dashboard...', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Terjadi kesalahan saat login', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});