const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Higher limit for PDF base64

// Health check
app.get('/', (req, res) => res.json({ message: "API rodando 🚀" }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
