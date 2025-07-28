import { waitFor } from '@testing-library/react';
import { useCharacters } from './useCharacters';
import * as characterService from '@/service/character.service';
import { renderhookWithClientQuery } from '../../unit-tests/helper';

describe('useCharacters hook', () => {
  it('should not fetch the character list from msw from favourite is true', async () => {
    const { result } = renderhookWithClientQuery(() => useCharacters(1, '', false));
    expect(result.current.fetchStatus).toBe('idle');
  });
  it('should fetch the character list from msw', async () => {
    const { result } = renderhookWithClientQuery(() => useCharacters(1, '', true));
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(result.current.data?.results).toHaveLength(10);
  });
  it('should search the character list from msw', async () => {
    const spy = vi.spyOn(characterService, 'fetchCharacters');

    const { result, rerender } = renderhookWithClientQuery(
      ({ page, search, enabled }) => useCharacters(page, search, enabled),
      {
        initialProps: {
          page: 1,
          search: 'Search Patel',
          enabled: true,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(result.current.data?.results).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);

    rerender({ page: 2, search: 'Search Patel', enabled: true });
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(spy).toHaveBeenCalledTimes(1);

    rerender({ page: 1, search: 'Search Patel1', enabled: true });
    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
