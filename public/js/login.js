// Login functionality
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    const messageDiv = document.getElementById('loginMessage');

    if (result.success) {
      messageDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
      setTimeout(() => {
        window.location.href = '/products';
      }, 1000);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    }
  } catch (error) {
    document.getElementById('loginMessage').innerHTML = '<div class="alert alert-error">Connection error. Please try again.</div>';
  }
});