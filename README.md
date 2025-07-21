# Allica Bank - Assignement

This is a React 19 app created using Vite. It uses Tailwind CSS for styling, TypeScript, and TanStack Query for data fetching.

## Getting Started

### WIKI

- requirements
- implemetation plan

### Prerequisites

- Node.js **v23** (or at least v20+ recommended)
- npm **v9+**

### Recommanded
- use prettier plugin for vs code.
- use eslint plugin for vs code.

### Installation

```bash
git clone https://github.com/jitendraOnline/allica-bank.git
cd allica-bank
npm install
```

### Start the app

```bash
npm run dev
```

## Running Tests

We used Vitest and React Testing Library for testing.

To run unit tests:

```bash
npm run test
```

run unit test with coverage:

```bash
npm run test:coverage
```

run test on Vitest UI to view on brouser and line coverage:

```bash
npm run test:ui
```

## Other Scripts

```bash
npm run lint
npm run format
npm run build
npm run preview
npm run e2e:run
npm run e2e:open
```

---

## Notes
- The Api's are chached using tanStack Query due rate limit and to many network call.
- Global State management is intentionally skipped due to size of applition and for simplicity.
- MSW (Mock Service Worker) is used for mocking API calls in tests.
- Tailwind CSS is configured via the official Vite plugin.
- Project structure is kept intentionally simple.
- Cypress is used for e2e

## Future Socpe
- We can do more on css part but its good for now.
- We can enancehe the character deatils page its page as of now just to demontration.
- Unit test cases can we added to hooks and Other componet but i skipped them for simiplicty and time constraints.

## Observation
- the api resposne of character api is not consistant for limt, page, and name saerch.
- it would have been better we are using grpahql it would have enanched the network optimiztin.

---
