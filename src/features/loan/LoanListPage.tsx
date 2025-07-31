import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteLoan } from './loan.service';
import { useDataContext } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';
import { Container, PageHeader, Button } from '@/components/UI';
import { ResponsiveLayout } from '@/components/UI/ResponsiveLayout';
import { MobileLoanList } from '@/components/UI/MobileLoanList';

const LoanListPage: React.FC = () => {
  const { loans, people, peopleLoading, loansLoading, error } = useDataContext();
  const { userId } = useUser();
  const navigate = useNavigate();

  const loading = peopleLoading || loansLoading;

  const handleAddLoanClick = () => {
    navigate('/loans/add');
  };

  const handleDeleteLoan = async (id: string) => {
    if (!userId) return;

    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan(userId, id);
      } catch (err) {
        console.error('Failed to delete loan:', err);
      }
    }
  };

  const handleViewLoan = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (loan?.personId) {
      navigate(`/users/${loan.personId}/loans`);
    }
  };

  return (
    <ResponsiveLayout>
      <Container>
        <PageHeader
          title="Loans"
          actions={
            <Button variant="primary" onClick={handleAddLoanClick}>
              Add Loan
            </Button>
          }
        />

        <div className="py-4">
          {error && (
            <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading loans...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">No loans found</p>
              <p className="mt-1">Get started by creating your first loan</p>
              <Button variant="primary" onClick={handleAddLoanClick} className="mt-4">
                Create your first loan
              </Button>
            </div>
          ) : (
            <MobileLoanList
              loans={loans}
              people={people}
              onDelete={handleDeleteLoan}
              onView={handleViewLoan}
            />
          )}
        </div>
      </Container>
    </ResponsiveLayout>
  );
};

export default LoanListPage;
