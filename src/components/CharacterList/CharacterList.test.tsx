import userEvent from '@testing-library/user-event';
import CharacterList from './CharacterList';
import { renderWithClientProdider, waitForLoadingToFinish } from '../../../unit-tests/helper';

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
      expect(await screen.findByText(/Found 1 result for Search Patel./i)).toBeInTheDocument();
    });
  });

  describe('Favourites Toggle', () => {
    it('should allow toggling favourites', async () => {
      const screen = renderWithClientProdider(<CharacterList />);
      const toggle = await screen.findByRole('checkbox', { name: /show favourites only/i });
      expect(toggle).toBeInTheDocument();
    });
  });
});
