import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCharacterDetail } from '../../hooks/useCharacterDetails';
import { useFilmByCharacter } from '../../hooks/useFilmByCharacter';
import { useStarshipsByCharacter } from '../../hooks/useStarshipByCharacter';
import { useFavourites } from '../../hooks/useFavourites';
import { usePlanetsByCharacter } from '@/hooks/usePlanetsByCharacter';
import { PaginatedTable } from '../Shared/DataTable';
import type { FilmProperties, StarshipProperties } from '../../types/character.type';

function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: characterDetailResponse, isLoading, isError, refetch } = useCharacterDetail(id);
  const character = characterDetailResponse?.result?.properties;
  const { isFavourite, toggleFavourite } = useFavourites(id, characterDetailResponse?.result);

  const {
    data: planet,
    isLoading: isPlanetLoading,
    isError: isPlanetError,
  } = usePlanetsByCharacter(character?.homeworld);

  const {
    data: films,
    isLoading: isFilmsLoading,
    isError: isFilmsError,
  } = useFilmByCharacter(character?.url);

  const {
    data: starships,
    isLoading: starShipLoading,
    isError: isStarShipError,
  } = useStarshipsByCharacter(character?.url);

  const filmsData = {
    message: 'Films',
    total_records: films?.length || 0,
    total_pages: 1,
    previous: null,
    next: null,
    results: films || [],
  };

  const starshipsData = {
    message: 'Starships',
    total_records: starships?.length || 0,
    total_pages: 1,
    previous: null,
    next: null,
    results: starships || [],
  };

  const filmColumns = [
    {
      header: 'Title',
      key: 'title',
      render: (film: FilmProperties) => (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></div>
          <span className="font-semibold text-gray-900">{film.title}</span>
        </div>
      ),
    },
    {
      header: 'Release Date',
      key: 'release_date',
      render: (film: FilmProperties) => (
        <span className="text-gray-600 text-sm">{film.release_date}</span>
      ),
    },
    {
      header: 'Episode',
      key: 'episode_id',
      render: (film: FilmProperties) => (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Episode {film.episode_id}
        </div>
      ),
    },
  ];

  const starshipColumns = [
    {
      header: 'Name',
      key: 'name',
      render: (starship: StarshipProperties) => (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3 flex-shrink-0"></div>
          <span className="font-semibold text-gray-900">{starship.name}</span>
        </div>
      ),
    },
    {
      header: 'Model',
      key: 'model',
      render: (starship: StarshipProperties) => (
        <span className="text-gray-600 text-sm">{starship.model || '-'}</span>
      ),
    },
    {
      header: 'Class',
      key: 'starship_class',
      render: (starship: StarshipProperties) => (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {starship.starship_class || '-'}
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-red-700 font-medium">Error loading character.</p>
                <div className="mt-2">
                  <button
                    onClick={() => refetch()}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/20">
          <button
            onClick={() => navigate(`/characters${location.search}`)}
            className="group flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <span className="text-sm font-medium">← Back to Character List</span>
          </button>

          <button
            data-testid="favourite-toggle"
            disabled={isLoading}
            onClick={toggleFavourite}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
              isFavourite
                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-md border border-yellow-300'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md border border-gray-300 hover:from-gray-200 hover:to-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            aria-label="Toggle Favourite Button"
          >
            <span
              className={`text-lg transition-transform duration-200 ${isFavourite ? 'text-yellow-500 scale-110' : 'text-gray-400'}`}
            >
              {isFavourite ? '★ Favourite' : '☆ Favourite'}
            </span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-gray-600 font-medium">Loading character details...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
                {character?.name}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 lg:p-10 rounded-2xl shadow-xl border border-white/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Gender
                    </span>
                    <p className="text-gray-900 font-semibold text-lg">{character?.gender}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                  <div className="w-4 h-4 bg-green-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                      Hair Color
                    </span>
                    <p className="text-gray-900 font-semibold text-lg">{character?.hair_color}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                  <div className="w-4 h-4 bg-purple-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      Eye Color
                    </span>
                    <p className="text-gray-900 font-semibold text-lg">{character?.eye_color}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                      Home Planet
                    </span>
                    <p className="text-gray-900 font-semibold text-lg">
                      {isPlanetLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                          Loading...
                        </span>
                      ) : isPlanetError ? (
                        'Unknown'
                      ) : (
                        (planet?.[0]?.name ?? '-')
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-8 flex-wrap">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Films</h2>
                <p className="text-sm text-gray-500">Movies featuring this character</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
              <PaginatedTable
                data={filmsData}
                pageLimit={6}
                height="450px"
                isLoading={isFilmsLoading}
                loadingMessage="Loading Films"
                isError={isFilmsError}
                getRowKey={(film) => film.uid}
                columns={filmColumns}
                emptyText="No films found for this character."
              />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Starships</h2>
                <p className="text-sm text-gray-500">Vessels piloted by this character</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
              <PaginatedTable
                data={starshipsData}
                pageLimit={6}
                height="450px"
                isLoading={starShipLoading}
                loadingMessage="Loading StarShips..."
                isError={isStarShipError}
                getRowKey={(starship) => starship.name}
                columns={starshipColumns}
                emptyText="No starships found for this character."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterDetail;
