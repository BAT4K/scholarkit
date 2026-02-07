import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading history...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/shop" className="text-blue-600 font-semibold hover:underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Order Placed</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total</p>
                  <p className="font-medium text-gray-900">₹{order.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Order #</p>
                  <p className="font-medium text-gray-900">{order.id}</p>
                </div>
                <div className="sm:ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Body (Items Preview) */}
              <div className="p-6">
                {/* Note: Ideally, you'd fetch 'order_items' for each order here. 
                   For MVP, we just show a button to view details if you implement a details page later.
                */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">
                    Thank you for your purchase. We are processing your items.
                  </p>
                  {/* You can add a 'View Items' button here later that toggles a dropdown */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}