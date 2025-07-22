import userEvent from '@testing-library/user-event';
import CharacterList from './CharacterList';
import { renderWithClientProdider, waitForLoadingToFinish } from '../../../unit-tests/helper';
import { localStorageFavouriteKey } from '../../hooks/useFavourites';

describe('Character List Page', () => {
  describe('Basic renderWithClientProdidering', () => {
    it('should show loading text', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      const laodingText = await screen.getByText(/loading/i);
      expect(laodingText).toBeInTheDocument();
    });
    it('should renderWithClientProdider character name, planet and gender', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      await waitForLoadingToFinish();
      const characterName = await screen.findByText(/Luke Skywalker/i);
      expect(characterName).toBeInTheDocument();
      const characteGender = await screen.findByText(/luke gender/i);
      expect(characteGender).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination buttons and allow navigation', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      await waitForLoadingToFinish();
      expect(await screen.findByRole('button', { name: /Previous/i })).toBeDisabled();
      expect(await screen.findByRole('button', { name: /Next/i })).toBeEnabled();
    });
  });

  describe('Search', () => {
    it('should allow user to search by name and show results', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      const input = await screen.findByPlaceholderText(/search by character name/i);
      await userEvent.type(input, 'Search Patel');
      expect(input).toHaveValue('Search Patel');
      await waitForLoadingToFinish();
      expect(await screen.findByText(/Showing 1–1 of 1/i)).toBeInTheDocument();
    });
  });

  describe('Favourites Toggle', () => {
    it('should allow displaying favourites from local storage', async () => {
      const favouriteCharacter = {
        1: {
          uid: '1',
          name: 'Favourite Character',
          gender: 'favourite gender',
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

      localStorage.setItem(localStorageFavouriteKey, JSON.stringify(favouriteCharacter));

      const screen = renderWithClientProdider(<CharacterList />);
      const toggle = await screen.findByRole('checkbox', { name: /show favourites only/i });
      expect(toggle).toBeInTheDocument();
      await userEvent.click(toggle);

      const characterName = await screen.findByText(/Favourite Character/i);
      expect(characterName).toBeInTheDocument();
      const characteGender = await screen.findByText(/favourite gender/i);
      expect(characteGender).toBeInTheDocument();
      const favouriteText = screen.getByText('Showing 1–1 of 1');
      expect(favouriteText).toBeInTheDocument();
    });
  });
});
