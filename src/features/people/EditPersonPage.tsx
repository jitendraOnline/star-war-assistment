import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePerson } from './people.service';
import { subscribeToCities } from '../city/city.service';
import type { City } from '../city/city.service';
import { useDataContext } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';

const initialPerson = {
  name: '',
  balance: '',
  cityId: '',
  aadhaar: '',
  petName: '',
  gender: 'male',
};

type EditPersonState = typeof initialPerson;

const EditPersonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { people } = useDataContext();
  const { userId } = useUser();
  const [person, setPerson] = useState<EditPersonState>(initialPerson);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubCities = subscribeToCities(
      (cities) => setCities(cities),
      (err) => setError(err.message)
    );

    return () => {
      unsubCities();
    };
  }, []);

  useEffect(() => {
    if (id && people.length > 0) {
      const found = people.find((p) => p.id === id);
      if (found) {
        setPerson({
          name: found.name,
          balance: String(found.balance),
          cityId: found.cityId,
          aadhaar: found.aadhaar || '',
          petName: found.petName || '',
          gender: found.gender || 'male',
        });
      }
    }
  }, [id, people]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !person.name.trim() || !person.cityId || !userId) return;
    setLoading(true);
    try {
      await updatePerson(userId, id, {
        name: person.name.trim(),
        balance: Number(person.balance) || 0,
        cityId: person.cityId,
        aadhaar: person.aadhaar.trim(),
        petName: person.petName.trim(),
        gender: person.gender as 'male' | 'female' | 'other',
      });
      navigate('/people');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="mr-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => navigate('/people')}
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Edit Person</h1>
      </div>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4 bg-gray-50 p-4 rounded">
        <div>
          <label className="block mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={person.name}
            onChange={(e) => setPerson((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Balance</label>
          <input
            type="number"
            value={person.balance}
            onChange={(e) => setPerson((p) => ({ ...p, balance: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">City</label>
          <select
            value={person.cityId}
            onChange={(e) => setPerson((p) => ({ ...p, cityId: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            required
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Aadhaar Card Number</label>
          <input
            type="text"
            value={person.aadhaar}
            onChange={(e) => setPerson((p) => ({ ...p, aadhaar: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Pet Name (optional)</label>
          <input
            type="text"
            value={person.petName}
            onChange={(e) => setPerson((p) => ({ ...p, petName: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Gender</label>
          <select
            value={person.gender}
            onChange={(e) =>
              setPerson((p) => ({ ...p, gender: e.target.value as EditPersonState['gender'] }))
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default EditPersonPage;
