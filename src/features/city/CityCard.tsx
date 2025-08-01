import React from 'react';
import type { City } from './city.service';

interface CityCardProps {
  city: City;
  onDelete: (id: string) => void;
}

const CityCard: React.FC<CityCardProps> = ({ city, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
        <p className="text-sm text-gray-500">City ID: {city.id.slice(-8)}</p>
      </div>
      <button
        disabled={true}
        onClick={() => onDelete(city.id)}
        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Delete
      </button>
    </div>
  );
};

export default CityCard;
