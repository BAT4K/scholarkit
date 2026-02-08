import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Import Components
import ProtectedRoute from './components/ProtectedRoute'; 
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Shop from './pages/Shop'; 
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminRoute from './components/AdminRoute';   
import OrderSuccess from './pages/OrderSuccess';
import SelectSchool from './pages/SelectSchool'; 
import Orders from './pages/Orders'; 

function App() {
  return (
    // Router must be top-level for Providers to access navigation
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Navbar />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />

              {/* Protected Routes */}
              <Route 
                path="/select-school" 
                element={
                  <ProtectedRoute>
                    <SelectSchool /> 
                  </ProtectedRoute>
                } 
              />

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

              {/* Admin Route */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;