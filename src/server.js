const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const inventarioRoutes = require('./routes/inventarios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Higher limit for PDF base64

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/inventarios', inventarioRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
