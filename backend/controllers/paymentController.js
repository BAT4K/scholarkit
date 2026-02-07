const Razorpay = require('razorpay');
const pool = require('../config/db');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createPaymentOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartRes = await pool.query(
      `SELECT c.quantity, p.price 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartRes.rows.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = cartRes.rows.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const options = {
      amount: Math.round(totalAmount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};