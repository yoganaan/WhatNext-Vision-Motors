import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_name: '', model: '', year: '2026', color: '', price: '', stock_quantity: '', description: '' });

  useEffect(() => { loadVehicles(); }, []);

  async function loadVehicles() {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.createVehicle({
        ...form,
        year: parseInt(form.year),
        price: parseFloat(form.price) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      });
      setForm({ vehicle_name: '', model: '', year: '2026', color: '', price: '', stock_quantity: '', description: '' });
      setShowForm(false);
      loadVehicles();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this vehicle?')) return;
    try { await api.deleteVehicle(id); loadVehicles(); } catch (err) { alert(err.message); }
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 mt-1">Manage vehicle inventory and stock</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name *</label>
              <input required value={form.vehicle_name} onChange={e => setForm({...form, vehicle_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <input required type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input type="number" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save Vehicle</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Vehicle</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Model</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Year</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Color</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{v.vehicle_name}</td>
                <td className="py-3 px-4 text-gray-600">{v.model}</td>
                <td className="py-3 px-4 text-gray-600">{v.year}</td>
                <td className="py-3 px-4 text-gray-600">{v.color || '-'}</td>
                <td className="py-3 px-4 text-gray-600">${(v.price || 0).toLocaleString()}</td>
                <td className="py-3 px-4 font-medium">{v.stock_quantity}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v.is_in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {v.is_in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vehicles.length === 0 && <div className="text-center py-12 text-gray-400">No vehicles yet.</div>}
      </div>
    </div>
  );
}
