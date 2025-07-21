// App.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { routes } from './routes/routes';

vi.mock('./pages/CharacterListPage', () => ({
  default: () => <div data-testid="character-list">Character List Page</div>,
}));

vi.mock('./pages/CharacterDetailPage', () => ({
  default: () => <div data-testid="character-detail">Character Detail Page</div>,
}));

describe('App Routing', () => {
  it('renders header', () => {
    render(<App />);
    expect(screen.getByText('Allica Bank')).toBeInTheDocument();
  });

  it('redirects / to /characters', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);
    expect(await screen.findByTestId('character-list')).toBeInTheDocument();
  });

  it('renders character list page on /characters', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/characters'],
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('character-list')).toBeInTheDocument();
  });

  it('renders character detail page on /characters/:id', () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/characters/42'],
    });

    render(<RouterProvider router={router} />);
    expect(screen.getByTestId('character-detail')).toBeInTheDocument();
  });
});
