// ดึง orderId จาก query string
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("orderId");
const orderDate = new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

// ฟังก์ชันสำหรับดึงข้อมูลคำสั่งซื้อจากฐานข้อมูล
async function loadOrderDetails() {
    try {
        showLoading(true);
        
        const res = await fetch(`/api/order/${orderId}`);
        
        if (!res.ok) {
            throw new Error('ไม่สามารถดึงข้อมูลคำสั่งซื้อได้');
        }
        
        const order = await res.json();

        if (!order) {
            showNotification('error', 'ไม่พบข้อมูลคำสั่งซื้อ');
            return;
        }

        // แสดงข้อมูลเพิ่มเติมของคำสั่งซื้อ
        document.getElementById("orderNumber").textContent = `#${order.orderNumber || orderId}`;
        document.getElementById("orderDate").textContent = order.createdAt ? 
            new Date(order.createdAt).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : orderDate;
        
        if (order.customer) {
            document.getElementById("customerInfo").textContent = `ลูกค้า: ${order.customer.name || 'ไม่ระบุ'}`;
        }

        // แสดงข้อมูลคำสั่งซื้อ
        const orderItemsList = document.getElementById("orderItemsList");
        orderItemsList.innerHTML = ''; // เคลียร์ข้อมูลเก่าก่อน
        
        let subtotal = 0;
        let discount = order.discount || 0;

        order.items.forEach((item, index) => {
            const row = document.createElement("tr");
            const itemTotal = item.price * item.quantity;
            
            row.innerHTML = `
                <td class="item-number">${index + 1}</td>
                <td class="item-name">${item.name}${item.options ? `<span class="item-options">${item.options}</span>` : ''}</td>
                <td class="item-price">฿${item.price.toFixed(2)}</td>
                <td class="item-quantity">${item.quantity}</td>
                <td class="item-total">฿${itemTotal.toFixed(2)}</td>
            `;
            orderItemsList.appendChild(row);
            subtotal += itemTotal;
        });

        // คำนวณภาษีมูลค่าเพิ่ม (7%)
        const vat = subtotal * 0.07;
        const total = subtotal - discount;

        // อัพเดทยอดรวม
        document.getElementById("subtotal").textContent = `฿${subtotal.toFixed(2)}`;
        
        // แสดงส่วนลด (ถ้ามี)
        const discountRow = document.getElementById("discountRow");
        if (discount > 0) {
            discountRow.classList.remove("hidden");
            document.getElementById("discount").textContent = `฿${discount.toFixed(2)}`;
        } else {
            discountRow.classList.add("hidden");
        }
        
        // แสดงภาษีมูลค่าเพิ่ม
        document.getElementById("vat").textContent = `฿${vat.toFixed(2)}`;
        
        // อัพเดทยอดสุทธิ
        document.getElementById("totalAmount").textContent = `฿${total.toFixed(2)}`;
        
        // แสดงวิธีการชำระเงิน
        if (order.paymentMethod) {
            document.getElementById("paymentMethod").textContent = `ชำระโดย: ${getPaymentMethodName(order.paymentMethod)}`;
        }
        
        console.log("Order loaded successfully:", order);
        showLoading(false);
    } catch (error) {
        console.error("Error loading order:", error);
        showNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูลคำสั่งซื้อ: ' + error.message);
        showLoading(false);
    }
}

// แปลงรหัสวิธีการชำระเงินเป็นข้อความที่อ่านได้
function getPaymentMethodName(method) {
    const methods = {
        'cash': 'เงินสด',
        'credit': 'บัตรเครดิต',
        'transfer': 'โอนเงิน',
        'promptpay': 'พร้อมเพย์',
        'qr': 'QR code'
    };
    
    return methods[method] || method;
}

// แสดง/ซ่อนตัวโหลดดิ้ง
function showLoading(show) {
    const loader = document.getElementById("loader");
    if (show) {
        loader.classList.remove("hidden");
    } else {
        loader.classList.add("hidden");
    }
}

// แสดงข้อความแจ้งเตือน
function showNotification(type, message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove("hidden");
    
    // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
    setTimeout(() => {
        notification.classList.add("hidden");
    }, 3000);
}

// ฟังก์ชันพิมพ์บิล
function printBill() {
    window.print();
}

// ฟังก์ชันกลับไปยังหน้าขาย
function backToSales() {
    window.location.href = "/html/sell.html";
}

// เพิ่ม event listeners
document.getElementById("printBillBtn").addEventListener("click", printBill);
document.getElementById("backBtn").addEventListener("click", backToSales);

// โหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
window.addEventListener("DOMContentLoaded", loadOrderDetails);