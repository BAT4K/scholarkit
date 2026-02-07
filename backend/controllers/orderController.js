const pool = require('../config/db');

exports.placeOrder = async (req, res) => {
  const client = await pool.connect(); 
  const userId = req.user.id;

  try {
    await client.query('BEGIN'); 

    // 1. Calculate Total Amount directly from DB
    const totalRes = await client.query(`
      SELECT SUM(c.quantity * p.price) as total
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
    `, [userId]);

    const totalAmount = totalRes.rows[0].total;
    
    if (!totalAmount || totalAmount <= 0) {
      throw new Error("Cart is empty");
    }

    // 2. Create the Order Record
    const orderRes = await client.query(`
      INSERT INTO orders (user_id, total_amount)
      VALUES ($1, $2)
      RETURNING id
    `, [userId, totalAmount]);
    
    const orderId = orderRes.rows[0].id;

    // 3. Move items from Cart to Order Items
    // We select price FROM products table to freeze it at purchase time
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, size, price_at_purchase)
      SELECT $1, c.product_id, c.quantity, c.size, p.price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $2
    `, [orderId, userId]);

    // 4. Clear the Cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: "Order placed successfully", 
      orderId, 
      total: totalAmount 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Transaction Error:", err);
    res.status(500).json({ message: err.message || "Checkout failed" });
  } finally {
    client.release();
  }
};