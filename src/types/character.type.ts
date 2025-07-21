export interface CharacterProperties {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  created: string;
  edited: string;
  url: string;
}

export interface CharacterListItem {
  uid: string;
  name: string;
  url: string;
  gender?: string;
  homeworld?: string;
  properties?: CharacterProperties;
}

export interface CharacterListResponse {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: CharacterListItem[];
}

export interface CharacterSearchResultItem {
  uid: string;
  description: string;
  _id: string;
  __v: number;
  properties: CharacterProperties;
}

export interface CharacterSearchResponse {
  message: string;
  result: CharacterSearchResultItem[];
}

export interface PlanetProperties {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  url: string;
  created: string;
  edited: string;
}

export interface PlanetDetailResponse {
  message: string;
  result: {
    uid: string;
    properties: PlanetProperties;
  };
}

export type FilmDetail = {
  title: string;
  release_date: string;
  characters: string[];
  uid: string;
};

export interface Starship {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  crew: string;
  passengers: string;
  max_atmosphering_speed: string;
  hyperdrive_rating: string;
  MGLT: string;
  cargo_capacity: string;
  consumables: string;
  starship_class: string;
  pilots: string[]; // URLs to people
  films: string[];
  url: string;
  created: string;
  edited: string;
}

export interface StarshipResponse {
  message: string;
  total_records: number;
  results: {
    uid: string;
    _id: string;
    description: string;
    properties: Starship;
  }[];
}
