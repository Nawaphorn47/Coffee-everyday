-- สร้างฐานข้อมูลที่รองรับภาษาไทย
CREATE DATABASE newwebdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตารางสำหรับเก็บข้อมูลเมนู
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    type ENUM('ร้อน', 'เย็น', 'ปั่น'),
    image VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตารางสำหรับบันทึกการสั่งซื้อ
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('รอคิว', 'ปรุงเสร็จแล้ว', 'ได้รับแล้ว'),
    payment_status ENUM('ชำระแล้ว', 'รอการชำระ'),
    FOREIGN KEY (user_id) REFERENCES users(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตารางสำหรับเก็บรายการเมนูในแต่ละคำสั่งซื้อ
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    menu_item_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตารางสำหรับจัดการคิวการสั่งซื้อ
CREATE TABLE queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    status ENUM('รอคิว', 'ปรุงเสร็จแล้ว', 'ได้รับแล้ว'),
    queue_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    finish_time DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ตารางสำหรับบันทึกประวัติการชำระเงิน
CREATE TABLE payment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('เงินสด', 'บัตรเครดิต', 'โอนผ่านธนาคาร'),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


