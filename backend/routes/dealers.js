const express = require('express');
const db = require('../database/db');
const { findNearestDealers } = require('../services/dealerLocator');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getDealers());
});

router.get('/nearest/find', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const limit = parseInt(req.query.limit) || 5;
  if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: 'Valid lat and lon parameters are required' });
  const dealers = db.getDealers().filter(d => d.latitude && d.longitude);
  const { calculateDistance } = require('../services/dealerLocator');
  const withDist = dealers.map(d => ({ ...d, distance: calculateDistance(lat, lon, d.latitude, d.longitude) }));
  withDist.sort((a, b) => a.distance - b.distance);
  res.json(withDist.slice(0, limit));
});

router.get('/:id', (req, res) => {
  const dealer = db.getDealerById(req.params.id);
  if (!dealer) return res.status(404).json({ error: 'Dealer not found' });
  res.json(dealer);
});

router.post('/', (req, res) => {
  const { dealer_name, street, city, state, postal_code, country, latitude, longitude, phone, email } = req.body;
  if (!dealer_name) return res.status(400).json({ error: 'Dealer name is required' });
  const dealer = db.createDealer({ dealer_name, street, city, state, postal_code, country, latitude, longitude, phone, email });
  res.status(201).json(dealer);
});

router.put('/:id', (req, res) => {
  const existing = db.getDealerById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dealer not found' });
  const updated = db.updateDealer(req.params.id, { ...existing, ...req.body });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (!db.deleteDealer(req.params.id)) return res.status(404).json({ error: 'Dealer not found' });
  res.json({ message: 'Dealer deleted successfully' });
});

module.exports = router;
