import {
  render,
  renderHook,
  screen,
  waitForElementToBeRemoved,
  type RenderHookOptions,
  type RenderHookResult,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

export const renderWithClientProdider = (ui: React.ReactElement, withRouter: boolean = true) => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      {withRouter ? <MemoryRouter>{ui}</MemoryRouter> : ui}
    </QueryClientProvider>
  );
};

export const renderhookWithClientQuery = <T, R = unknown>(
  hook: (args: T) => R,
  options?: RenderHookOptions<T>
): RenderHookResult<R, T> => {
  const query = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return renderHook(hook, {
    wrapper: ({ children }) => {
      return <QueryClientProvider client={query}>{children}</QueryClientProvider>;
    },
    ...options,
  });
};

export async function waitForLoadingToFinish(loadingMessage = 'loading') {
  const loadingText = await screen.findByText(new RegExp(loadingMessage, 'i'));
  expect(loadingText).toBeInTheDocument();
  await waitForElementToBeRemoved(() => screen.queryByText(new RegExp(loadingMessage, 'i')));
}

export async function renderWithUrlAndClientProvider(ui: React.ReactElement, url: string) {
  return renderWithClientProdider(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);
}
