import { http, HttpResponse } from 'msw';

import page1 from './__mock__ /characters/page-1.json';
import page2 from './__mock__ /characters/page-2.json';
import page3 from './__mock__ /characters/page-3.json';
import searchPatel from './__mock__ /characters/search-patel.json';
import searchEmpty from './__mock__ /characters/search-empty.json';

import person1 from './__mock__ /people/1.json';
import personSp1 from './__mock__ /people/sp1.json';

import planet1 from './__mock__ /planets/1.json';
import planet2 from './__mock__ /planets/2.json';
import planet3 from './__mock__ /planets/3.json';
import planetSp1 from './__mock__ /planets/sp1.json';

import films from './__mock__ /films.json';

export const handlers = [
  http.get('https://www.swapi.tech/api/people', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ?? '1';
    const name = url.searchParams.get('name') ?? '';

    if (name === 'Search Patel') return HttpResponse.json(searchPatel);
    if (name.length > 0) return HttpResponse.json(searchEmpty);

    switch (page) {
      case '1':
        return HttpResponse.json(page1);
      case '2':
        return HttpResponse.json(page2);
      case '3':
        return HttpResponse.json(page3);
      default:
        return HttpResponse.json({
          message: 'ok',
          total_records: 0,
          total_pages: 0,
          previous: null,
          next: null,
          results: [],
        });
    }
  }),

  http.get('https://www.swapi.tech/api/people/1', () => HttpResponse.json(person1)),

  http.get('https://www.swapi.tech/api/people/sp1', () => HttpResponse.json(personSp1)),

  http.get('https://www.swapi.tech/api/planets/:id', ({ params }) => {
    const id = params.id as string;

    switch (id) {
      case '1':
        return HttpResponse.json(planet1);
      case '2':
        return HttpResponse.json(planet2);
      case '3':
        return HttpResponse.json(planet3);
      case 'sp1':
        return HttpResponse.json(planetSp1);
      default:
        return HttpResponse.json({
          message: 'ok',
          result: {
            uid: id,
            properties: {
              name: `Unknown Planet ${id}`,
              rotation_period: '0',
              orbital_period: '0',
              diameter: '0',
              climate: 'unknown',
              gravity: 'unknown',
              terrain: 'unknown',
              surface_water: '0',
              population: '0',
              url: `https://www.swapi.tech/api/planets/${id}`,
              created: new Date().toISOString(),
              edited: new Date().toISOString(),
            },
          },
        });
    }
  }),

  http.get('https://www.swapi.tech/api/films', () => HttpResponse.json(films)),
];
