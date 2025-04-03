document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('loginError');
  error.textContent = '';

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const msg = await res.text();
    if (res.ok) {
      alert('Login successful!');
      window.location.href = '/html/home.html';
    } else {
      error.textContent = msg;
    }
  } catch (err) {
    error.textContent = 'Something went wrong!';
    console.error(err);
  }
});
