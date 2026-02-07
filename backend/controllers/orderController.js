const pool = require('../config/db');

// 1. Place Order (With Transaction & Inventory Check)
exports.placeOrder = async (req, res) => {
  const client = await pool.connect();
  const userId = req.user.id;

  try {
    await client.query('BEGIN'); // Start Transaction

    // Step A: Get Cart Items
    const cartRes = await client.query(
      `SELECT c.product_id, c.quantity, c.size, p.price, p.name 
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    const cartItems = cartRes.rows;
    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Step B: Calculate Total
    const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    // Step C: Create Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id`,
      [userId, totalAmount]
    );
    const orderId = orderRes.rows[0].id;

    // Step D: Process Items & Update Inventory
    for (const item of cartItems) {
      // 1. Insert into order_items
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, size, price_at_purchase)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.size, item.price]
      );

      // 2. Decrement Stock (Crucial Step)
      // We assume your 'products' table has a 'stock' column. 
      // If you called it 'inventory' or 'quantity', change 'stock' below.
      const stockRes = await client.query(
        `UPDATE products 
         SET stock = stock - $1 
         WHERE id = $2 
         RETURNING stock`,
        [item.quantity, item.product_id]
      );

      // 3. Safety Check
      if (stockRes.rows.length === 0) {
        throw new Error(`Product ${item.name} not found`);
      }
      
      const newStock = stockRes.rows[0].stock;
      if (newStock < 0) {
        throw new Error(`Out of Stock: ${item.name}. Only ${item.quantity + newStock} left.`);
      }
    }

    // Step E: Clear Cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT'); // Commit Transaction

    res.status(201).json({ message: "Order placed successfully", orderId });

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on ANY error
    console.error("Checkout Error:", err.message);
    res.status(400).json({ message: err.message }); // Send specific error (e.g., "Out of Stock")
  } finally {
    client.release();
  }
};

// 2. Get User's Order History
exports.getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Get Single Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch Items for this order
    const itemsRes = await pool.query(
      `SELECT oi.id, oi.quantity, oi.size, oi.price_at_purchase, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    if (itemsRes.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(itemsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};