import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SelectSchool() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get('/api/schools');
        setSchools(res.data);
      } catch (err) {
        console.error("Failed to fetch schools", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  const handleSelectSchool = (schoolId) => {
    localStorage.setItem('selectedSchool', schoolId);
    navigate('/shop');
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading schools...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight">
        Select Your School
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {schools.map((school) => (
          <div
            key={school.id}
            onClick={() => handleSelectSchool(school.id)}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-500 cursor-pointer transition-all duration-300 p-8 flex flex-col items-center justify-center h-64"
          >
            {/* IMAGE CONTAINER 
               h-40: Fixed height makes sure all cards align.
               w-full: Uses full width of the card.
               flex/justify-center: Centers the image.
            */}
            <div className="h-40 w-full flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              {school.image_url ? (
                <img 
                  src={school.image_url} 
                  alt={school.name} 
                  // object-contain: Key to keeping logos proportional (no stretching)
                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                />
              ) : (
                <span className="text-4xl">🏫</span>
              )}
            </div>

            {/* Optional: We keep the name in the DOM but hide it visually if you want 
                only logos. Or keep it small text for clarity.
                Here is the 'Small Text' version: */}
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              {school.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}