const pool = require('../config/db');

// 1. Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [revenue, orders, users, lowStock] = await Promise.all([
      // Total Revenue
      pool.query('SELECT SUM(total_amount) as total FROM orders'),
      // Total Orders
      pool.query('SELECT COUNT(*) as count FROM orders'),
      // Total Users
      pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']),
      // Low Stock Alert (Items with less than 10 stock)
      pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 10') 
    ]);

    res.json({
      totalRevenue: revenue.rows[0].total || 0,
      totalOrders: orders.rows[0].count,
      totalUsers: users.rows[0].count,
      lowStockCount: lowStock.rows[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error loading stats" });
  }
};

// 2. Get All Orders (for the Admin List)
exports.getAllOrders = async (req, res) => {
  try {
    const query = `
      SELECT o.id, o.total_amount, o.status, o.created_at, 
             u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// 3. Update Order Status (Ship/Deliver)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating order" });
  }
};