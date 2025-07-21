import { useQuery } from '@tanstack/react-query';
import { fetchCharacterDetail } from '../service/character.service';

export const useCharacterDetail = (id?: string) => {
  return useQuery({
    queryKey: ['character', id],
    queryFn: ({ signal }) => fetchCharacterDetail(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
