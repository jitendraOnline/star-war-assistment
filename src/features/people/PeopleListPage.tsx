import React, { useState } from 'react';
import { deletePerson } from './people.service';
import FilterablePersonTable from './FilterablePersonTable';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '@/contexts/DataContext';
import { useCitiesContext } from '@/contexts/CitiesContext';
import { useUser } from '@/contexts/UserContext';

const PeopleListPage: React.FC = () => {
  const { people, peopleLoading, error: dataError } = useDataContext();
  const { cities, citiesLoading, citiesError } = useCitiesContext();
  const { userId } = useUser();
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleAddPersonClick = () => {
    navigate('/people/add');
  };

  const handleDeletePerson = async (id: string) => {
    if (!userId) return;

    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await deletePerson(userId, id);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const isLoading = peopleLoading || citiesLoading;
  const displayError = error || dataError || citiesError;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">People</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={handleAddPersonClick}
        >
          Add Person
        </button>
      </div>
      {displayError && <div className="mb-4 text-red-600">{displayError}</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : people.length === 0 ? (
        <div className="text-gray-500">No people found.</div>
      ) : (
        <FilterablePersonTable people={people} cities={cities} onDelete={handleDeletePerson} />
      )}
    </div>
  );
};

export default PeopleListPage;
