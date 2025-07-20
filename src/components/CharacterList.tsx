import { useRef, useState } from 'react';
import type { CharacterListItem } from '../types/character.type';
import { debouse } from '../shared/utils';
import { Link, useSearchParams } from 'react-router-dom';
import { useCharacters } from '../hooks/useCharacters';
import { usePlanet } from '../hooks/usePlanet';
import { PAGE_LIMIT } from '../shared/constants';

const CharacterRow = ({ character }: { character: CharacterListItem }) => {
  const uid = character.uid;
  const { name, homeworld, gender } = character.properties!;
  const [searchParams] = useSearchParams();

  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : '';

  const { data: planet, isLoading, isError } = usePlanet(homeworld);

  const planetName = isLoading
    ? 'Loading...'
    : isError
      ? 'Unknown'
      : typeof planet === 'string'
        ? planet
        : (planet?.name ?? '-');

  return (
    <tr className="hover:bg-blue-50">
      <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
        <Link to={`/characters/${uid}${querySuffix}`} className="text-blue-600 hover:underline">
          {name}
        </Link>
      </td>
      <td className="px-4 py-2 text-sm text-gray-600 whitespace-nowrap">{gender}</td>
      <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">{planetName}</td>
    </tr>
  );
};

export const CharacterList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(search);
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const { favourites } = { favourites: {} }; // useFavourites(); // Uncomment when useFavourites hook is implemented

  const updateParams = (newPage: number, newSearch: string) => {
    setSearchParams({ page: String(newPage), search: newSearch });
  };

  const { data, isLoading, isError, refetch } = useCharacters(page, search, !showFavouritesOnly);

  const debouncedSetSearchRef = useRef(
    debouse((value: string) => {
      updateParams(1, value);
    })
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedSetSearchRef.current(val);
  };

  const handlePageChange = (newPage: number) => {
    updateParams(newPage, search);
  };

  const getPaginationInfo = (page: number, limit: number, total = 0) => {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total}`;
  };

  const tableHeaders = ['Name', 'Gender', 'Planet'];

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2 ">
        <input
          type="text"
          placeholder="Search by character name"
          aria-label="Search by character name"
          value={inputValue}
          onChange={handleSearchChange}
          className="w-full max-w-sm p-2 border border-gray-300 rounded"
        />
        <label className="inline-flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={showFavouritesOnly}
            onChange={() => setShowFavouritesOnly((prev) => !prev)}
          />
          <span className="text-sm">Show Favourites Only</span>
        </label>
      </div>

      {isError ? (
        <div className="flex items-center gap-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          <p className="text-sm font-medium">Error fetching characters.</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 underline hover:text-blue-800 rounded cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {!isLoading && (
            <p className="text-sm text-gray-700">
              {search
                ? `Found ${data?.total_records} result for ${search}. ${
                    data?.total_records === 0 ? 'Try a different name.' : ''
                  }`
                : getPaginationInfo(page, PAGE_LIMIT, data?.total_records ?? 0)}
            </p>
          )}

          <div className="overflow-x-auto h-[400px] rounded shadow border border-gray-200">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-900"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {showFavouritesOnly ? (
                  Object.values(favourites).length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableHeaders.length}
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        No favourites added.
                      </td>
                    </tr>
                  ) : (
                    Object.values(favourites).map((char: any) => (
                      <CharacterRow key={char.uid} character={char} />
                    ))
                  )
                ) : isLoading ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="px-4 py-2 text-sm text-gray-600">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  data?.results?.map((char) => <CharacterRow key={char.uid} character={char} />)
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!search && !showFavouritesOnly && (
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!data?.previous}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!data?.next}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterList;
