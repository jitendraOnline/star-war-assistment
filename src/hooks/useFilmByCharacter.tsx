import { useQuery } from '@tanstack/react-query';
import { fetchAllFilms } from '../service/films.service';

export const useFilmByCharacter = (characterUrl?: string) => {
  return useQuery({
    queryKey: ['all-films'],
    queryFn: ({ signal }) => fetchAllFilms(signal),
    staleTime: 1000 * 60 * 10,
    enabled: true,
    select: (allFilms) => {
      if (!characterUrl) return [];
      return allFilms.result
        .map((filem) => filem.properties)
        .filter((film) => film.characters.includes(characterUrl));
    },
  });
};
