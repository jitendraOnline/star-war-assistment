import { renderWithClientProdider } from '../../../unit-tests/helper';
import CharacterDetails from './CharacterDetails';
import { screen } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

//we shoudl get the character value id form url.(loading character and deatils of character)
// we should get call and api to get charater and dispaly its details(loading character and deatils of character)
// call the film api to films of character and dispaly there name(loading files and display loading films)
//call the starship api to list of starship character has piolited(loading starship and display loading films)
//there should favoutie button to make character favoutir or remote from favourite.
//there should be backbutton to navigate back to character

describe('CharacterDetails', () => {
  beforeEach(() => {
    renderWithClientProdider(
      <MemoryRouter initialEntries={['/characters/1']}>
        <Routes>
          <Route path="/characters/:id" element={<CharacterDetails />} />
        </Routes>
      </MemoryRouter>,
      false
    );
  });

  it('should load and display character details', async () => {
    const loadingText = await screen.findByText(/Loading character details.../i);
    expect(loadingText).toBeInTheDocument();

    expect(await screen.findByText(/Luke Skywalker/i)).toBeInTheDocument();
    expect(await screen.findByText(/Male/i)).toBeInTheDocument();
    expect(await screen.findByText(/blond/i)).toBeInTheDocument();
    expect(await screen.findByText(/Tatooine/i)).toBeInTheDocument();
  });

  it('should display character films', async () => {
    const loadingText = await screen.getByText(/Loading Films/i);
    expect(loadingText).toBeInTheDocument();

    await waitForElementToBeRemoved(loadingText);

    expect(await screen.findByText(/A New Hope/i)).toBeInTheDocument();
    expect(screen.getByText(/The Empire Strikes Back/i)).toBeInTheDocument();
  });

  it('should display character starship', async () => {
    const loadingText = await screen.findByText(/Loading StarShips.../i);
    expect(loadingText).toBeInTheDocument();

    await waitForElementToBeRemoved(loadingText);

    expect(await screen.findByText(/Sentinel-class landing craft/i)).toBeInTheDocument();
  });

  it('back button should be present on navigating to character details page', async () => {
    const backbutton = screen.getByRole('button', { name: / Back to Character List/i });
    expect(backbutton).toBeInTheDocument();
    expect(backbutton).toBeEnabled();
  });

  it('it should dispaly favourite button after charter load and user should be able to toggle it.', async () => {
    const favouriteButton = screen.getByRole('button', { name: /Toggle Favourite Button/i });
    expect(favouriteButton).toBeInTheDocument();
    expect(favouriteButton).toBeDisabled();
    expect(favouriteButton).toHaveTextContent('☆ Favourite');
    const loadingText = await screen.findByText(/Loading character details.../i);
    expect(loadingText).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText(/Loading character details.../i));
    expect(favouriteButton).toBeEnabled();
    await userEvent.click(favouriteButton);
    expect(favouriteButton).toBeInTheDocument();
    expect(favouriteButton).toHaveTextContent('★ Favourite');
  });
});
