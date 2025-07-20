# Allica Bank - Assignement

This is a React 19 app created using Vite. It uses Tailwind CSS for styling, TypeScript, and TanStack Query for data fetching.

## Getting Started

### WIKI

- requirements
- implemetation plan

### Prerequisites

- Node.js **v24** (or at least v20+ recommended)
- npm **v9+**

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

- MSW (Mock Service Worker) is used for mocking API calls in tests.
- Tailwind CSS is configured via the official Vite plugin.
- Project structure is feature-based, and kept intentionally simple.
- Cypress is used for e2e

---
