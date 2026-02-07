const pool = require('../config/db');

// 1. Add (or Update) Item in Cart
exports.addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body;
  const userId = req.user.id; 

  try {
    const query = `
      INSERT INTO cart_items (user_id, product_id, quantity, size)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, product_id, size) 
      DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity
      RETURNING *;
    `;
    
    const result = await pool.query(query, [userId, productId, quantity, size]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding to cart" });
  }
};

// 2. Get User's Cart (with Product Details)
exports.getCart = async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.quantity, c.size, 
             p.name, p.price, p.image_url, p.id as product_id
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;
    `;
    
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching cart" });
  }
};

// 3. Remove Specific Item
exports.removeFromCart = async (req, res) => {
  const { id } = req.params; // Cart Item ID

  try {
    // Ensure user only deletes their own items
    const query = "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({ message: "Item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error removing item" });
  }
};