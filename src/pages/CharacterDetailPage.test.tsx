import { render } from '@testing-library/react';

vi.mock('../components/CharacterDetails/CharacterDetails', () => {
  return {
    default: () => <div>Child Componet</div>,
  };
});

import CharacterDetailPage from './CharacterDetailPage';

describe('Character Detail Page', async () => {
  it('should render heading', () => {
    const screen = render(<CharacterDetailPage />);
    const heading = screen.getByText('Character Detail Page');
    expect(heading).toBeInTheDocument();
  });
  it('should render child componet', () => {
    const screen = render(<CharacterDetailPage />);
    const heading = screen.getByText('Child Componet');
    expect(heading).toBeInTheDocument();
  });
});
