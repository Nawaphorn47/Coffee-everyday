const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    port: 3301,
    user: 'root',
    password: 'root',
    database: 'newwebdb'
});

db.connect(err => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err);
        return;
    }
    console.log(' Connected to MySQL database');
});


// Middleware ตรวจสอบการเข้าสู่ระบบ
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // ถ้าเข้าสู่ระบบแล้ว ให้ไปยังฟังก์ชันถัดไป
    } else {
        res.status(403).send('Unauthorized'); // ถ้ายังไม่ได้เข้าสู่ระบบ
    }
}

// กำหนดที่เก็บไฟล์รูปภาพ
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, path.join(__dirname, '..', 'public', 'images'));
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });
  
  // API เพิ่มเมนูใหม่พร้อมรูปภาพ
  app.post('/api/menu', upload.single('image'), (req, res) => {
    const { name, description, price, type } = req.body;
    const imagePath = req.file ? '/images/' + req.file.filename : null;
    
    const sql = `INSERT INTO menu_items (name, description, price, type, image) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, description, price, type, imagePath], (err, result) => {
      if (err) return res.status(500).send('Error adding menu item');
      res.status(200).json({ success: true, id: result.insertId });
    });
  });

// --------------------- GET ROUTES --------------------- //

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'register.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'home.html'));
});


// --------------------- REGISTER --------------------- //

app.post('/register', (req, res) => {
    const { username, email, password, first_name, last_name } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Please fill in all required fields');
    }

    const sql = `INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [username, email, password, first_name, last_name], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('Username or email already exists');
            }
            return res.status(500).send('Database error');
        }
        res.status(200).send('Registered successfully');
    });
});

// --------------------- LOGIN --------------------- //

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.query(sql, [username], (err, result) => {
        if (err) return res.status(500).send('Error during login');
        if (result.length === 0) return res.status(404).send('User not found');
        if (result[0].password === password) {
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Incorrect password');
        }
    });
});

// --------------------- ORDER HISTORY --------------------- //
app.post('/createOrder', (req, res) => {
    const { user_id, items } = req.body; // ค่าจากหน้าเว็บไซต์ (items คือลิสต์ของสินค้าที่สั่ง)
    const total_price = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const sql = `INSERT INTO orders (user_id, total_price, status, payment_status) VALUES (?, ?, 'รอคิว', 'รอการชำระ')`;
    db.query(sql, [user_id, total_price], (err, result) => {
        if (err) {
            return res.status(500).send('Error creating order');
        }

        const orderId = result.insertId;
        const orderItems = items.map(item => [
            orderId, item.menu_item_id, item.quantity, item.price
        ]);
        const itemSql = `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?`;
        db.query(itemSql, [orderItems], (err) => {
            if (err) return res.status(500).send('Error adding order items');
            res.status(200).send('Order created successfully');
        });
    });
});

app.post('/updateOrderStatus', (req, res) => {
    const { order_id, status } = req.body;

    const sql = `UPDATE orders SET status = ? WHERE id = ?`;
    db.query(sql, [status, order_id], (err) => {
        if (err) return res.status(500).send('Error updating order status');
        res.status(200).send('Order status updated');
    });
});

app.get('/queue', (req, res) => {
    const sql = `SELECT * FROM queue ORDER BY queue_time ASC`;
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send('Error fetching queue data');
        res.json(result);
    });
});

// ตัวอย่างในกรณีที่เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ
app.post('/api/createOrder', (req, res) => {
    const { items, totalPrice } = req.body;
    const userId = 1; // ควรใช้ข้อมูลผู้ใช้ที่ล็อกอินอยู่

    const sql = `INSERT INTO orders (user_id, total_price, status, payment_status) VALUES (?, ?, 'รอคิว', 'รอการชำระ')`;
    db.query(sql, [userId, totalPrice], (err, result) => {
        if (err) {
            // ส่งข้อผิดพลาดในรูปแบบ JSON
            return res.status(500).json({ error: 'Error creating order', details: err });
        }

        const orderId = result.insertId;

        // ดำเนินการต่อในการเพิ่มรายการสินค้า
        const orderItems = items.map(item => [
            orderId, item.menuItemId, item.quantity, item.price
        ]);

        const itemSql = `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?`;
        db.query(itemSql, [orderItems], (err) => {
            if (err) {
                // ส่งข้อผิดพลาดในรูปแบบ JSON
                return res.status(500).json({ error: 'Error inserting order items', details: err });
            }

            res.status(200).json({ success: true, orderId });
        });
    });
});


// เพิ่ม API สำหรับดึงข้อมูลคำสั่งซื้อและรายการสินค้า
app.get('/api/order/:orderId', (req, res) => {
    const { orderId } = req.params;

    const orderSql = 'SELECT * FROM orders WHERE id = ?';
    db.query(orderSql, [orderId], (err, orderResult) => {
        if (err || orderResult.length === 0) {
            return res.status(404).send('ไม่พบคำสั่งซื้อ');
        }

        // ดึงรายการสินค้าจากตาราง order_items
        const orderItemsSql = 'SELECT oi.quantity, oi.price, mi.name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?';
        db.query(orderItemsSql, [orderId], (err, itemsResult) => {
            if (err) {
                return res.status(500).send('Error retrieving order items');
            }
            const order = {
                ...orderResult[0],
                items: itemsResult
            };
            res.json(order);
        });
    });
});

// API สำหรับดึงข้อมูลเมนูทั้งหมด
app.get('/api/menu', (req, res) => {
    const sql = 'SELECT * FROM menu_items';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send('Error fetching menu items');
        res.json(result);
    });
});

// --------------------- START SERVER --------------------- //

app.listen(port, () => {
    console.log(` Server is running on http://localhost:${port}`);
});