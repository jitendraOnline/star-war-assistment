import { BASE_URL } from '@/shared/constants';
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
  const url = `${BASE_URL}people?expanded=true&page=${page}&limit=${limit}${searchParam}`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch character list');

  return res.json() as Promise<CharacterListResponse | CharacterSearchResponse>;
};

export const fetchCharacterDetail = async (
  id: string,
  signal?: AbortSignal
): Promise<CharacterDetailResponse> => {
  const res = await fetch(`${BASE_URL}people/${id}`, { signal });
  if (!res.ok) throw new Error('Failed to fetch character detail');

  return (await res.json()) as CharacterDetailResponse;
};
