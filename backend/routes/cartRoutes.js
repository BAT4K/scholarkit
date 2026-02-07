const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart } = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:id', removeFromCart);

module.exports = router;