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
app.get('/api/orders', (req, res) => {
    const sql = `
        SELECT o.id, o.total_price, o.status, o.payment_status, o.order_date 
        FROM orders o
        ORDER BY o.order_date DESC
    `;
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching order history:', err);
            return res.status(500).send('Error fetching order history');
        }
        res.json(result);
    });
});

app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    
    // ดึงข้อมูลหลักของคำสั่งซื้อ
    const orderSql = `
        SELECT o.id, o.user_id, o.order_date, o.total_price, o.status, o.payment_status
        FROM orders o
        WHERE o.id = ?
    `;
    
    // ดึงรายการเมนูในคำสั่งซื้อ
    const itemsSql = `
        SELECT oi.quantity, oi.price, mi.name, mi.type
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = ?
    `;
    
    // ดึงข้อมูลการชำระเงิน (ถ้ามี)
    const paymentSql = `
        SELECT payment_amount, payment_method, payment_date
        FROM payment_history
        WHERE order_id = ?
    `;
    
    db.query(orderSql, [orderId], (err, orderResult) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).send('Error fetching order details');
        }
        
        if (orderResult.length === 0) {
            return res.status(404).send('Order not found');
        }
        
        const order = orderResult[0];
        
        // ดึงรายการเมนูในคำสั่งซื้อ
        db.query(itemsSql, [orderId], (err, itemsResult) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return res.status(500).send('Error fetching order items');
            }
            
            order.items = itemsResult;
            
            // ดึงข้อมูลการชำระเงิน
            db.query(paymentSql, [orderId], (err, paymentResult) => {
                if (err) {
                    console.error('Error fetching payment history:', err);
                    return res.status(500).send('Error fetching payment history');
                }
                
                order.payments = paymentResult;
                
                res.json(order);
            });
        });
    });
});
// ---------------------- SELL ---------------------- //

app.post('/api/createOrder', (req, res) => {
    console.log('Received order data:', JSON.stringify(req.body, null, 2));
    const { items, totalPrice } = req.body;
    const userId = 1; // ควรดึง user_id จาก session หรือ token

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid items data' });
    }

    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
        return res.status(400).json({ error: 'Invalid total price' });
    }

    const sql = `INSERT INTO orders (user_id, total_price, status, payment_status) VALUES (?, ?, 'รอคิว', 'รอการชำระ')`;
    db.query(sql, [userId, totalPrice], (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Error creating order', details: err.message || 'Database error' });
        }

        const orderId = result.insertId;

        const orderItems = items.map(item => {
            if (!item.menu_item_id || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Missing required fields in items' });
            }
            return [
                orderId, item.menu_item_id, item.quantity, item.price
            ];
        });

        const itemSql = `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?`;
        db.query(itemSql, [orderItems], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).json({ error: 'Error inserting order items', details: err.message || 'Database error' });
            }

            res.status(200).json({ success: true, orderId });
        });
    });
});


app.get('/api/order/:orderId', (req, res) => {
    const { orderId } = req.params;

    const orderSql = 'SELECT * FROM orders WHERE id = ?';
    db.query(orderSql, [orderId], (err, orderResult) => {
        if (err || orderResult.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderItemsSql = 'SELECT oi.quantity, oi.price, mi.name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?';
        db.query(orderItemsSql, [orderId], (err, itemsResult) => {
            if (err) {
                console.error('Error retrieving order items:', err);
                return res.status(500).json({ error: 'Error retrieving order items', details: err.message || 'Database error' });
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