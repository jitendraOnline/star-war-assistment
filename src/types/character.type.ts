export interface ApiResponse<T> {
  message: string;
  result: T;
}

export interface PaginatedResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

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

export interface CharacterSearchResultItem {
  uid: string;
  description: string;
  _id: string;
  __v: number;
  properties: CharacterProperties;
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

export interface PlanetDetail {
  uid: string;
  _id: string;
  description: string;
  properties: PlanetProperties;
}

export interface FilmProperties {
  title: string;
  release_date: string;
  characters: string[];
  uid: string;
}

export interface FilmDetail {
  uid: string;
  _id: string;
  description: string;
  properties: FilmProperties;
}

export interface StarshipProperties {
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
  pilots: string[];
  films: string[];
  url: string;
  created: string;
  edited: string;
}

export interface StarshipListItem {
  uid: string;
  _id: string;
  description: string;
  properties: StarshipProperties;
}

export type CharacterDetailResponse = ApiResponse<CharacterListItem>;

export type CharacterListResponse = PaginatedResponse<CharacterListItem>;

export type CharacterSearchResponse = ApiResponse<CharacterSearchResultItem[]>;

export type FilmResponse = ApiResponse<FilmDetail[]>;

export type PlanetDetailResponse = ApiResponse<PlanetDetail>;
export type StarshipResponse = PaginatedResponse<StarshipListItem>;
