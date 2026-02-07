import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to process token
  const processToken = (token) => {
    try {
      const decoded = jwtDecode(token);
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
  const login = (token) => {
    processToken(token);
  };

  // 3. Logout Action
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

// Custom hook for cleaner usage in components
export const useAuth = () => useContext(AuthContext);