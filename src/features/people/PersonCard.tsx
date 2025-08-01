import React from 'react';
import { Link } from 'react-router-dom';
import type { Person } from './people.service';
import type { City } from '../city/city.service';

interface PersonCardProps {
  person: Person;
  cities: City[];
  onDelete: (id: string) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ person, cities, onDelete }) => {
  const cityName = cities.find((c) => c.id === person.cityId)?.name || 'N/A';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{person.gender || 'Not specified'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/people/edit/${person.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(person.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            ₹{person.balance.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</p>
          <p className="text-sm text-gray-900 mt-1">{cityName}</p>
        </div>
        {person.phone && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="text-sm text-gray-900 mt-1">{person.phone}</p>
          </div>
        )}
        {person.aadhaar && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aadhaar</p>
            <p className="text-sm text-gray-900 mt-1">{person.aadhaar}</p>
          </div>
        )}
        {person.petName && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Relationship
            </p>
            <p className="text-sm text-gray-900 mt-1">{person.petName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonCard;
