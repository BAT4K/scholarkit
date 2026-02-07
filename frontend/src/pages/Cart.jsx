import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

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

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      await axios.put(`/api/cart/${id}`, { quantity: newQuantity }, getAuthHeaders());
      refreshCartCount();
    } catch (err) {
      fetchCart();
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`/api/cart/${id}`, getAuthHeaders());
      setCartItems(prev => prev.filter(item => item.id !== id));
      refreshCartCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRazorpayPayment = async () => {
    setCheckingOut(true);

    try {
      const orderRes = await axios.post(
        '/api/payment/create-order',
        {},
        getAuthHeaders()
      );

      const { amount, id: order_id, currency } = orderRes.data;

      const options = {
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: "ScholarKit",
        description: "School Uniform Purchase",
        order_id,

        handler: async function (response) {
          try {
            const placeOrderRes = await axios.post(
              '/api/orders',
              {
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              },
              getAuthHeaders()
            );

            alert('🎉 Payment Successful!');
            refreshCartCount();
            setCartItems([]);

            navigate('/order-success', {
              state: { orderId: placeOrderRes.data.orderId }
            });

          } catch (err) {
            alert("Payment Verified but Order Creation Failed");
          }
        },

        prefill: {
          name: user?.name || "Student",
          email: user?.email || "student@example.com",
          contact: "9999999999"
        },

        theme: {
          color: "#2563eb"
        }
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
      });

      rzp1.open();

    } catch (err) {
      console.error("Payment Start Error:", err);
      alert("Could not initiate payment.");
    } finally {
      setCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) * item.quantity),
    0
  );

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/shop')}
            className="text-blue-600 font-semibold hover:underline"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-gray-500 font-medium">Product</th>
                  <th className="p-4 text-gray-500 font-medium">Qty</th>
                  <th className="p-4 text-gray-500 font-medium">Price</th>
                  <th className="p-4 text-gray-500 font-medium"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cartItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center text-xs text-gray-500">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : 'IMG'}
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">
                            Size: {item.size}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center border border-gray-300 rounded w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 hover:bg-gray-100"
                        >-</button>

                        <span className="px-2 text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 hover:bg-gray-100"
                        >+</button>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUMMARY CARD */}
          <div className="bg-white p-6 rounded-lg shadow h-fit border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="border-t pt-4 flex justify-between mb-6">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={checkingOut}
              className="w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all"
            >
              {checkingOut ? "Starting Payment..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
