// ดึงข้อมูลรายได้วันนี้
fetch('/daily-revenue') // เปลี่ยน '/daily-revenue' เป็น URL ของ API ของคุณ
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            document.getElementById('today-income').textContent = data[0].daily_revenue.toFixed(2) + ' บาท';
            // เพิ่มโค้ดสำหรับคำนวณเปอร์เซ็นต์การเปลี่ยนแปลงจากเมื่อวาน (ถ้ามี API)
        }
    })
    .catch(error => console.error('Error fetching today revenue: ', error));

// ฟังก์ชันออกจากระบบ (logout)
function logout() {
    // เพิ่มโค้ดสำหรับออกจากระบบ (เช่น ล้าง session หรือ token)
    window.location.href = '/html/login.html'; // เปลี่ยนเส้นทางไปยังหน้า login
}