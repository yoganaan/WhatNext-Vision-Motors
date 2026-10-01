const express = require('express');
const db = require('../database/db');
const { findNearestDealer } = require('../services/dealerLocator');
const { updateOrderStatuses } = require('../services/orderStatusBatch');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.getOrders());
});

router.get('/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', (req, res) => {
  const {
    customer_name, customer_email, customer_phone, customer_address,
    customer_latitude, customer_longitude,
    vehicle_id, dealer_id, quantity, order_date
  } = req.body;

  if (!customer_name || !customer_email || !vehicle_id) {
    return res.status(400).json({ error: 'Customer name, email, and vehicle are required' });
  }

  const vehicle = db.getVehicleById(vehicle_id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  if (!vehicle.is_in_stock || vehicle.stock_quantity <= 0) {
    return res.status(400).json({
      error: `Cannot place order: The vehicle "${vehicle.vehicle_name}" is currently out of stock. Please select a different vehicle or try again later.`
    });
  }

  // Auto-assign nearest dealer
  let assignedDealerId = dealer_id || null;
  let assignedDealer = null;
  if (!assignedDealerId && customer_latitude != null && customer_longitude != null) {
    assignedDealer = findNearestDealer(db.getDealers().filter(d => d.latitude && d.longitude), customer_latitude, customer_longitude);
    if (assignedDealer) assignedDealerId = assignedDealer.id;
  }

  const orderStatus = (vehicle.is_in_stock && vehicle.stock_quantity > 0) ? 'Confirmed' : 'Pending';

  const order = db.createOrder({
    customer_name, customer_email, customer_phone, customer_address,
    customer_latitude, customer_longitude,
    vehicle_id, dealer_id: assignedDealerId,
    order_status: orderStatus,
    quantity: quantity || 1,
    order_date: order_date || new Date().toISOString().split('T')[0]
  });

  // Decrement stock
  const newStock = vehicle.stock_quantity - (quantity || 1);
  db.updateVehicle(vehicle_id, { stock_quantity: Math.max(newStock, 0), is_in_stock: newStock > 0 ? 1 : 0 });

  const result = db.getOrderById(order.id);
  res.status(201).json({
    ...result,
    nearest_dealer: assignedDealer ? { id: assignedDealer.id, name: assignedDealer.dealer_name, distance: assignedDealer.distance ? Math.round(assignedDealer.distance * 100) / 100 : null } : null
  });
});

router.put('/:id', (req, res) => {
  const existing = db.getRawOrders().find(o => o.id === parseInt(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  const { order_status } = req.body;
  const newStatus = order_status || existing.order_status;

  if (newStatus !== existing.order_status) {
    const vehicle = db.getVehicleById(existing.vehicle_id);
    const qty = existing.quantity || 1;

    if (existing.order_status === 'Confirmed' && newStatus !== 'Confirmed') {
      const newStock = vehicle.stock_quantity + qty;
      db.updateVehicle(existing.vehicle_id, { stock_quantity: newStock, is_in_stock: 1 });
    } else if (existing.order_status !== 'Confirmed' && newStatus === 'Confirmed') {
      if (vehicle.stock_quantity >= qty) {
        const newStock = vehicle.stock_quantity - qty;
        db.updateVehicle(existing.vehicle_id, { stock_quantity: newStock, is_in_stock: newStock > 0 ? 1 : 0 });
      } else {
        return res.status(400).json({ error: 'Cannot confirm: insufficient stock' });
      }
    }
  }

  const updated = db.updateOrder(req.params.id, { ...existing, ...req.body });
  const result = db.getOrderById(updated.id);
  res.json(result);
});

router.delete('/:id', (req, res) => {
  const existing = db.getRawOrders().find(o => o.id === parseInt(req.params.id));
  if (!existing) return res.status(404).json({ error: 'Order not found' });

  if (existing.order_status === 'Confirmed') {
    const vehicle = db.getVehicleById(existing.vehicle_id);
    const qty = existing.quantity || 1;
    db.updateVehicle(existing.vehicle_id, { stock_quantity: vehicle.stock_quantity + qty, is_in_stock: 1 });
  }

  db.deleteOrder(req.params.id);
  res.json({ message: 'Order deleted successfully' });
});

router.post('/batch-update', (req, res) => {
  const result = updateOrderStatuses();
  res.json({ message: 'Batch update completed', ...result });
});

module.exports = router;
