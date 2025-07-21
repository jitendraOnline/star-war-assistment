import type {
  CharacterListResponse,
  CharacterSearchResponse,
  CharacterDetailResponse,
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

  return res.json() as Promise<CharacterListResponse | CharacterSearchResponse>;
};

export const fetchCharacterDetail = async (
  id: string,
  signal?: AbortSignal
): Promise<CharacterDetailResponse> => {
  const res = await fetch(`https://www.swapi.tech/api/people/${id}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch character detail');

  return (await res.json()) as CharacterDetailResponse;
};
