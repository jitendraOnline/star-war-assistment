import { act, renderHook } from '@testing-library/react';
import { useFavourites } from './useFavourites';

describe('useFavourites', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('it should return empty list when no favourite charater as there', async () => {
    const { result } = renderHook(() => useFavourites('1'));
    const favList = result.current.favourites;
    expect(Object.keys(favList)).toHaveLength(0);
  });
  it('it should set selected character to favouite when added', async () => {
    const favouriteCharacter = {
      '1': {
        uid: '1',
        name: 'Favourite Character',
        gender: 'favourite gender',
        url: '1',
        properties: {
          created: '2025-07-19T19:44:45.285Z',
          edited: '2025-07-19T19:44:45.285Z',
          name: 'Favourite Character',
          gender: 'favourite gender',
          skin_color: 'fair',
          hair_color: 'blond',
          height: '172',
          eye_color: 'blue',
          mass: '77',
          homeworld: 'https://www.swapi.tech/api/planets/1',
          birth_year: '19BBY',
          url: 'https://www.swapi.tech/api/people/1',
        },
      },
    };
    const { result } = renderHook(() => useFavourites('1', favouriteCharacter['1']));
    const favList = result.current.favourites;
    expect(Object.keys(favList)).toHaveLength(0);
    expect(result.current.isFavourite).toBeFalsy();
    act(() => {
      result.current.toggleFavourite();
    });
    expect(result.current.isFavourite).toBeTruthy();
    expect(result.current.favourites).toHaveProperty('1');
    act(() => {
      result.current.toggleFavourite();
    });
    expect(result.current.isFavourite).toBeFalsy();
  });
});
