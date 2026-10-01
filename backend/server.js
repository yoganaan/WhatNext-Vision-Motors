const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const db = require('./database/db');
const { updateOrderStatuses } = require('./services/orderStatusBatch');

const dealerRoutes = require('./routes/dealers');
const vehicleRoutes = require('./routes/vehicles');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/dealers', dealerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule batch job: runs every 2 hours during business hours (Mon-Fri)
cron.schedule('0 8,10,12,14,16,18 * * 1-5', () => {
  console.log('[Scheduler] Running scheduled order status update...');
  updateOrderStatuses();
});

// Seed sample data
db.seedData();

app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`  WhatsNext Vision Motors API Server`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`===========================================\n`);
});

module.exports = app;
