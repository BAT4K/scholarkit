const express = require('express');
const cors = require('cors');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', shopRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use('/api/auth', authRoutes);