import { render } from '@testing-library/react';

vi.mock('../components/CharacterList/CharacterList', () => {
  return {
    default: () => <div>Child Componet</div>,
  };
});
import CharacterListPage from './CharacterListPage';

describe('CharacterListPage', async () => {
  it('it should render heading for CharacterListPage', () => {
    const screen = render(<CharacterListPage />);
    const heading = screen.getByText('Character List');
    expect(heading).toBeInTheDocument();
  });
  it('it should render child compeont componet', () => {
    const screen = render(<CharacterListPage />);
    const heading = screen.getByText('Child Componet');
    expect(heading).toBeInTheDocument();
  });
});
