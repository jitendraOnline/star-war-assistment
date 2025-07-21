describe('Character Details Feature', () => {
  const interceptCharacterList = () => {
    cy.intercept('GET', 'https://www.swapi.tech/api/people?expanded=true&page=1&limit=10', {
      fixture: 'characterList.json',
    }).as('getCharacterList');
  };

  const interceptPlanetDetails = () => {
    cy.intercept('GET', '**/api/planets/*', {
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
      cy.wait('@getCharacterList');
      cy.wait('@planetSearch');
    });

    it('should load and display characters with planet info', () => {
      cy.get('table').should('exist');
      cy.get('td').contains('Luke Skywalker').should('exist');
      cy.get('td').contains('Leia Organa').should('exist');
      cy.get('td').contains('Earth').should('exist');
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

      cy.get('td').contains('Yoda').should('exist');
      cy.get('td').contains('male').should('exist');
      cy.get('td').contains('Earth').should('exist');
    });
  });

  describe('Character Details Page', () => {
    beforeEach(() => {
      interceptCharacterList();
      interceptCharacterDetails();
      cy.visit('/');
      cy.wait('@getCharacterList');
      cy.get('td').contains('Luke Skywalker').click();
      cy.wait('@characterDetails');
    });

    it('should display character details correctly', () => {
      cy.url().should('include', '/characters/1');
      cy.get('h1').contains('Luke Skywalker').should('exist');
      cy.get('p').contains('Home Planet: Tatooine').should('exist');
      cy.get('p').contains('Eye Color: blue').should('exist');
    });

    it('should display character films', () => {
      cy.get('h1').contains('Luke Skywalker').should('exist');
      cy.contains('li', 'A New Hope (1977-05-25)').should('exist');
      cy.contains('li', 'The Empire Strikes Back (1980-05-17)').should('exist');
    });

    it('should navigate back to character list', () => {
      cy.get('button').contains('← Back to Character List').click();
      cy.url().should('not.include', '/characters/1');
      cy.get('td').contains('Luke Skywalker').should('exist');
    });

    it('should add character to favourites and show it on list', () => {
      // Toggle favourite
      cy.get('[data-testid="favourite-toggle"]').should('exist').click();

      // Go back to list
      cy.get('button').contains('← Back to Character List').click();

      cy.contains('label', 'Show Favourites Only')
        .find('input[type="checkbox"]')
        .should('exist')
        .check({ force: true });

      // Confirm character is shown as favourite
      cy.get('td').contains('Luke Skywalker').should('exist');
    });
  });
});
