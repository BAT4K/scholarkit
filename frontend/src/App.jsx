import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import Real Components
import ProtectedRoute from './components/ProtectedRoute'; 
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Shop from './pages/Shop'; 
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminRoute from './components/AdminRoute';   
import OrderSuccess from './pages/OrderSuccess';

// Placeholder for Orders 
const Orders = () => <div className="p-10 text-2xl font-bold">📦 Order History (Coming Soon)</div>;

function App() {
  return (
    <AuthProvider>
      {/* 4. Wrap the Router in CartProvider so Navbar & Shop can share state */}
      <CartProvider> 
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            
            {/* 5. Use the real Navbar (it handles its own logic now) */}
            <Navbar />
            
            <Routes>
              {/* Admin Route (Protected) */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Public Route */}
              <Route path="/" element={<Login />} />

              {/* Protected Routes */}
              <Route 
                path="/shop" 
                element={
                  <ProtectedRoute>
                    <Shop />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/order-success" 
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;