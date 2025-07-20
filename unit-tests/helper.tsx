import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { queryClient } from '../src/queryClient';

export const renderWithClientProdider = (ui: React.ReactElement, withRouter: boolean = true) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {withRouter ? <MemoryRouter>{ui}</MemoryRouter> : ui}
    </QueryClientProvider>
  );
};

export async function waitForLoadingToFinish() {
  const loadingText = await screen.findByText(/loading/i);
  expect(loadingText).toBeInTheDocument();
  await waitForElementToBeRemoved(loadingText);
}
