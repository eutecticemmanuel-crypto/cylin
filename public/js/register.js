// Registration functionality
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const interests = Array.from(document.getElementById('interests').selectedOptions).map(option => option.value);

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    interests
  };

  try {
    const res = await fetch('/api/customers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    const messageDiv = document.getElementById('registerMessage');

    if (result.success) {
      messageDiv.innerHTML = '<div class="alert alert-success">Registration successful! You can now sign in.</div>';
      e.target.reset();
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-error">${result.error}</div>`;
    }
  } catch (error) {
    document.getElementById('registerMessage').innerHTML = '<div class="alert alert-error">Connection error. Please try again.</div>';
  }
});