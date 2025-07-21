import { useQuery } from '@tanstack/react-query';
import { fetchCharacterDetail } from '../service/character.service';

export const useCharacterDetail = (id?: string) => {
  const query = useQuery({
    queryKey: ['character', id],
    queryFn: ({ signal }) => fetchCharacterDetail(id!, signal),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
  return {
    character: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
