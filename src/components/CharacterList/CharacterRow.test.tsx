import { CharacterRow } from './CharacterRow';
import { renderWithClientProdider } from '../../../unit-tests/helper';

const userData = {
  uid: '1',
  name: 'Luke Skywalker',
  url: 'https://www.swapi.tech/api/people/1',
  properties: {
    created: '2025-07-19T19:44:45.285Z',
    edited: '2025-07-19T19:44:45.285Z',
    name: 'Luke Skywalker',
    gender: 'male',
    skin_color: 'fair',
    hair_color: 'blond',
    height: '172',
    eye_color: 'blue',
    mass: '77',
    homeworld: 'https://www.swapi.tech/api/planets/1',
    birth_year: '19BBY',
    url: 'https://www.swapi.tech/api/people/1',
  },
};

describe('Character List Page', () => {
  describe('Basic renderWithClientProdidering', () => {
    it('should renderWithClientProdider character name, planet and gender', async () => {
      const screen = renderWithClientProdider(<CharacterRow character={userData}></CharacterRow>);
      const characterName = await screen.findByText(/Luke Skywalker/i);
      expect(characterName).toBeInTheDocument();
      const characteGender = await screen.findByText(/male/i);
      expect(characteGender).toBeInTheDocument();
      const charactePlanet = await screen.findByText(/Earth 1/i);
      expect(charactePlanet).toBeInTheDocument();
    });
  });
});
