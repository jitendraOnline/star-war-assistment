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
