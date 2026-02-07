import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Helper for Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Fetch Cart on Load
  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart', getAuthHeaders());
      setCartItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load cart", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Remove Item
  const removeItem = async (id) => {
    try {
      await axios.delete(`/api/cart/${id}`, getAuthHeaders());
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  // 3. Checkout Action
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await axios.post('/api/orders', {}, getAuthHeaders());
      
      alert('🎉 Order Placed Successfully!');
      setCartItems([]); 
      navigate('/shop');
    } catch (err) {
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Calculate Total on Frontend
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  if (loading) return <div className="p-10 text-center">Loading your cart...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <button onClick={() => navigate('/shop')} className="mt-4 text-blue-600 font-semibold hover:underline">
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-gray-500 font-medium">Product</th>
                  <th className="p-4 text-gray-500 font-medium">Size</th>
                  <th className="p-4 text-gray-500 font-medium">Price</th>
                  <th className="p-4 text-gray-500 font-medium text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          IMG
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-600">{item.size}</td>
                    <td className="p-4 font-bold text-gray-900">₹{item.price}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-4 flex justify-between mb-6">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold text-blue-600">₹{cartTotal.toFixed(2)}</span>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-md
                ${checkingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
            >
              {checkingOut ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}