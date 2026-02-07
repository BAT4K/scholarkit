import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- SUB-COMPONENT: Product Card ---
const ProductCard = ({ product, onAddToCart }) => {
  const [size, setSize] = useState('M'); // Default size

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
      {/* Image Area */}
      <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium">Image: {product.name}</span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {product.description || 'Standard school uniform item.'}
        </p>

        {/* Size Selector */}
        <div className="mt-auto mb-3">
          <label className="text-xs font-bold text-gray-400 uppercase mr-2">Size:</label>
          <select 
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="text-sm border-gray-300 border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Price & Add Button */}
        <div className="flex justify-between items-center border-t pt-3 border-gray-100">
          <span className="text-lg font-bold text-blue-900">₹{product.price}</span>
          <button 
            onClick={() => onAddToCart(product, size)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-transform shadow-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function Shop() {
  const { user } = useAuth();
  
  // State for Filters
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gender, setGender] = useState('Male'); 

  // State for Data
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  // Helper for Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 1. Fetch Groups (Grades)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/schools/1/groups', getAuthHeaders());
        setGroups(res.data);
        if (res.data.length > 0) setSelectedGroup(res.data[0].id);
      } catch (err) {
        console.error("Failed to fetch groups", err);
        setError("Could not load school data.");
      }
    };
    fetchGroups();
  }, []);

  // 2. Fetch Catalog (Products)
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const res = await axios.get(
          `/api/catalog?group_id=${selectedGroup}&gender=${gender}`, 
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
  }, [selectedGroup, gender]);

  // 3. Add to Cart Action
  const addToCart = async (product, size) => {
    try {
      await axios.post('/api/cart', {
        productId: product.id,
        quantity: 1,
        size: size
      }, getAuthHeaders());
      
      // Simple feedback (You can replace this with a Toast notification later)
      alert(`Added ${product.name} (Size: ${size}) to your cart!`);
    } catch (err) {
      console.error(err);
      alert("Failed to add item. Please try again.");
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
            {groups.map((group) => (
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
            ))}
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