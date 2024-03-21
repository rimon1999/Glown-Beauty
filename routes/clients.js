// routes/users.js
const express = require('express');
const router = express.Router();
const Client = require('../models/client');

// Define routes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
