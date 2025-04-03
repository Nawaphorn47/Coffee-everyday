
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = document.getElementById('registerError');
    error.textContent = '';
  
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const username = document.getElementById('username').value; 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    if (password !== confirmPassword) {
      error.textContent = 'Passwords do not match';
      return;
    }
  

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, first_name: firstName, last_name: lastName })
      });
  
      const msg = await res.text();
      if (res.ok) {
        alert('Registration successful!');
        window.location.href = '/html/login.html';
      } else {
        error.textContent = msg;
      }
    } catch (err) {
      error.textContent = 'Something went wrong!';
      console.error(err);
    }
  });
  