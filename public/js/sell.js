let menuItems = []; // ไว้รอรอรับข้อมูลจากหลังบ้าน
let order = []; // เพิ่มการประกาศตัวแปร order เป็นอาร์เรย์เปล่า

// ฟังก์ชันที่แสดงเมนูบนหน้าเว็บ
function renderMenu() {
    const menuContainer = document.getElementById('menuList');
    menuContainer.innerHTML = ''; // เคลียร์เมนูเดิมก่อน

    menuItems.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('item');
        div.innerHTML = `
      <img src="${item.image || '/images/default.jpg'}" alt="${item.name}">
      <h4>${item.name}</h4>
        
        <p>ประเภท: ${item.type || 'ไม่มีประเภท'}</p>
      <p>ราคา: ฿${item.price}</p>
      <button onclick="addToOrder(${item.id})">เพิ่มไปยังตะกร้า</button>
    `;
        menuContainer.appendChild(div);
    });
}

// ฟังก์ชันดึงข้อมูลเมนูจาก API 
async function fetchMenuItems() {
    try {
        const response = await fetch('/api/menu');
        if (!response.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลเมนูได้');
        }
        menuItems = await response.json(); // แปลงข้อมูล JSON ที่ได้มาเป็นอาร์เรย์
        renderMenu(); //renderMenu คือไว้แสดงขึ้นหน้าเว็บ
    } catch (error) {
        console.error('Error fetching menu:', error);
        alert('เกิดข้อผิดพลาดในการโหลดเมนู: ' + error.message);

        // กรณีมีข้อผิดพลาด ใช้ข้อมูลเดิมแทน
        menuItems = [
            { id: 1, name: 'Americano 02', price: 30, image: '/images/Americano.jpg' },
            { id: 2, name: 'Americano a1', price: 70, image: '/images/Americano.jpg' },
            { id: 3, name: 'Latte', price: 50, image: '/images/Latte.jpg' },
            { id: 4, name: 'Espresso', price: 60, image: '/images/Espresso.jpg' },
            { id: 5, name: 'Cappuccino', price: 50, image: '/images/Cappuccino.jpg' }
        ];
        renderMenu(); // ก็ใช้ข้อมูลนี้ไปถ้าดึงมาจาก backend ไม่ได้
    }
}

// เพิ่มฟังก์ชัน addToOrder สำหรับเพิ่มเมนูไปยังรายการสั่งซื้อ
function addToOrder(menuId) {
    // ค้นหาเมนูจาก ID
    const menuItem = menuItems.find(item => item.id === menuId);
    if (!menuItem) return;
    
    // ตรวจสอบว่ามีเมนูนี้ในรายการสั่งซื้อแล้วหรือไม่
    const existingItem = order.find(item => item.id === menuId);
    
    if (existingItem) {
        // ถ้ามีอยู่แล้ว เพิ่มจำนวน
        existingItem.quantity += 1;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        // ถ้ายังไม่มี เพิ่มรายการใหม่
        order.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            total: menuItem.price
        });
    }
    
    // อัพเดทรายการสั่งซื้อและราคารวม
    updateOrderDisplay();
}

// เพิ่มฟังก์ชัน removeFromOrder สำหรับการลบรายการสั่งซื้อ
function removeFromOrder(index) {
    order.splice(index, 1);
    updateOrderDisplay();
}


// เพิ่มฟังก์ชันสำหรับอัพเดทการแสดงรายการสั่งซื้อ
function updateOrderDisplay() {
    const tbody = document.querySelector('#orderList tbody');
    const totalElement = document.getElementById('totalAmount');
    
    // เคลียร์รายการเก่า
    tbody.innerHTML = '';
    
    // คำนวณราคารวมทั้งหมด
    let totalPrice = 0;
    
    // เพิ่มรายการใหม่
    order.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>฿${item.price}</td>
            <td>${item.quantity}</td>
            <td>฿${(item.price * item.quantity).toFixed(2)}</td>
            <td><button onclick="removeFromOrder(${index})">ลบ</button></td>
        `;
        tbody.appendChild(tr);
        
        // เพิ่มราคาเข้าไปในราคารวม
        totalPrice += item.price * item.quantity;
    });
    
    // อัพเดทราคารวมทั้งหมด
    totalElement.textContent = totalPrice.toFixed(2);
}

// เริ่มการทำงานเมื่อโหลดหน้าเว็บ (กำหนดเพียงครั้งเดียว)
window.onload = fetchMenuItems;

document.getElementById("checkoutBtn").addEventListener("click", async function () {
    if (order.length === 0) {
        alert('กรุณาเลือกเมนู');
        return;
    }

    try {
        // สร้างข้อมูลคำสั่งซื้อในรูปแบบที่เหมาะสมกับ API
        // แก้ไขที่นี่
const orderItems = order.map(item => ({
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price
}));

const orderData = {
    items: orderItems,
    totalPrice: parseFloat(document.getElementById("totalAmount").textContent)
};

console.log('Sending order data:', JSON.stringify(orderData, null, 2));
        const response = await fetch("/api/createOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
        }

        const result = await response.json();

        if (result.success) {
            // ใช้ orderId ที่ได้จาก API
            window.location.href = `/html/sellconfirm.html?orderId=${result.orderId}`;
        } else {
            alert("เกิดข้อผิดพลาดในการยืนยันการสั่งซื้อ");
        }
    } catch (error) {
        console.error("Checkout error:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
    }
});