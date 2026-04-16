const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const clientRoutes = require('./clients');
const inventarioRoutes = require('./inventarios');

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/inventarios', inventarioRoutes);

module.exports = router;
