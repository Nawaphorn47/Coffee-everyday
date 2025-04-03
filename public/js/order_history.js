// API สำหรับดึงข้อมูลประวัติการขายทั้งหมด
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

// API สำหรับดึงรายละเอียดคำสั่งซื้อ โดยระบุ ID
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