import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to process token
  const processToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      // On refresh, we set the user from the token payload
      setUser(decoded);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Invalid token:", error);
      logout();
    }
  };

  // 1. Check for token on app mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      processToken(token);
    }
    setLoading(false);
  }, []);

  // 2. Login Action
  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  // 3. Register Action (NEW)
  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  // 4. Logout Action
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom hook for cleaner usage in components
export const useAuth = () => useContext(AuthContext);