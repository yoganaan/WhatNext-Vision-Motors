import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dealer_name: '', street: '', city: '', state: '', postal_code: '', country: '', latitude: '', longitude: '', phone: '', email: '' });

  useEffect(() => { loadDealers(); }, []);

  async function loadDealers() {
    try {
      const data = await api.getDealers();
      setDealers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
      if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;
      await api.createDealer(payload);
      setForm({ dealer_name: '', street: '', city: '', state: '', postal_code: '', country: '', latitude: '', longitude: '', phone: '', email: '' });
      setShowForm(false);
      loadDealers();
    } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this dealer?')) return;
    try { await api.deleteDealer(id); loadDealers(); } catch (err) { alert(err.message); }
  }

  if (loading) return <div className="p-8 flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
          <p className="text-gray-500 mt-1">Manage dealer locations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
          {showForm ? 'Cancel' : '+ Add Dealer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">New Dealer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dealer Name *</label>
              <input required value={form.dealer_name} onChange={e => setForm({...form, dealer_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input value={form.street} onChange={e => setForm({...form, street: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. 40.7128" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. -74.006" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save Dealer</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dealers.map(dealer => (
          <div key={dealer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{dealer.dealer_name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {[dealer.street, dealer.city, dealer.state, dealer.postal_code].filter(Boolean).join(', ') || 'No address'}
                </p>
                {dealer.latitude && dealer.longitude && (
                  <p className="text-xs text-gray-400 mt-1">
                    Lat: {dealer.latitude.toFixed(4)}, Lon: {dealer.longitude.toFixed(4)}
                  </p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  {dealer.phone && <span>{dealer.phone}</span>}
                  {dealer.email && <span>{dealer.email}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(dealer.id)} className="text-red-400 hover:text-red-600 p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {dealers.length === 0 && (
        <div className="text-center py-12 text-gray-400">No dealers yet. Add your first dealer!</div>
      )}
    </div>
  );
}
