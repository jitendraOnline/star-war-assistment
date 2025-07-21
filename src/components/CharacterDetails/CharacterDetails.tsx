import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCharacterDetail } from '../../hooks/useCharacterDetails';
import { usePlanet } from '../..//hooks/usePlanet';
import { useFilmByCharacter } from '../../hooks/useFilmByCharacter';
import type { FilmDetail, Starship } from '../../types/character.type';
import { useStarshipsByCharacter } from '../../hooks/useStarshipByCharacter';
import { useFavourites } from '../../hooks/useFavourites';

function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { character, isLoading, isError, refetch } = useCharacterDetail(id);
  const { isFavourite, toggleFavourite } = useFavourites(id, character);
  const {
    data: planet,
    isLoading: isPlanetLoading,
    isError: isPlanetError,
  } = usePlanet(character?.homeworld);

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

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading character.{' '}
        <button onClick={() => refetch()} className="underline text-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={() => navigate(`/characters${location.search}`)}
        className="text-sm text-blue-600 underline hover:text-blue-800"
      >
        ← Back to Character List
      </button>

      <button
        data-testid="favourite-toggle"
        disabled={isLoading}
        onClick={toggleFavourite}
        className={`text-sm ml-4 ${isFavourite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 disabled:text-gray-200`}
        aria-label="Toggle Favourite Button"
      >
        {isFavourite ? '★' : '☆'} Favourite
      </button>

      {isLoading ? (
        <div className="text-gray-500">Loading character details...</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">{character?.name}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Gender:</strong> {character?.gender}
            </p>
            <p>
              <strong>Hair Color:</strong> {character?.hair_color}
            </p>
            <p>
              <strong>Eye Color:</strong> {character?.eye_color}
            </p>
            <p>
              <strong>Home Planet:</strong>{' '}
              {isPlanetLoading ? 'Loading...' : isPlanetError ? 'Unknown' : (planet?.name ?? '-')}
            </p>
          </div>
        </>
      )}

      <div>
        <h2 className="text-lg font-semibold mt-6 mb-2">Films</h2>
        {isFilmsLoading ? (
          <p>Loading films...</p>
        ) : isFilmsError ? (
          <p className="text-red-500">Failed to load films.</p>
        ) : films?.length === 0 ? (
          <p>No films found for this character.</p>
        ) : (
          <ul className="list-disc list-inside text-sm">
            {films?.map((film: FilmDetail) => (
              <li key={film.uid}>
                {film.title} ({film.release_date})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mt-6 mb-2">Starships</h2>
        {starShipLoading ? (
          <p>Loading StarShips...</p>
        ) : isStarShipError ? (
          <p className="text-red-500">Failed to load starship.</p>
        ) : starships?.length === 0 ? (
          <p>No starship found for this character.</p>
        ) : (
          <ul className="list-disc list-inside text-sm">
            {starships?.map((starship: Starship) => (
              <li key={starship?.name}>{starship?.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CharacterDetailPage;
