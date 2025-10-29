document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  // Ambil token dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    showAlert('Token reset tidak valid', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }
  
  const resetForm = document.getElementById('resetForm');
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';
  resetForm.parentNode.insertBefore(alertContainer, resetForm);
  
  resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const submitBtn = document.querySelector('#resetForm .btn');
    const originalText = submitBtn.textContent;
    
    // Validasi
    if (password !== passwordConfirm) {
      showAlert('Password dan konfirmasi password tidak sama', 'error');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password minimal 6 karakter', 'error');
      return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Reset Password...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Password berhasil direset! Mengarahkan ke login...', 'success');
        
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showAlert('Terjadi kesalahan saat reset password', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
