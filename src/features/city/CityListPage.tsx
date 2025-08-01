import React, { useEffect, useState } from 'react';
import { subscribeToCities, addCity, deleteCity, type City } from './city.service';

const CityListPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [newCity, setNewCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCities(
      (cities) => {
        setCities(cities);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    try {
      await addCity(newCity.trim());
      setNewCity('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteCity = async (id: string) => {
    try {
      await deleteCity(id);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cities / Villages</h1>
      <form onSubmit={handleAddCity} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          placeholder="Add new city or village"
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </form>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div>Loading cities...</div>
      ) : cities.length === 0 ? (
        <div className="text-gray-500">No cities found.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded shadow">
          {cities.map((city) => (
            <li key={city.id} className="flex items-center justify-between px-4 py-3">
              <span>{city.name}</span>
              <button
                disabled={true}
                onClick={() => handleDeleteCity(city.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityListPage;
