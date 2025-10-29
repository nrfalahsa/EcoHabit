document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  const registerForm = document.getElementById('registerForm');
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';
  registerForm.parentNode.insertBefore(alertContainer, registerForm);
  
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('#registerForm .btn');
    const originalText = submitBtn.textContent;
    
    // Validasi client-side
    if (password.length < 6) {
      showAlert('Password minimal 6 karakter', 'error');
      return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Mendaftarkan...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        saveToken(data.token);
        localStorage.setItem('ecohabit_user', JSON.stringify(data.user));
        showAlert('Registrasi berhasil! Mengarahkan ke dashboard...', 'success');
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error) {
      console.error('Register error:', error);
      showAlert('Terjadi kesalahan saat registrasi', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});