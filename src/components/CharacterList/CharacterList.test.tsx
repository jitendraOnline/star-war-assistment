import userEvent from '@testing-library/user-event';
import CharacterList from './CharacterList';
import { renderWithClientProdider, waitForLoadingToFinish } from '../../../unit-tests/helper';
import { localStorageFavouriteKey } from '../../hooks/useFavourites';
import { within } from '@testing-library/react';
import { server } from '../../../unit-tests/mockserver';
import { http, HttpResponse } from 'msw';

describe('Character List Page', () => {
  describe('Basic renderWithClientProdidering', () => {
    it('should show loading text', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      const laodingText = await screen.getByText(/loading/i);
      expect(laodingText).toBeInTheDocument();
    });
    it('should show character name, planet and gender', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      await waitForLoadingToFinish();

      const row = await screen.findByRole('row', { name: /Luke Skywalker/i });
      const characterLink = within(row).getByRole('link', { name: /Luke Skywalker/i });
      expect(characterLink).toBeInTheDocument();
      const genderCell = within(row).getByRole('cell', { name: /luke gender/i });
      expect(genderCell).toBeInTheDocument();
      const planetCell = await within(row).findByRole('cell', { name: /Tatooine/i });
      expect(planetCell).toBeInTheDocument();
    });
  });

  describe('Error from getCharacter api', () => {
    it('should show somethign went wrong', async () => {
      server.use(
        http.get('https://www.swapi.tech/api/people', () => {
          return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
      );
      const screen = renderWithClientProdider(<CharacterList />);
      await waitForLoadingToFinish();
      const tryAgainButton = await screen.findByRole('button', { name: /Try Again/i });
      expect(tryAgainButton).toBeInTheDocument();
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      server.resetHandlers();
      await userEvent.click(tryAgainButton);

      const tryAgainButton1 = await screen.queryByRole('button', { name: /Try Again/i });
      expect(tryAgainButton1).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination buttons and allow navigation. next button should be enabled as we have nextPage true from mock data', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      await waitForLoadingToFinish();
      expect(await screen.findByRole('button', { name: /Previous/i })).toBeDisabled();
      const nextButton = await screen.findByRole('button', { name: /Next/i });
      expect(nextButton).toBeEnabled();
    });
  });

  describe('Search', () => {
    it('should allow user to search by name and show results', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      const input = await screen.findByPlaceholderText(/search by character name/i);
      await userEvent.type(input, 'Search Patel');
      expect(input).toHaveValue('Search Patel');
      await waitForLoadingToFinish();
      const row = await screen.findByRole('row', { name: /Search Patel/i });
      const characterLink = within(row).getByRole('link', { name: /Search Patel/i });
      expect(characterLink).toBeInTheDocument();
      expect(await screen.findByText(/Showing 1-1 of 1/i)).toBeInTheDocument();
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

      const characterRow = await screen.findByRole('row', { name: /Favourite Character/i });
      const characterLink = within(characterRow).getByRole('link', {
        name: /Favourite Character/i,
      });
      const favouriteGender = within(characterRow).getByRole('cell', {
        name: /favourite gender/i,
      });
      expect(characterLink).toBeInTheDocument();
      expect(favouriteGender).toBeInTheDocument();
      const favouriteText = screen.getByText('Showing 1-1 of 1');
      expect(favouriteText).toBeInTheDocument();
    });
  });
});
