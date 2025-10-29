document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  
  const forgotForm = document.getElementById('forgotForm');
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-container';
  forgotForm.parentNode.insertBefore(alertContainer, forgotForm);
  
  forgotForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const submitBtn = document.querySelector('#forgotForm .btn');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Mengirim...';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Link reset password telah dikirim ke email Anda', 'success');
        forgotForm.reset();
      } else {
        showAlert(data.message, 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showAlert('Terjadi kesalahan saat mengirim email reset', 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
