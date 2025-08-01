import React, { useState } from 'react';
import { addPerson } from './people.service';
import { useCitiesContext } from '@/contexts/CitiesContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

const initialNewPerson = {
  name: '',
  balance: '',
  cityId: '',
  aadhaar: '',
  petName: '',
  phone: '',
  gender: 'male',
};

type NewPersonState = typeof initialNewPerson;

const AddPersonPage: React.FC = () => {
  const { userId } = useUser();
  const { cities, citiesLoading, citiesError } = useCitiesContext();
  const [newPerson, setNewPerson] = useState<NewPersonState>(initialNewPerson);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name.trim() || !newPerson.cityId || !userId) return;
    setLoading(true);
    try {
      await addPerson(userId, {
        name: newPerson.name.trim(),
        balance: Number(newPerson.balance) || 0,
        cityId: newPerson.cityId,
        aadhaar: newPerson.aadhaar.trim(),
        petName: newPerson.petName.trim(),
        phone: newPerson.phone.trim(),
        gender: newPerson.gender as 'male' | 'female' | 'other',
      });
      navigate('/people');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || citiesError;

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
        <h1 className="text-2xl font-bold">Add Person</h1>
      </div>
      {displayError && <div className="mb-4 text-red-600">{displayError}</div>}
      {citiesLoading ? (
        <div>Loading cities...</div>
      ) : (
        <form onSubmit={handleAddPerson} className="flex flex-col gap-4 bg-gray-50 p-4 rounded">
          <div>
            <label className="block mb-1 text-gray-700">Name</label>
            <input
              type="text"
              value={newPerson.name}
              onChange={(e) => setNewPerson((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Balance</label>
            <input
              type="number"
              value={newPerson.balance}
              onChange={(e) => setNewPerson((p) => ({ ...p, balance: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">City</label>
            <select
              value={newPerson.cityId}
              onChange={(e) => setNewPerson((p) => ({ ...p, cityId: e.target.value }))}
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
              value={newPerson.aadhaar}
              onChange={(e) => setNewPerson((p) => ({ ...p, aadhaar: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={newPerson.phone}
              onChange={(e) => setNewPerson((p) => ({ ...p, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Relationship (optional)</label>
            <input
              type="text"
              value={newPerson.petName}
              onChange={(e) => setNewPerson((p) => ({ ...p, petName: e.target.value }))}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="e.g., Father, Mother, Spouse, Friend"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Gender</label>
            <select
              value={newPerson.gender}
              onChange={(e) =>
                setNewPerson((p) => ({ ...p, gender: e.target.value as NewPersonState['gender'] }))
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
            {loading ? 'Adding...' : 'Add Person'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddPersonPage;
