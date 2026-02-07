import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Wait for Auth check to finish
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading session...
      </div>
    );
  }

  // 2. If no user, kick them out to Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Authorized? Let them through
  return children;
}