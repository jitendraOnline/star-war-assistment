import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaginatedTable } from './DataTable';
import type { PaginatedResponse } from '@/types/character.type';

interface TestUser {
  id: string;
  name: string;
  email: string;
}

interface TestColumn {
  header: string;
  key: string;
  render?: (item: TestUser) => React.ReactNode;
}

const mockUsers: TestUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com' },
];

const mockColumns: TestColumn[] = [
  {
    header: 'Name',
    key: 'name',
    render: (user: TestUser) => <span data-testid={`user-name-${user.id}`}>{user.name}</span>,
  },
  {
    header: 'Email',
    key: 'email',
  },
];

const createMockData = (
  results: TestUser[],
  total_records: number = results.length,
  hasNext: boolean = false,
  hasPrevious: boolean = false
): PaginatedResponse<TestUser> => ({
  message: 'Success',
  total_records,
  total_pages: Math.ceil(total_records / 2),
  previous: hasPrevious ? 'prev-url' : null,
  next: hasNext ? 'next-url' : null,
  results,
});

const defaultProps = {
  data: createMockData(mockUsers),
  pageLimit: 2,
  columns: mockColumns,
  getRowKey: (user: TestUser) => user.id,
};

describe('PaginatedTable', () => {
  describe('Rendering', () => {
    it('renders table with correct headers', () => {
      render(<PaginatedTable {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders data rows with custom render functions', () => {
      render(<PaginatedTable {...defaultProps} />);

      expect(screen.getByTestId('user-name-1')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-name-2')).toHaveTextContent('Jane Smith');
    });

    it('renders data rows with fallback rendering', () => {
      const columnsWithoutRender = [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
      ];

      render(<PaginatedTable {...defaultProps} columns={columnsWithoutRender} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('applies custom height style', () => {
      const { container } = render(<PaginatedTable {...defaultProps} height="300px" />);

      const tableContainer = container.firstChild as HTMLElement;
      expect(tableContainer).toHaveStyle({ height: '300px' });
    });
  });

  describe('Loading State', () => {
    it('renders loading state with default message', () => {
      render(<PaginatedTable {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders loading state with custom message', () => {
      render(
        <PaginatedTable {...defaultProps} isLoading={true} loadingMessage="Fetching data..." />
      );

      expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    });

    it('does not render data when loading', () => {
      render(<PaginatedTable {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId('user-name-1')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error state with retry button', () => {
      const mockRetry = vi.fn();
      render(<PaginatedTable {...defaultProps} isError={true} onRetry={mockRetry} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls retry function when retry button is clicked', () => {
      const mockRetry = vi.fn();
      render(<PaginatedTable {...defaultProps} isError={true} onRetry={mockRetry} />);

      fireEvent.click(screen.getByText('Try Again'));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('renders error state without retry button when onRetry is not provided', () => {
      render(<PaginatedTable {...defaultProps} isError={true} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state with default message', () => {
      const emptyData = createMockData([]);
      render(<PaginatedTable {...defaultProps} data={emptyData} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders empty state with custom message', () => {
      const emptyData = createMockData([]);
      render(<PaginatedTable {...defaultProps} data={emptyData} emptyText="No users found" />);

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  describe('Client-side Pagination', () => {
    it('paginates data correctly for client-side pagination', () => {
      const mockOnPageChange = vi.fn();
      render(
        <PaginatedTable {...defaultProps} currentPage={1} onPageNumberChange={mockOnPageChange} />
      );

      // Should show first 2 users on page 1
      expect(screen.getByTestId('user-name-1')).toBeInTheDocument();
      expect(screen.getByTestId('user-name-2')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('shows correct pagination info for client-side pagination', () => {
      render(<PaginatedTable {...defaultProps} currentPage={1} />);

      expect(screen.getByText('Showing 1-2 of 5')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('handles next page click for client-side pagination', () => {
      const mockOnPageChange = vi.fn();
      render(
        <PaginatedTable {...defaultProps} currentPage={1} onPageNumberChange={mockOnPageChange} />
      );

      fireEvent.click(screen.getByText('Next'));
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('handles previous page click for client-side pagination', () => {
      const mockOnPageChange = vi.fn();
      render(
        <PaginatedTable {...defaultProps} currentPage={2} onPageNumberChange={mockOnPageChange} />
      );

      fireEvent.click(screen.getByText('Previous'));
      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('disables previous button on first page', () => {
      render(<PaginatedTable {...defaultProps} currentPage={1} />);

      expect(screen.getByText('Previous')).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(<PaginatedTable {...defaultProps} currentPage={3} />);

      expect(screen.getByText('Next')).toBeDisabled();
    });
  });

  describe('Server-side Pagination', () => {
    it('identifies server-side pagination correctly', () => {
      const serverData = createMockData(mockUsers.slice(0, 2), 10, true, false);

      render(<PaginatedTable {...defaultProps} data={serverData} currentPage={1} />);

      expect(screen.getByText('Showing 1-2 of 10')).toBeInTheDocument();
    });

    it('handles server-side next page click', () => {
      const mockOnPageNumberChange = vi.fn();
      const serverData = createMockData(mockUsers.slice(0, 2), 10, true, false);

      render(
        <PaginatedTable
          {...defaultProps}
          data={serverData}
          currentPage={1}
          onPageNumberChange={mockOnPageNumberChange}
        />
      );

      fireEvent.click(screen.getByText('Next'));
      expect(mockOnPageNumberChange).toHaveBeenCalledWith(2);
    });

    it('handles server-side previous page click', () => {
      const mockOnPageNumberChange = vi.fn();
      const serverData = createMockData(mockUsers.slice(2, 4), 10, true, true);

      render(
        <PaginatedTable
          {...defaultProps}
          data={serverData}
          currentPage={2}
          onPageNumberChange={mockOnPageNumberChange}
        />
      );

      fireEvent.click(screen.getByText('Previous'));
      expect(mockOnPageNumberChange).toHaveBeenCalledWith(1);
    });

    it('disables navigation buttons based on server data', () => {
      const serverData = createMockData(mockUsers.slice(0, 2), 10, false, false);

      render(<PaginatedTable {...defaultProps} data={serverData} currentPage={1} />);

      expect(screen.getByText('Next')).toBeDisabled();
      expect(screen.getByText('Previous')).toBeDisabled();
    });
  });

  describe('Pagination Footer', () => {
    it('hides pagination when loading', () => {
      render(<PaginatedTable {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('hides pagination when error', () => {
      render(<PaginatedTable {...defaultProps} isError={true} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('hides pagination when no data and not server paginated', () => {
      const emptyData = createMockData([]);
      render(<PaginatedTable {...defaultProps} data={emptyData} />);

      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });
});
