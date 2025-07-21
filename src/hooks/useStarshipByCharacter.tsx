import { useQuery } from '@tanstack/react-query';
import { fetchStarshipsPage } from '../service/starship.service';
import type { StarshipProperties } from '../types/character.type';

export const useStarshipsByCharacter = (peopleUrl?: string) => {
  return useQuery<StarshipProperties[]>({
    queryKey: ['all-starships'],
    queryFn: async ({ signal }) => {
      const meta = await fetchStarshipsPage(1, 1, signal);
      const total = meta.total_records;
      const allData = await fetchStarshipsPage(1, total, signal);
      return allData.results.map((r) => r.properties);
    },
    staleTime: 1000 * 60 * 10,
    enabled: true,
    select: (allStarships) => {
      if (!peopleUrl) return [];
      return allStarships.filter((ship) => ship.pilots.includes(peopleUrl));
    },
  });
};
