import type {
  CharacterListResponse,
  PlanetDetailResponse,
  PlanetProperties,
  CharacterSearchResponse,
  FilmDetail,
  CharacterProperties,
  StarshipResponse,
} from '@/types/character.type';

export const fetchCharacters = async (
  page = 1,
  search = '',
  limit = 10,
  signal?: AbortSignal
): Promise<CharacterListResponse | CharacterSearchResponse> => {
  const hasSearch = !!search.trim();
  const searchParam = hasSearch ? `&name=${encodeURIComponent(search)}` : '';
  const url = `https://www.swapi.tech/api/people?expanded=true&page=${page}&limit=${limit}${searchParam}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch character list');

  return res.json(); // response will be typed at usage point
};

export const fetchPlanet = async (url: string, signal?: AbortSignal): Promise<PlanetProperties> => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch planet');

  const data: PlanetDetailResponse = await res.json();
  return data.result.properties;
};

export const fetchAllFilms = async (signal?: AbortSignal) => {
  const res = await fetch(`https://www.swapi.tech/api/films`, { signal });
  const data = await res.json();
  return data.result.map((item: { properties: FilmDetail }) => item.properties);
};

export const fetchCharacterDetail = async (
  url: string,
  signal?: AbortSignal
): Promise<CharacterProperties> => {
  const res = await fetch(`https://www.swapi.tech/api/people/${url}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch character detail');

  const data: any = await res.json();
  return data.result.properties;
};

export const fetchStarshipsPage = async (
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<StarshipResponse> => {
  const res = await fetch(
    `https://www.swapi.tech/api/starships?expanded=true&page=${page}&limit=${limit}`,
    { signal }
  );
  if (!res.ok) throw new Error('Failed to fetch starships');
  return res.json();
};
