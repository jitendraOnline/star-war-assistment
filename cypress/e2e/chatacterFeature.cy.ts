describe('Character Details Feature', () => {
  const interceptCharacterList = () => {
    cy.intercept('GET', 'https://www.swapi.tech/api/people?expanded=true&page=1&limit=10', {
      fixture: 'characterList.json',
    }).as('getCharacterList');
  };

  const interceptPlanetDetails = () => {
    cy.intercept('GET', '**/api/planets*', {
      fixture: 'planetDetails.json',
    }).as('planetSearch');
  };

  const interceptCharacterDetails = () => {
    cy.intercept('GET', '**/api/people/1', {
      fixture: 'character1.json',
    }).as('characterDetails');
  };

  const interceptFilmList = () => {
    cy.intercept('GET', 'https://www.swapi.tech/api/films', {
      fixture: 'films.json',
    }).as('filmsList');
  };
  console.log(interceptFilmList);

  describe('Character List Page', () => {
    beforeEach(() => {
      interceptCharacterList();
      interceptPlanetDetails();
      cy.visit('/');
    });

    it('should load and display characters with planet info', () => {
      cy.get('table').should('exist');
      cy.contains('Loading...').should('exist');
      cy.wait('@getCharacterList');
      cy.get('body').should('not.contain', 'Loading...');
      cy.wait('@planetSearch');
      cy.get('td').contains('Luke Skywalker').should('exist');
      cy.get('td').contains('Leia Organa').should('exist');
      cy.get('td').contains('Tatooine').should('exist');
    });

    it('should search character and display correct result', () => {
      cy.intercept(
        'GET',
        'https://www.swapi.tech/api/people?expanded=true&page=1&limit=10&name=Yoda',
        { fixture: 'characterListSearch.json' }
      ).as('characterListSearch');

      cy.get('input[placeholder="Search by character name"]')
        .should('exist')
        .type('Yoda')
        .should('have.value', 'Yoda');
      cy.wait('@characterListSearch');
      cy.wait('@planetSearch');
      cy.contains('Loading...').should('not.exist');
      cy.get('td').contains('Yoda').should('exist');
      cy.get('td').contains('male').should('exist');
      cy.get('td').contains('-').should('exist');
    });
  });

  describe('Character List', () => {
    it('shows error UI on character list API failure and recovers on retry', () => {
      cy.intercept('GET', '**/api/people*', {
        statusCode: 500,
        body: { message: 'Internal Server Error' },
      }).as('getCharacterListFail');

      cy.visit('/');
      cy.wait('@getCharacterListFail');
      cy.wait('@getCharacterListFail');
      cy.wait('@getCharacterListFail');
      cy.wait('@getCharacterListFail');
      cy.contains('Loading...', { timeout: 10000 }).should('not.exist');

      cy.contains('Something went wrong').should('exist');
      cy.contains('button', 'Try Again').should('exist');

      cy.intercept('GET', '**/api/people*', {
        fixture: 'characterList.json',
      }).as('getCharacterListSuccess');

      cy.contains('Try Again').click();
      cy.wait('@getCharacterListSuccess');

      cy.get('td').contains('Luke Skywalker').should('exist');
    });
  });

  describe('Character Details Page', () => {
    beforeEach(() => {
      interceptCharacterList();
      interceptCharacterDetails();
      interceptPlanetDetails();
      cy.visit('/');
      cy.wait('@getCharacterList');
      cy.get('td').contains('Luke Skywalker').click();
      cy.wait('@characterDetails');
    });

    it('should display character details correctly', () => {
      cy.url().should('include', '/characters/1');
      cy.get('h1').contains('Luke Skywalker').should('exist');
      cy.get('div').contains('Eye Colorblue').should('exist');
      cy.contains('div', 'Loading').should('exist');
      cy.wait('@planetSearch');
      cy.get('div').contains('Home PlanetTatooine').should('exist');
    });

    it('should display character films', () => {
      cy.get('h1').contains('Luke Skywalker').should('exist');
      cy.contains('td', 'A New Hope').should('exist');
      cy.contains('td', 'The Empire Strikes Back').should('exist');
    });

    it('should navigate back to character list', () => {
      cy.get('button').contains('← Back to Character List').click();
      cy.url().should('not.include', '/characters/1');
      cy.get('td').contains('Luke Skywalker').should('exist');
    });

    it('should add character to favourites and show it on list', () => {
      cy.get('[data-testid="favourite-toggle"]').should('exist').click();
      cy.get('button').contains('← Back to Character List').click();
      cy.contains('label', 'Show Favourites Only')
        .find('input[type="checkbox"]')
        .should('exist')
        .check({ force: true });
      cy.get('td').contains('Luke Skywalker').should('exist');
    });
  });
});
