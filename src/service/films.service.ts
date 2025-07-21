import { BASE_URL } from '@/shared/constants';
import type { FilmResponse } from '@/types/character.type';

export const fetchAllFilms = async (signal?: AbortSignal): Promise<FilmResponse> => {
  const res = await fetch(`${BASE_URL}films`, { signal });
  if (!res.ok) throw new Error('Failed to fetch films');

  return (await res.json()) as FilmResponse;
};
