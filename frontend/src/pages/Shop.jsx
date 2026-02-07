import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Shop() {
  const { user } = useAuth();
  
  // State for Section A (Groups)
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // State for Section B (Products)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  // Helper to get headers with Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- SECTION A: Fetch Groups (On Mount) ---
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Hardcoded School ID '1' as requested
        const res = await axios.get('/api/schools/1/groups', getAuthHeaders());
        setGroups(res.data);
        
        // Auto-select the first group if available
        if (res.data.length > 0) {
          setSelectedGroup(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch groups", err);
        setError("Could not load school data. Please try logging in again.");
      }
    };

    fetchGroups();
  }, []);

  // --- SECTION B: Fetch Catalog (When Group Changes) ---
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const res = await axios.get(`/api/catalog?group_id=${selectedGroup}`, getAuthHeaders());
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch catalog", err);
        setError("Could not load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCatalog();
  }, [selectedGroup]);

  // --- UI RENDER ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">School Uniforms</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.name || 'Student'}. Select your grade below.</p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          {error}
        </div>
      )}

      {/* SECTION A: Grade Selector (Tabs) */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroup(group.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedGroup === group.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* SECTION B: Product Grid */}
      {loadingProducts ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No products found for this grade.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
                
                {/* Image Placeholder */}
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                   {/* If you have real images: <img src={product.image} ... /> */}
                   <span className="text-xs font-semibold">[IMG: {product.name}]</span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description || 'Standard uniform item'}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-900">
                      ₹{product.price}
                    </span>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      onClick={() => alert(`Added ${product.name} to cart!`)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}