import React, { useState } from 'react';
import { addPerson } from './people.service';
import { useCitiesContext } from '@/contexts/CitiesContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { CityAutocomplete } from '@/components/UI/CityAutocomplete';

const initialNewPerson = {
  name: '',
  balance: '',
  cityId: '',
  cityName: '',
  aadhaar: '',
  petName: '',
  phone: '',
  gender: 'male',
};

type NewPersonState = typeof initialNewPerson;

const AddPersonPage: React.FC = () => {
  const { userId } = useUser();
  const { citiesLoading, citiesError } = useCitiesContext();
  const [newPerson, setNewPerson] = useState<NewPersonState>(initialNewPerson);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name.trim() || (!newPerson.cityId && !newPerson.cityName.trim()) || !userId)
      return;
    setLoading(true);
    try {
      await addPerson(userId, {
        name: newPerson.name.trim(),
        balance: Number(newPerson.balance) || 0,
        cityId: newPerson.cityId || newPerson.cityName.trim(), // Use cityId if available, otherwise use cityName
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => navigate('/people')}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Person</h1>
              <p className="mt-1 text-sm text-gray-600">Create a new person record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{displayError}</p>
              </div>
            </div>
          </div>
        )}

        {citiesLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="ml-3 text-gray-600">Loading cities...</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleAddPerson}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-600">Fill in the details for the new person</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="hidden">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Balance</label>
                  <input
                    type="number"
                    value={newPerson.balance}
                    onChange={(e) => setNewPerson((p) => ({ ...p, balance: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">City *</label>
                <CityAutocomplete
                  value={newPerson.cityId}
                  onChange={(cityId, cityName) => setNewPerson((p) => ({ ...p, cityId, cityName }))}
                  placeholder="Enter or select city name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Aadhaar Card Number
                  </label>
                  <input
                    type="text"
                    value={newPerson.aadhaar}
                    onChange={(e) => setNewPerson((p) => ({ ...p, aadhaar: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter Aadhaar number"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Relationship (optional)
                  </label>
                  <input
                    type="text"
                    value={newPerson.petName}
                    onChange={(e) => setNewPerson((p) => ({ ...p, petName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Father, Mother, Spouse, Friend"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={newPerson.gender}
                    onChange={(e) =>
                      setNewPerson((p) => ({
                        ...p,
                        gender: e.target.value as NewPersonState['gender'],
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Person...
                    </>
                  ) : (
                    'Add Person'
                  )}
                </button>
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  onClick={() => navigate('/people')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPersonPage;
