import type {
  CharacterListResponse,
  PlanetDetailResponse,
  PlanetProperties,
  CharacterSearchResponse,
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
