import { BASE_URL } from '@/shared/constants';
import type {
  PlanetDetailResponse,
  PlanetProperties,
  PlanetsResponse,
} from '@/types/character.type';

export const fetchPlanet = async (url: string, signal?: AbortSignal): Promise<PlanetProperties> => {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch planet');

  const data: PlanetDetailResponse = await res.json();
  return data.result.properties;
};

export const fetchPlanets = async (
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<PlanetsResponse> => {
  const url = `${BASE_URL}planets?expanded=true&page=${page}&limit=${limit}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Failed to fetch planets');
  return res.json() as Promise<PlanetsResponse>;
};
