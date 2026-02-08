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
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 uppercase font-semibold text-xs mb-1">Order Placed</p>
                    <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase font-semibold text-xs mb-1">Total</p>
                    <p className="font-medium text-gray-900">₹{order.total_amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase font-semibold text-xs mb-1">Order #</p>
                    <p className="font-medium text-gray-900">{order.id}</p>
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                  ${order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-green-50 text-green-700 border-green-200'}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items Gallery */}
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Horizontal Scroll of Product Images */}
                <div className="flex gap-3 overflow-x-auto w-full">
                  {/* We safely map items, defaulting to empty array if none exist */}
                  {(order.items || []).slice(0, 4).map((item, index) => {
                    // Logic: If this is the 4th item AND there are more items hidden, show badge
                    if (index === 3 && order.items.length > 4) {
                      return (
                        <div key="more" className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                          +{order.items.length - 3} more
                        </div>
                      );
                    }
                    
                    return (
                      <div key={index} className="group relative flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-gray-400 text-center p-1">
                            {item.name}
                          </div>
                        )}
                        
                        {/* Tooltip on Hover */}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-medium text-center px-1 line-clamp-2">
                            {item.name}
                          </span>
                        </div>

                        {/* Quantity Badge (only if > 1) */}
                        {item.quantity > 1 && (
                          <div className="absolute top-0 right-0 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl shadow-sm">
                            x{item.quantity}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}