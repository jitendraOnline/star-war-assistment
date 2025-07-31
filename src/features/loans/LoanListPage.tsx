import React, { useState } from 'react';
import { deleteLoan, calculateTotalAmount, isLoanOverdue } from '@/service/loan.service';
import type { Loan } from '@/types/loan.type';
import { useNavigate, Link } from 'react-router-dom';
import { useDataContext } from '@/contexts/DataContext';

const LoanListPage: React.FC = () => {
  const { loans, people } = useDataContext();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteLoan = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan(id);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    return person?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (loan: Loan) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    let status = loan.status;

    if (isLoanOverdue(loan)) {
      status = 'overdue';
      bgColor = 'bg-red-100 text-red-800';
    } else {
      switch (loan.status) {
        case 'active':
          bgColor = 'bg-blue-100 text-blue-800';
          break;
        case 'paid':
          bgColor = 'bg-green-100 text-green-800';
          break;
        case 'overdue':
          bgColor = 'bg-red-100 text-red-800';
          break;
        case 'defaulted':
          bgColor = 'bg-gray-100 text-gray-800';
          break;
      }
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bgColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
        <button
          onClick={() => navigate('/loans/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Loan
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No loans found.</p>
          <button
            onClick={() => navigate('/loans/add')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Create your first loan
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {loans.map((loan) => (
              <li key={loan.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {getPersonName(loan.personId)}
                        </h3>
                        <div className="ml-2">{getStatusBadge(loan)}</div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                          <div>
                            <span className="font-medium">Principal:</span>{' '}
                            {formatCurrency(loan.amount)}
                          </div>
                          <div>
                            <span className="font-medium">Total Amount:</span>{' '}
                            {formatCurrency(calculateTotalAmount(loan))}
                          </div>
                          <div>
                            <span className="font-medium">Interest Rate:</span> {loan.interestRate}%
                          </div>
                          <div>
                            <span className="font-medium">Due Date:</span>{' '}
                            {formatDate(loan.dueDate)}
                          </div>
                        </div>
                      </div>
                      {loan.description && (
                        <p className="mt-2 text-sm text-gray-600">{loan.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/loans/edit/${loan.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/loans/${loan.id}/payments`}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Payments
                      </Link>
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoanListPage;
