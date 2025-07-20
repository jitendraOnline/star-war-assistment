import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mockserver';
import { queryClient } from '../src/queryClient';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
  localStorage.clear();
  cleanup();
});
afterAll(() => server.close());
