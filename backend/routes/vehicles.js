const express = require('express');
const db = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getVehicles());
});

router.get('/:id', (req, res) => {
  const vehicle = db.getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json(vehicle);
});

router.post('/', (req, res) => {
  const { vehicle_name, model, year, color, price, stock_quantity, description } = req.body;
  if (!vehicle_name || !model || !year) return res.status(400).json({ error: 'Vehicle name, model, and year are required' });
  const vehicle = db.createVehicle({ vehicle_name, model, year, color, price, stock_quantity, description });
  res.status(201).json(vehicle);
});

router.put('/:id', (req, res) => {
  const existing = db.getVehicleById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Vehicle not found' });
  const updated = db.updateVehicle(req.params.id, { ...existing, ...req.body });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  if (!db.deleteVehicle(req.params.id)) return res.status(404).json({ error: 'Vehicle not found' });
  res.json({ message: 'Vehicle deleted successfully' });
});

module.exports = router;
