document.addEventListener('DOMContentLoaded', function() {
  const orderHistoryTable = document.getElementById('orderHistory').getElementsByTagName('tbody')[0];

  fetch('/orders')
    .then(response => response.json())
    .then(data => {
      data.forEach(order => {
        const row = orderHistoryTable.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);

        cell1.textContent = order.id;
        cell2.textContent = order.total_price;

        // สร้าง dropdown สำหรับเปลี่ยนสถานะ
        const statusDropdown = document.createElement('select');
        statusDropdown.innerHTML = `
          <option value="รอคิว" ${order.status === 'รอคิว' ? 'selected' : ''}>รอคิว</option>
          <option value="ปรุงเสร็จแล้ว" ${order.status === 'ปรุงเสร็จแล้ว' ? 'selected' : ''}>ปรุงเสร็จแล้ว</option>
          <option value="ได้รับแล้ว" ${order.status === 'ได้รับแล้ว' ? 'selected' : ''}>ได้รับแล้ว</option>
        `;
        statusDropdown.addEventListener('change', function() {
          updateOrderStatus(order.id, this.value);
        });
        cell3.appendChild(statusDropdown);

        cell4.textContent = order.order_date;
        cell5.innerHTML = `<button onclick="showOrderDetails(${order.id})">ดูรายละเอียด</button>`;
      });
    })
    .catch(error => {
      console.error('Error fetching order history:', error);
      orderHistoryTable.innerHTML = '<tr><td colspan="5">เกิดข้อผิดพลาดในการดึงข้อมูลประวัติการสั่งซื้อ</td></tr>';
    });
});

function showOrderDetails(orderId) {
  // เพิ่มโค้ดเพื่อแสดงรายละเอียดคำสั่งซื้อ (เช่น แสดง modal หรือ redirect ไปยังหน้าอื่น)
  alert`แสดงรายละเอียดคำสั่งซื้อ ${orderId}`};
  


function updateOrderStatus(orderId, newStatus) {
  fetch(`/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  })
  .then(response => {
    if (response.ok) {
      alert('อัปเดตสถานะสำเร็จ');
      // รีโหลดหน้าหรืออัปเดตตาราง
      location.reload(); 
    } else {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  })
  .catch(error => {
    console.error('Error updating order status:', error);
    alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
  });
}

