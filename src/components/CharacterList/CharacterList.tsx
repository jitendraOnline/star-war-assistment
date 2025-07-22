import { useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { debounse } from '../../shared/utils';
import { useCharacters } from '../../hooks/useCharacters';
import { PAGE_LIMIT } from '../../shared/constants';
import { useFavourites } from '../../hooks/useFavourites';
import { usePlanetsByCharacter } from '@/hooks/usePlanetsByCharacter';
import { PaginatedTable } from '../Shared/DataTable';
import type { CharacterListItem } from '../../types/character.type';

const PlanetDisplay = ({ homeworld }: { homeworld?: string }) => {
  const { data: planet, isLoading, isError } = usePlanetsByCharacter(homeworld);

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Unknown</span>;
  return <span>{planet?.[0]?.name || '-'}</span>;
};

const CharacterNameCell = ({ character }: { character: CharacterListItem }) => {
  const [searchParams] = useSearchParams();
  const { isFavourite } = useFavourites(character.uid);
  const queryString = searchParams.toString();
  const querySuffix = queryString ? `?${queryString}` : '';
  return (
    <div className="flex items-center">
      <Link
        to={`/characters/${character.uid}${querySuffix}`}
        className="text-blue-600 hover:underline"
      >
        {character.properties?.name}
      </Link>
      {isFavourite && (
        <span title="favourite" className="text-yellow-500 ml-1">
          ★
        </span>
      )}
    </div>
  );
};

export const CharacterList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  const page = Number(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const { favourites } = useFavourites();

  const { data, isLoading, isError, refetch } = useCharacters(page, search, !showFavouritesOnly);

  const debouncedSearch = useRef(
    debounse((value: string) => setSearchParams({ page: '1', search: value }))
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

  const getFavoritesData = () => {
    const favList = Object.values(favourites);
    const filteredFavorites = favList.filter((char) =>
      char?.properties?.name?.toLowerCase()?.includes(search?.toLowerCase()?.trim())
    );

    return {
      message: 'Favorites',
      total_records: filteredFavorites.length,
      total_pages: 1,
      previous: null,
      next: null,
      results: filteredFavorites,
    };
  };

  const tableColumns = [
    {
      header: 'Name',
      key: 'name',
      render: (character: CharacterListItem) => <CharacterNameCell character={character} />,
    },
    {
      header: 'Gender',
      key: 'gender',
      render: (character: CharacterListItem) => <span>{character.properties?.gender ?? '-'}</span>,
    },
    {
      header: 'Planet',
      key: 'planet',
      render: (character: CharacterListItem) => (
        <PlanetDisplay homeworld={character.properties?.homeworld} />
      ),
    },
  ];

  const currentData = showFavouritesOnly ? getFavoritesData() : data;
  const currentLoading = showFavouritesOnly ? false : isLoading;
  const currentError = showFavouritesOnly ? false : isError;

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search by character name"
          value={inputValue}
          onChange={handleSearch}
          className="w-full max-w-sm p-2 border border-gray-300 rounded"
        />
        <label className="inline-flex items-center space-x-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFavouritesOnly}
            onChange={(e) => setShowFavouritesOnly(e.target.checked)}
          />
          <span className="text-sm">Show Favourites Only</span>
        </label>
      </div>

      <div>
        <PaginatedTable
          data={
            currentData || {
              message: '',
              total_records: 0,
              total_pages: 0,
              previous: null,
              next: null,
              results: [],
            }
          }
          pageLimit={PAGE_LIMIT}
          isLoading={currentLoading}
          isError={currentError}
          onRetry={refetch}
          currentPage={page}
          onPageNumberChange={(newPage) => {
            updatePage(newPage);
          }}
          getRowKey={(item) => item.uid}
          columns={tableColumns}
          emptyText={
            showFavouritesOnly
              ? Object.values(favourites).length === 0
                ? 'No favourites added.'
                : 'No matching favorites found.'
              : search
                ? `No characters found for "${search}". Try a different name.`
                : 'No characters available'
          }
        />
      </div>
    </div>
  );
};

export default CharacterList;
