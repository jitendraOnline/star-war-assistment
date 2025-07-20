import { useQuery } from '@tanstack/react-query';
import { fetchCharacters } from '../service/character.service';
import { PAGE_LIMIT } from '../shared/constants';
import type {
  CharacterListResponse,
  CharacterSearchResponse,
  CharacterSearchResultItem,
} from '@/types/character.type';

export const useCharacters = (page: number, search: string, enabled: boolean) => {
  return useQuery<CharacterListResponse>({
    queryKey: ['characters', page, search],
    enabled,
    staleTime: 1000 * 60 * 5,
    queryFn: async ({ signal }) => {
      const raw = await fetchCharacters(page, search, PAGE_LIMIT, signal);

      const isSearch = !!search.trim();
      if (!isSearch) {
        return raw as CharacterListResponse;
      }

      const searchData = raw as CharacterSearchResponse;
      const results = searchData.result.map((item: CharacterSearchResultItem) => {
        const p = item.properties;
        return {
          uid: item.uid,
          name: p.name,
          url: p.url,
          gender: p.gender,
          homeworld: p.homeworld,
          properties: p,
        };
      });

      return {
        message: searchData.message,
        total_pages: 1,
        total_records: results.length,
        previous: null,
        next: null,
        results,
      };
    },
  });
};
