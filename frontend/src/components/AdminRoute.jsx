import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Checking permissions...</div>;

  // If not logged in, go to Login
  if (!user) return <Navigate to="/" replace />;

  // If logged in but NOT admin, go to Shop
  if (user.role !== 'admin') {
    return <Navigate to="/shop" replace />;
  }

  // If admin, show page
  return children;
}