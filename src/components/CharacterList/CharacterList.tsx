import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debouse } from '../../shared/utils';
import { useCharacters } from '../../hooks/useCharacters';
import { PAGE_LIMIT } from '../../shared/constants';
import { CharacterRow } from './CharacterRow';
import { useFavourites } from '../../hooks/useFavourites';

const TABLE_HEADERS = ['Name', 'Gender', 'Planet'];

export const CharacterList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const { favourites } = useFavourites();

  const { data, isLoading, isError, refetch } = useCharacters(page, search, !showFavouritesOnly);

  const debouncedSearch = useRef(
    debouse((value: string) => setSearchParams({ page: '1', search: value }))
  );

  const updatePage = (newPage: number) =>
    setSearchParams({
      page: String(newPage),
      search,
    });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch.current(value);
  };

  const getDisplayText = () => {
    if (isLoading) return '';

    const total = data?.total_records || 0;

    if (search) {
      return `Found ${total} result${total !== 1 ? 's' : ''} for ${search}.${total === 0 ? ' Try a different name.' : ''}`;
    }

    const start = (page - 1) * PAGE_LIMIT + 1;
    const end = Math.min(page * PAGE_LIMIT, total);
    return `Showing ${start}-${end} of ${total}`;
  };

  const renderTableContent = () => {
    if (showFavouritesOnly) {
      const favList = Object.values(favourites);
      return favList.length === 0 ? (
        <tr>
          <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
            No favourites added.
          </td>
        </tr>
      ) : (
        favList.map((char: any) => <CharacterRow key={char.uid} character={char} />)
      );
    }

    if (isLoading) {
      return (
        <tr>
          <td colSpan={3} className="px-4 py-2 text-sm text-gray-600">
            Loading...
          </td>
        </tr>
      );
    }

    return (
      data?.results?.map((character) => (
        <CharacterRow key={character.uid} character={character} />
      )) || []
    );
  };

  if (isError) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
          <p className="text-sm font-medium">Error fetching characters.</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const shouldShowPagination = !search && !showFavouritesOnly && data;

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by character name"
          value={inputValue}
          onChange={handleSearch}
          className="w-full max-w-sm p-2 border border-gray-300 rounded"
        />

        <label className="inline-flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={showFavouritesOnly}
            onChange={(e) => setShowFavouritesOnly(e.target.checked)}
          />
          <span className="text-sm">Show Favourites Only</span>
        </label>
      </div>

      <p className="text-sm text-gray-700">{getDisplayText()}</p>

      <div className="overflow-x-auto h-[400px] rounded shadow border border-gray-200">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th key={header} className="px-4 py-2 text-left text-sm font-medium text-gray-900">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">{renderTableContent()}</tbody>
        </table>
      </div>

      {shouldShowPagination && (
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => updatePage(page - 1)}
            disabled={!data.previous}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => updatePage(page + 1)}
            disabled={!data.next}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterList;
