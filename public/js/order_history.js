document.addEventListener('DOMContentLoaded', () => {
  const orders = [
      { id: 1, total_price: 110.00, status: 'ปรุงเสร็จแล้ว', order_date: '2023-10-26' },
      { id: 2, total_price: 60.00, status: 'ได้รับแล้ว', order_date: '2023-10-25' },
      { id: 3, total_price: 55.00, status: 'รอคิว', order_date: '2023-10-24' },
      { id: 4, total_price: 120.00, status: 'ปรุงเสร็จแล้ว', order_date: '2023-10-23' },
      { id: 5, total_price: 80.00, status: 'ได้รับแล้ว', order_date: '2023-10-22' }
  ];

  const tbody = document.querySelector('#orderHistory tbody');
  orders.forEach(order => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${order.id}</td>
          <td>${order.total_price}</td>
          <td>${order.status}</td>
          <td>${new Date(order.order_date).toLocaleDateString()}</td>
          <td><button onclick="showOrderDetails(${order.id})">รายละเอียด</button></td>
      `;
      tbody.appendChild(tr);
  });
});

function showOrderDetails(orderId) {
  window.location.href = `/html/order_details.html?id=${orderId}`;
}