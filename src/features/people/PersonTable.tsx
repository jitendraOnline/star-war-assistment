import React from 'react';
import { Link } from 'react-router-dom';
import type { Person } from './people.service';
import type { City } from '../city/city.service';

interface PersonTableProps {
  people: Person[];
  cities: City[];
  onDelete: (id: string) => void;
}

const PersonTable: React.FC<PersonTableProps> = ({ people, cities, onDelete }) => {
  return (
    <table className="min-w-full bg-white rounded shadow">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Balance</th>
          <th className="px-4 py-2 text-left">City</th>
          <th className="px-4 py-2 text-left">Phone</th>
          <th className="px-4 py-2 text-left">Aadhaar</th>
          <th className="px-4 py-2 text-left">Relationship</th>
          <th className="px-4 py-2 text-left">Gender</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id} className="border-t">
            <td className="px-4 py-2">{person.name}</td>
            <td className="px-4 py-2">{person.balance}</td>
            <td className="px-4 py-2">
              {cities.find((c) => c.id === person.cityId)?.name || 'N/A'}
            </td>
            <td className="px-4 py-2">{person.phone || '-'}</td>
            <td className="px-4 py-2">{person.aadhaar || '-'}</td>
            <td className="px-4 py-2">{person.petName || '-'}</td>
            <td className="px-4 py-2 capitalize">{person.gender || '-'}</td>
            <td className="px-4 py-2 flex gap-2">
              <Link
                to={`/people/edit/${person.id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => onDelete(person.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PersonTable;
