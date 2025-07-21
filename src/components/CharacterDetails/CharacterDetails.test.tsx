import CharacterDetails from './CharacterDetails';
import { render, screen } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';

//we shoudl get the character value id form url.(loading character and deatils of character)
// we should get call and api to get charater and dispaly its details(loading character and deatils of character)
// call the film api to films of character and dispaly there name(loading files and display loading films)
//call the starship api to list of starship character has piolited(loading starship and display loading films)
//there should favoutie button to make character favoutir or remote from favourite.
//there should be backbutton to navigate back to character

describe('CharacterDetails', () => {
  it('should display character details', async () => {
    render(<CharacterDetails />);

    const loadingText = await screen.findByText(/Loading/i);
    expect(loadingText).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));

    expect(await screen.findByText(/Jitendra Patel/i)).toBeInTheDocument();
    expect(await screen.findByText(/Male/i)).toBeInTheDocument();
    expect(await screen.findByText(/black/i)).toBeInTheDocument();
    expect(await screen.findByText(/Earth/i)).toBeInTheDocument();
  });

  it('should display character films', async () => {
    render(<CharacterDetails />);

    const loadingText = await screen.findByText(/Loading/i);
    expect(loadingText).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));

    expect(await screen.findByText(/A New Hope/i)).toBeInTheDocument();
    expect(screen.getByText(/The Empire Strikes Back/i)).toBeInTheDocument();
    expect(screen.queryByText(/Return of the Jedi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/The Phantom Menace/i)).not.toBeInTheDocument();
  });

  it('should display character starship', async () => {
    render(<CharacterDetails />);

    const loadingText = await screen.findByText(/Loading/i);
    expect(loadingText).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading/i));

    expect(await screen.findByText(/CR90 corvette/i)).toBeInTheDocument();
  });

  it('back button should be present on navigating to character details page', async () => {
    render(<CharacterDetails />);
    const backbutton = screen.getByRole('button', { name: / Back to Character List/i });
    expect(backbutton).toBeInTheDocument();
    expect(backbutton).toBeEnabled();
  });

  //   it('FAVOITUE BUTTON', async () => {
  //     TODO
  //   });
});
