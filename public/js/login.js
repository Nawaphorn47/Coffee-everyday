document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();  // ป้องกันการโหลดหน้าใหม่

  const error = document.getElementById('loginError');
  error.textContent = '';  // เคลียร์ข้อความผิดพลาดก่อนหน้า

  // ดึงข้อมูลจากฟอร์ม
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    // ส่งข้อมูลไปยังเซิร์ฟเวอร์
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const msg = await res.text();  // รับข้อความจากเซิร์ฟเวอร์

    if (res.ok) {
      // ถ้าการเข้าสู่ระบบสำเร็จ
      alert('Login successful!');
      window.location.href = '/html/home.html';  // ย้ายไปที่หน้า home
    } else {
      // ถ้าการเข้าสู่ระบบไม่สำเร็จ
      error.textContent = msg;  // แสดงข้อความผิดพลาด
    }
  } catch (err) {
    // ถ้ามีข้อผิดพลาดในการเชื่อมต่อ
    error.textContent = 'Something went wrong!';
    console.error(err);
  }
});
