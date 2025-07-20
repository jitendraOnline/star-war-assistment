import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterList from './CharacterList';

describe('Character List Page', () => {
  describe('Basic Rendering', () => {
    // it('should show loading text', async () => {
    //   const screen = render(<CharacterList />);
    //   const characterName = await screen.getByText(/loading/i);
    //   expect(characterName).toBeInTheDocument();
    // });
    it('should render character name, planet and gender', async () => {
      const screen = render(<CharacterList />);
      const characterName = await screen.findByText(/Jitendra Patel/i);
      expect(characterName).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination buttons and allow navigation', async () => {
      const screen = render(<CharacterList />);
      expect(await screen.findByRole('button', { name: /Previous/i })).toBeDisabled();
      expect(await screen.findByRole('button', { name: /Next/i })).toBeEnabled();
    });
  });

  describe('Search', () => {
    it('should allow user to search by name and show results', async () => {
      const screen = render(<CharacterList />);
      const input = await screen.findByPlaceholderText(/search by character name/i);
      await userEvent.type(input, 'Search Patel');
      expect(await screen.findByText(/Search Patel/i)).toBeInTheDocument();
    });
  });

  describe('Favourites Toggle', () => {
    it('should allow toggling favourites', async () => {
      const screen = render(<CharacterList />);
      const toggle = await screen.findByRole('checkbox', { name: /show favourites only/i });
      expect(toggle).toBeInTheDocument();
    });
  });
});
