import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  // Hide Navbar on Login page
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/shop" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
              ScholarKit
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Admin Link (Only visible if role is admin) */}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-red-600 hover:text-red-800 font-bold transition">
                Dashboard
              </Link>
            )}
            
            {/* My Orders Link */}
            <Link to="/orders" className="text-gray-600 hover:text-blue-600 font-medium transition">
              My Orders
            </Link>

            {/* Cart Icon with Badge */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {/* The Badge */}
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Logout */}
            <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
              <span className="text-sm text-gray-500 hidden md:block">Hi, {user?.name || 'User'}</span>
              <button 
                onClick={logout} 
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}