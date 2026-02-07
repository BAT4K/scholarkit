import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, lowStockCount: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper for Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch Data
  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/stats', getAuthHeaders()),
        axios.get('/api/admin/orders', getAuthHeaders())
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Admin Load Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Action: Update Order Status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus }, getAuthHeaders());
      fetchData();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {/* --- SECTION A: STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold uppercase">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold uppercase">Total Orders</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-semibold uppercase">Active Users</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
          <p className="text-gray-500 text-sm font-semibold uppercase">Low Stock Alerts</p>
          <p className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {stats.lowStockCount}
          </p>
        </div>
      </div>

      {/* --- SECTION B: ORDER MANAGEMENT TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.user_name}</div>
                    <div className="text-gray-500 text-xs">{order.user_email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">₹{order.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                      ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Shipped')}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Mark Shipped
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Delivered')}
                        className="text-green-600 hover:text-green-800 font-semibold text-xs border border-green-200 px-3 py-1 rounded hover:bg-green-50 transition"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}