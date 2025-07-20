import { useState } from 'react';

const MOCK_CHARACTERS = [
  {
    uid: '1',
    name: 'Jitendra Patel',
    planet: 'Earth',
    gender: 'Male',
  },
  {
    uid: '1',
    name: 'Search Patel',
    planet: 'Earth',
    gender: 'Male',
  },
];

const CharacterList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  const characters = MOCK_CHARACTERS.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by character name"
          value={searchTerm}
          onChange={handleSearch}
          aria-label="Search by character name"
          className="w-full max-w-sm p-2 border border-gray-300 rounded"
        />
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showFavouritesOnly}
            onChange={() => setShowFavouritesOnly((val) => !val)}
          />
          <span>Show Favourites Only</span>
        </label>
      </div>

      <p className="text-sm text-gray-600">Showing 1-3 of 3</p>

      <div className="overflow-x-auto h-[300px] border border-gray-200 rounded">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Gender</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Planet</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {characters.length ? (
              characters.map((char) => (
                <tr key={char.uid}>
                  <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">{char.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
                    {char.gender}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                    {char.planet}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm text-gray-500 text-center whitespace-nowrap"
                >
                  No favourites added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4">
        <button disabled className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
          Previous
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Next</button>
      </div>
    </div>
  );
};

export default CharacterList;
