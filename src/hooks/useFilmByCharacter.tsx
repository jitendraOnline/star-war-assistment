import { useQuery } from '@tanstack/react-query';
import { fetchAllFilms } from '../service/character.service';
import type { FilmDetail } from '../types/character.type';

export const useFilmByCharacter = (characterUrl?: string) => {
  return useQuery<FilmDetail[]>({
    queryKey: ['all-films'],
    queryFn: ({ signal }) => fetchAllFilms(signal),
    staleTime: 1000 * 60 * 10,
    enabled: true,
    select: (allFilms) => {
      if (!characterUrl) return [];
      return allFilms.filter((film) => film.characters.includes(characterUrl));
    },
  });
};
