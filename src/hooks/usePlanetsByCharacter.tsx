import { useQuery } from '@tanstack/react-query';
import type { PlanetProperties } from '../types/character.type';
import { fetchPlanets } from '@/service/planet.service';

export const usePlanetsByCharacter = (peopleUrl?: string) => {
  return useQuery<PlanetProperties[]>({
    queryKey: ['all-planets'],
    queryFn: async ({ signal }) => {
      const meta = await fetchPlanets(1, 1, signal);
      const total = meta.total_records;
      const allData = await fetchPlanets(1, total, signal);
      return allData.results.map((r) => r.properties);
    },
    staleTime: 1000 * 60 * 10,
    enabled: true,
    select: (planets) => {
      if (!peopleUrl) return [];
      return planets.filter((planet) => planet.url.includes(peopleUrl));
    },
  });
};
