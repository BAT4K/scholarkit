const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config(); 

// Import Routes
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', shopRoutes);
app.use('/api/auth', authRoutes);     
app.use('/api/cart', cartRoutes);     
app.use('/api/orders', orderRoutes); 
app.use('/api/admin', adminRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});