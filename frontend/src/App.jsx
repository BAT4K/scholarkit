import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Real Components
import ProtectedRoute from './components/ProtectedRoute'; 
import Login from './pages/Login';
import Shop from './pages/Shop'; 

// Placeholder for Cart (We haven't built this file yet)
const Cart = () => <div className="p-10 text-2xl font-bold">🛒 Shopping Cart (Coming Soon)</div>;

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="p-4 bg-white shadow-md mb-8 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl font-bold text-blue-600">ScholarKit</h1>
      {user && (
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600 hidden sm:inline">Hi, {user.email || 'User'}</span>
          <button 
            onClick={logout} 
            className="text-sm text-red-500 hover:text-red-700 font-semibold border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Navbar />
          
          <Routes>
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
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;