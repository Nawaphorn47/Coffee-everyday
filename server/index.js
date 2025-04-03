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
        console.error(' Error connecting to MySQL:', err);
        return;
    }
    console.log(' Connected to MySQL database');
});

// --------------------- GET ROUTES --------------------- //

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

// ---------------------- SELL ---------------------- //

// API สำหรับดึงข้อมูลเมนูทั้งหมด
app.get('/api/menu', (req, res) => {
    const sql = 'SELECT * FROM menu_items';
    db.query(sql, (err, result) => { // ดำเนินการ query ข้อมูลในฐานข้อมูล
        if (err) return res.status(500).send('Error fetching menu items');
        res.json(result); // ส่งข้อมูลเมนูทั้งหมดกลับเป็น JSON
    });
});


app.post('/api/createOrder', (req, res) => {
    const { items, totalPrice } = req.body; // รับข้อมูลจาก client
    const userId = 1; // ควรดึง user_id จาก session หรือ token

    // ตรวจสอบข้อมูลว่าเป็น อาเร และ ไม่ว่าง
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid items data' }); 
    }
    // ตรวจสอบว่าราคาสุทธิเป็นเลขหรือป่าว
    if (typeof totalPrice !== 'number' || totalPrice <= 0) {
        return res.status(400).json({ error: 'Invalid total price' }); // ตรวจสอบราคาสุทธิ
    }

    //สร้างคำสั่งซื้อใหม่ในตาราง orders
    const sql = `INSERT INTO orders (user_id, total_price, status, payment_status) VALUES (?, ?, 'รอคิว', 'รอการชำระ')`;
    db.query(sql, [userId, totalPrice], (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Error creating order', details: err.message || 'Database error' });
        }

        const orderId = result.insertId; // รับ orderId ที่ได้รับจากการ insert คำสั่งซื้อ

        // สร้างข้อมูลรายการเมนูที่ผู้ใช้เลือกและเพิ่มลงในตาราง order_items 
        // .map ทำให้แกไขข้อมูลได้
        const orderItems = items.map(item => {
            if (!item.menu_item_id || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Missing required fields in items' });
            }
            return [ 
                orderId, item.menu_item_id, item.quantity, item.price
            ];
        });

        //สุดท้ายก็บันทึกลงตาราง orders_items
        const itemSql = `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?`;
        db.query(itemSql, [orderItems], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).json({ error: 'Error inserting order items', details: err.message || 'Database error' });
            }

            res.status(200).json({ success: true, orderId }); // ส่งข้อมูลกลับไปยัง client
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
// --------------------- ORDER_HISTORY --------------------//

// ดึงข้อมูล orders
app.get('/orders', (req, res) => {
    const sql = 'SELECT * FROM orders';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send('Error fetching Orders');
      res.json(result);
    });
  });
  
  // อัปเดตสถานะ order
  app.put('/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const newStatus = req.body.status;
  
    const sql = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(sql, [newStatus, orderId], (err, result) => {
      if (err) return res.status(500).send('Error updating order status');
      res.json({ message: 'Order status updated successfully' });
    });
  });
    
  app.get('/orders/:id/details', (req, res) => {
    const orderId = req.params.id;
  
    // คำสั่ง SQL เพื่อดึงข้อมูลเมนูที่เกี่ยวข้องกับคำสั่งซื้อ
    const sql = `
      SELECT menu.name, menu.price
      FROM order_items
      JOIN menu ON order_items.menu_id = menu.id
      WHERE order_items.order_id = ?
    `;
  
    db.query(sql, [orderId], (err, result) => {
      if (err) return res.status(500).send('Error fetching order details');
      res.json(result);
    });
  });

  //-------------------- REPORT --------------------------- //
// สร้าง API endpoint สำหรับรายได้วันนี้
app.get('/daily-revenue', (req, res) => {
    const sql = `
        SELECT
            DATE(order_date) AS sale_date,
            SUM(total_price) AS daily_revenue
        FROM
            orders
        WHERE
            DATE(order_date) = CURDATE()
        GROUP BY
            sale_date;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});


// --------------------- START SERVER --------------------- //

app.listen(port, () => {
    console.log(` Server is running on http://localhost:${port}/login`);
});