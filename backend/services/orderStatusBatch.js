/**
 * OrderStatusBatchService
 * Updates order statuses based on vehicle stock availability.
 */

const db = require('../database/db');

function updateOrderStatuses() {
  console.log(`[BatchJob] Starting order status update at ${new Date().toISOString()}`);

  const rawOrders = db.getRawOrders();
  const pendingOrders = rawOrders.filter(o => o.order_status === 'Draft' || o.order_status === 'Pending');

  let confirmed = 0;
  let pending = 0;

  for (const order of pendingOrders) {
    const vehicle = db.getVehicleById(order.vehicle_id);
    if (!vehicle) continue;

    const newStatus = (vehicle.is_in_stock === 1 && vehicle.stock_quantity > 0) ? 'Confirmed' : 'Pending';

    if (order.order_status !== newStatus) {
      db.updateOrder(order.id, { order_status: newStatus });
      if (newStatus === 'Confirmed') confirmed++;
      else pending++;
    }
  }

  console.log(`[BatchJob] Completed: ${confirmed} confirmed, ${pending} pending, ${pendingOrders.length} total processed`);
  return { confirmed, pending, total: pendingOrders.length };
}

module.exports = { updateOrderStatuses };
