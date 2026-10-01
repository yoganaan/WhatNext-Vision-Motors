import { useState, useEffect } from 'react';
import { api } from '../services/api';

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}

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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const result = await api.getDashboard();
      setData(result);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchUpdate() {
    setBatchRunning(true);
    try {
      await api.batchUpdateOrders();
      await loadData();
    } catch (err) {
      console.error('Batch update failed:', err);
    } finally {
      setBatchRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of WhatsNext Vision Motors operations</p>
        </div>
        <button
          onClick={handleBatchUpdate}
          disabled={batchRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {batchRunning ? 'Updating...' : 'Run Status Update'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Dealers" value={data?.totalDealers || 0} color="bg-blue-500"
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <StatCard title="Total Vehicles" value={data?.totalVehicles || 0} color="bg-purple-500"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        <StatCard title="Total Orders" value={data?.totalOrders || 0} color="bg-green-500"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <StatCard title="Revenue" value={`$${(data?.totalRevenue || 0).toLocaleString()}`} color="bg-amber-500"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      {/* Stock Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Vehicle Stock Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Stock</span>
              <span className="text-sm font-bold text-green-600">{data?.inStockVehicles || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${((data?.inStockVehicles || 0) / Math.max(data?.totalVehicles || 1, 1)) * 100}%` }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="text-sm font-bold text-red-600">{data?.outOfStockVehicles || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${((data?.outOfStockVehicles || 0) / Math.max(data?.totalVehicles || 1, 1)) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {(data?.ordersByStatus || []).map(s => (
              <div key={s.order_status} className="flex items-center justify-between">
                <StatusBadge status={s.order_status} />
                <span className="text-sm font-bold">{s.count}</span>
              </div>
            ))}
            {(!data?.ordersByStatus || data.ordersByStatus.length === 0) && (
              <p className="text-sm text-gray-400">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-500">Order #</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Vehicle</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Dealer</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders || []).map(order => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 font-mono text-xs">{order.order_number}</td>
                  <td className="py-3 px-2">{order.customer_name}</td>
                  <td className="py-3 px-2">{order.vehicle_name}</td>
                  <td className="py-3 px-2">{order.dealer_name || '-'}</td>
                  <td className="py-3 px-2"><StatusBadge status={order.order_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!data?.recentOrders || data.recentOrders.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet. Create your first order!</p>
          )}
        </div>
      </div>
    </div>
  );
}
