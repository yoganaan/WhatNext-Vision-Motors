import { useState, useEffect } from 'react';
import { api } from '../services/api';

function StatusBadge({ status }) {
  const colors = {
    Confirmed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Draft: 'bg-gray-100 text-gray-800',
    Cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nearestDealer, setNearestDealer] = useState(null);
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '', customer_address: '',
    customer_latitude: '', customer_longitude: '',
    vehicle_id: '', quantity: '1',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ordersData, vehiclesData] = await Promise.all([
        api.getOrders(),
        api.getVehicles(),
      ]);
      setOrders(ordersData);
      setVehicles(vehiclesData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  // Auto-find nearest dealer when coordinates change
  useEffect(() => {
    const lat = parseFloat(form.customer_latitude);
    const lon = parseFloat(form.customer_longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      api.findNearestDealers(lat, lon, 1)
        .then(dealers => {
          if (dealers.length > 0) {
            setNearestDealer(dealers[0]);
          } else {
            setNearestDealer(null);
          }
        })
        .catch(() => setNearestDealer(null));
    } else {
      setNearestDealer(null);
    }
  }, [form.customer_latitude, form.customer_longitude]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone || undefined,
        customer_address: form.customer_address || undefined,
        vehicle_id: parseInt(form.vehicle_id),
        quantity: parseInt(form.quantity) || 1,
      };

      const lat = parseFloat(form.customer_latitude);
      const lon = parseFloat(form.customer_longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        payload.customer_latitude = lat;
        payload.customer_longitude = lon;
      }

      const result = await api.createOrder(payload);
      setSuccess(`Order ${result.order_number} created! ${nearestDealer ? `Nearest dealer: ${nearestDealer.dealer_name} (${Math.round(nearestDealer.distance)} km)` : ''}`);
      setForm({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', customer_latitude: '', customer_longitude: '', vehicle_id: '', quantity: '1' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await api.updateOrder(id, { order_status: newStatus });
      loadData();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this order?')) return;
    try { await api.deleteOrder(id); loadData(); } catch (err) { alert(err.message); }
  }

  async function handleBatchUpdate() {
    try {
      const result = await api.batchUpdateOrders();
      alert(`Batch update complete: ${result.confirmed} confirmed, ${result.pending} pending out of ${result.total} total.`);
      loadData();
    } catch (err) { alert(err.message); }
  }

  const inStockVehicles = vehicles.filter(v => v.is_in_stock);

  if (loading) return <div className="p-8 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage customer vehicle orders</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBatchUpdate} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
            Run Batch Update
          </button>
          <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
            {showForm ? 'Cancel' : '+ New Order'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Order</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input required value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
              <input required type="email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.customer_address} onChange={e => setForm({...form, customer_address: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={form.customer_latitude} onChange={e => setForm({...form, customer_latitude: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={form.customer_longitude} onChange={e => setForm({...form, customer_longitude: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. -74.006" />
            </div>
            {nearestDealer && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Nearest: <strong>{nearestDealer.dealer_name}</strong> ({Math.round(nearestDealer.distance)} km)
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
              <select required value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select a vehicle</option>
                {inStockVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.vehicle_name} - {v.model} (${v.price?.toLocaleString()}) [{v.stock_quantity} in stock]</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Only in-stock vehicles shown</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Order #</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Vehicle</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Dealer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Qty</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-xs">{order.order_number}</td>
                <td className="py-3 px-4">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-xs text-gray-400">{order.customer_email}</div>
                </td>
                <td className="py-3 px-4">
                  <div>{order.vehicle_name}</div>
                  <div className="text-xs text-gray-400">{order.vehicle_model} {order.vehicle_year}</div>
                </td>
                <td className="py-3 px-4 text-gray-600">{order.dealer_name || '-'}</td>
                <td className="py-3 px-4">{order.quantity}</td>
                <td className="py-3 px-4"><StatusBadge status={order.order_status} /></td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {order.order_status !== 'Confirmed' && order.order_status !== 'Cancelled' && (
                      <button onClick={() => handleStatusChange(order.id, 'Confirmed')}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">Confirm</button>
                    )}
                    {order.order_status !== 'Cancelled' && (
                      <button onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100">Cancel</button>
                    )}
                    <button onClick={() => handleDelete(order.id)}
                      className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded hover:bg-gray-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-gray-400">No orders yet. Create your first order!</div>}
      </div>
    </div>
  );
}
