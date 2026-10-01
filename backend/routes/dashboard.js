const express = require('express');
const db = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getDashboardStats());
});

module.exports = router;
