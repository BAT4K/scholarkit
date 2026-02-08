import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// --- SUB-COMPONENT: Product Card ---
const ProductCard = ({ product, onAddToCart }) => {
  const [size, setSize] = useState('M'); 
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-400 text-sm font-medium">Image: {product.name}</div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {product.description || 'Standard school uniform item.'}
        </p>

        <div className="mt-auto mb-3 flex items-center gap-2">
          <select 
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="text-sm border-gray-300 border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="flex items-center border border-gray-300 rounded">
            <button 
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm"
            >-</button>
            <span className="px-2 text-sm font-medium">{qty}</span>
            <button 
              onClick={() => setQty(q => q + 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm"
            >+</button>
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-3 border-gray-100">
          <span className="text-lg font-bold text-blue-900">₹{product.price}</span>
          <button 
            onClick={() => onAddToCart(product, size, qty)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Shop() {
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const navigate = useNavigate();
  
  // State for Filters
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gender, setGender] = useState('Male'); 
  const [schoolId, setSchoolId] = useState(null); // New State

  // State for Data
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Initialize School ID & Fetch Groups
  useEffect(() => {
    // Read from LocalStorage
    const storedSchoolId = localStorage.getItem('selectedSchool');
    
    if (!storedSchoolId) {
      // If no school selected, force redirect
      navigate('/select-school');
      return;
    }

    setSchoolId(storedSchoolId);

    const fetchGroups = async () => {
      try {
        // Dynamic URL based on stored School ID
        const res = await axios.get(`/api/schools/${storedSchoolId}/groups`, getAuthHeaders());
        setGroups(res.data);
        if (res.data.length > 0) setSelectedGroup(res.data[0].id);
      } catch (err) {
        console.error("Failed to fetch groups", err);
        setError("Could not load school data.");
      }
    };
    fetchGroups();
  }, [navigate]);

  // 2. Fetch Catalog (Products)
  useEffect(() => {
    if (!selectedGroup || !schoolId) return; // Wait for schoolId

    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        // Pass school_id in query params
        const res = await axios.get(
          `/api/catalog?group_id=${selectedGroup}&gender=${gender}&school_id=${schoolId}`, 
          getAuthHeaders()
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch catalog", err);
        setError("Could not load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchCatalog();
  }, [selectedGroup, gender, schoolId]); // Added schoolId dependency

  // 3. Add to Cart Action
  const addToCart = async (product, size, quantity) => {
    try {
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: quantity,
        size: size
      }, getAuthHeaders());
      
      refreshCartCount();
      alert(`✅ Added ${quantity} x ${product.name} (${size}) to cart!`);
    } catch (err) {
      console.error(err);
      alert("Failed to add item.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">School Uniforms</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.name || 'Student'}.</p>
      </div>

      {/* --- CONTROLS SECTION --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
        
        {/* Grade Selector */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Grade</span>
          <div className="flex gap-2 flex-wrap">
            {groups.length === 0 ? (
                <span className="text-sm text-gray-400">Loading grades...</span>
            ) : (
                groups.map((group) => (
                <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGroup === group.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {group.name}
                </button>
                ))
            )}
          </div>
        </div>

        {/* Gender Selector */}
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Gender</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['Male', 'Female'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  gender === g
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mb-6 font-medium">{error}</div>}

      {/* --- PRODUCT GRID --- */}
      {loadingProducts ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No products found for {gender}s in this grade.</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}