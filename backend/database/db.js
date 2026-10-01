const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'vision_motors.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  return { dealers: [], vehicles: [], orders: [], _counters: { dealer: 0, vehicle: 0, order: 0 } };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize
let dbData = loadDB();
if (!dbData._counters) {
  dbData._counters = { dealer: 0, vehicle: 0, order: 0 };
}

// Helper: generate next ID
function nextId(type) {
  dbData._counters[type] = (dbData._counters[type] || 0) + 1;
  return dbData._counters[type];
}

// Dealers
function getDealers() { return dbData.dealers; }
function getDealerById(id) { return dbData.dealers.find(d => d.id === parseInt(id)); }
function createDealer(data) {
  const dealer = { id: nextId('dealer'), ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  dbData.dealers.push(dealer);
  saveDB(dbData);
  return dealer;
}
function updateDealer(id, data) {
  const idx = dbData.dealers.findIndex(d => d.id === parseInt(id));
  if (idx === -1) return null;
  dbData.dealers[idx] = { ...dbData.dealers[idx], ...data, id: parseInt(id), updated_at: new Date().toISOString() };
  saveDB(dbData);
  return dbData.dealers[idx];
}
function deleteDealer(id) {
  const idx = dbData.dealers.findIndex(d => d.id === parseInt(id));
  if (idx === -1) return false;
  dbData.dealers.splice(idx, 1);
  saveDB(dbData);
  return true;
}

// Vehicles
function getVehicles() { return dbData.vehicles; }
function getVehicleById(id) { return dbData.vehicles.find(v => v.id === parseInt(id)); }
function createVehicle(data) {
  const qty = data.stock_quantity || 0;
  const vehicle = {
    id: nextId('vehicle'),
    vehicle_name: data.vehicle_name,
    model: data.model,
    year: data.year,
    color: data.color || null,
    price: data.price || 0,
    stock_quantity: qty,
    is_in_stock: qty > 0 ? 1 : 0,
    description: data.description || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  dbData.vehicles.push(vehicle);
  saveDB(dbData);
  return vehicle;
}
function updateVehicle(id, data) {
  const idx = dbData.vehicles.findIndex(v => v.id === parseInt(id));
  if (idx === -1) return null;
  const qty = data.stock_quantity !== undefined ? data.stock_quantity : dbData.vehicles[idx].stock_quantity;
  const inStock = data.is_in_stock !== undefined ? (data.is_in_stock ? 1 : 0) : (qty > 0 ? 1 : 0);
  dbData.vehicles[idx] = { ...dbData.vehicles[idx], ...data, id: parseInt(id), stock_quantity: qty, is_in_stock: inStock, updated_at: new Date().toISOString() };
  saveDB(dbData);
  return dbData.vehicles[idx];
}
function deleteVehicle(id) {
  const idx = dbData.vehicles.findIndex(v => v.id === parseInt(id));
  if (idx === -1) return false;
  dbData.vehicles.splice(idx, 1);
  saveDB(dbData);
  return true;
}

// Orders
function getOrders() {
  return dbData.orders.map(o => {
    const vehicle = getVehicleById(o.vehicle_id);
    const dealer = o.dealer_id ? getDealerById(o.dealer_id) : null;
    return {
      ...o,
      vehicle_name: vehicle?.vehicle_name || null,
      vehicle_model: vehicle?.model || null,
      vehicle_year: vehicle?.year || null,
      vehicle_color: vehicle?.color || null,
      vehicle_price: vehicle?.price || null,
      dealer_name: dealer?.dealer_name || null,
      dealer_city: dealer?.city || null,
    };
  });
}
function getOrderById(id) {
  const o = dbData.orders.find(o => o.id === parseInt(id));
  if (!o) return null;
  const vehicle = getVehicleById(o.vehicle_id);
  const dealer = o.dealer_id ? getDealerById(o.dealer_id) : null;
  return {
    ...o,
    vehicle_name: vehicle?.vehicle_name || null,
    vehicle_model: vehicle?.model || null,
    vehicle_year: vehicle?.year || null,
    vehicle_color: vehicle?.color || null,
    vehicle_price: vehicle?.price || null,
    is_in_stock: vehicle?.is_in_stock || 0,
    stock_quantity: vehicle?.stock_quantity || 0,
    dealer_name: dealer?.dealer_name || null,
    dealer_city: dealer?.city || null,
  };
}
function createOrder(data) {
  const orderNum = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const order = {
    id: nextId('order'),
    order_number: orderNum,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone || null,
    customer_address: data.customer_address || null,
    customer_latitude: data.customer_latitude || null,
    customer_longitude: data.customer_longitude || null,
    vehicle_id: parseInt(data.vehicle_id),
    dealer_id: data.dealer_id ? parseInt(data.dealer_id) : null,
    order_status: data.order_status || 'Draft',
    quantity: data.quantity || 1,
    order_date: data.order_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  dbData.orders.push(order);
  saveDB(dbData);
  return order;
}
function updateOrder(id, data) {
  const idx = dbData.orders.findIndex(o => o.id === parseInt(id));
  if (idx === -1) return null;
  dbData.orders[idx] = { ...dbData.orders[idx], ...data, id: parseInt(id), updated_at: new Date().toISOString() };
  saveDB(dbData);
  return dbData.orders[idx];
}
function deleteOrder(id) {
  const idx = dbData.orders.findIndex(o => o.id === parseInt(id));
  if (idx === -1) return false;
  dbData.orders.splice(idx, 1);
  saveDB(dbData);
  return true;
}
function getRawOrders() { return dbData.orders; }

// Dashboard
function getDashboardStats() {
  const totalDealers = dbData.dealers.length;
  const totalVehicles = dbData.vehicles.length;
  const totalOrders = dbData.orders.length;
  const inStockVehicles = dbData.vehicles.filter(v => v.is_in_stock === 1).length;
  const outOfStockVehicles = dbData.vehicles.filter(v => v.is_in_stock === 0).length;

  const statusMap = {};
  dbData.orders.forEach(o => { statusMap[o.order_status] = (statusMap[o.order_status] || 0) + 1; });
  const ordersByStatus = Object.entries(statusMap).map(([order_status, count]) => ({ order_status, count }));

  const recentOrders = getOrders().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  let totalRevenue = 0;
  dbData.orders.filter(o => o.order_status === 'Confirmed').forEach(o => {
    const v = getVehicleById(o.vehicle_id);
    if (v) totalRevenue += (v.price || 0) * (o.quantity || 1);
  });

  return { totalDealers, totalVehicles, totalOrders, inStockVehicles, outOfStockVehicles, ordersByStatus, recentOrders, totalRevenue };
}

// Seed data
function seedData() {
  if (dbData.dealers.length > 0) return;
  console.log('[Seed] Populating sample data...');

  const dealers = [
    { dealer_name: 'Manhattan Vision Motors', street: '200 Broadway', city: 'New York', state: 'NY', postal_code: '10001', country: 'USA', latitude: 40.7128, longitude: -74.006, phone: '212-555-0100', email: 'manhattan@visionmotors.com' },
    { dealer_name: 'Brooklyn Auto Hub', street: '456 Atlantic Ave', city: 'Brooklyn', state: 'NY', postal_code: '11201', country: 'USA', latitude: 40.6892, longitude: -73.9857, phone: '718-555-0200', email: 'brooklyn@visionmotors.com' },
    { dealer_name: 'Queens Vehicle Center', street: '789 Queens Blvd', city: 'Queens', state: 'NY', postal_code: '11375', country: 'USA', latitude: 40.7282, longitude: -73.8317, phone: '718-555-0300', email: 'queens@visionmotors.com' },
    { dealer_name: 'Jersey City Showroom', street: '100 Hudson St', city: 'Jersey City', state: 'NJ', postal_code: '07302', country: 'USA', latitude: 40.7178, longitude: -74.0431, phone: '201-555-0400', email: 'jersey@visionmotors.com' },
  ];
  dealers.forEach(d => createDealer(d));

  const vehicles = [
    { vehicle_name: 'Vision Sedan A1', model: 'Sedan A1', year: 2026, color: 'Silver', price: 35000, stock_quantity: 15, description: 'Luxury sedan with advanced autopilot features and premium interior.' },
    { vehicle_name: 'Vision SUV X1', model: 'SUV X1', year: 2026, color: 'Black', price: 55000, stock_quantity: 8, description: 'Full-size SUV with all-wheel drive and spacious cabin.' },
    { vehicle_name: 'Vision Electric E1', model: 'EV E1', year: 2026, color: 'White', price: 45000, stock_quantity: 20, description: 'All-electric vehicle with 400-mile range and fast charging.' },
    { vehicle_name: 'Vision Sport S1', model: 'Sport S1', year: 2026, color: 'Red', price: 72000, stock_quantity: 5, description: 'High-performance sports car with 0-60 in 3.2 seconds.' },
    { vehicle_name: 'Vision Compact C1', model: 'Compact C1', year: 2026, color: 'Blue', price: 25000, stock_quantity: 0, description: 'Affordable compact car perfect for city driving.' },
  ];
  vehicles.forEach(v => createVehicle(v));

  console.log('[Seed] Sample data loaded: 4 dealers, 5 vehicles');
}

module.exports = {
  getDealers, getDealerById, createDealer, updateDealer, deleteDealer,
  getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getRawOrders,
  getDashboardStats, seedData
};
