import { useQuery } from '@tanstack/react-query';
import { fetchPlanet } from '../service/character.service';

export const usePlanet = (homeworld?: string) => {
  return useQuery({
    queryKey: ['planet', homeworld],
    queryFn: ({ signal }) => fetchPlanet(homeworld!, signal),
    enabled: !!homeworld,
    staleTime: Infinity,
  });
};
