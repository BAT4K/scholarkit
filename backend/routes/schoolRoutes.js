const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM schools ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error fetching schools' });
    }
});

module.exports = router;