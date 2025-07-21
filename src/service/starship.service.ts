import { BASE_URL } from '@/shared/constants';
import type { StarshipResponse } from '@/types/character.type';

export const fetchStarshipsPage = async (
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<StarshipResponse> => {
  const url = `${BASE_URL}starships?expanded=true&page=${page}&limit=${limit}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch starships');

  return res.json() as Promise<StarshipResponse>;
};
