import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { calculateLoanBalanceAsOfDate, type Loan } from './loan.service';
import { useDataContext } from '@/contexts/DataContext';
import DashboardCard from './DashboardCard';

interface UserLoanSummary {
  personId: string;
  personName: string;
  personPhone?: string;
  totalActiveLoans: number;
  totalPrincipalRemaining: number; // remaining principal amounts
  totalCurrentInterest: number; // current accrued interest not yet paid
  totalCurrentDue: number; // total amount owed as of today
  totalPaid: number; // total payments made
  activeLoans: Loan[];
}

const UserLoanDashboard: React.FC = () => {
  const { people, loans, peopleLoading, loansLoading, error } = useDataContext();
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Optimize loading state - only show loading when both are loading
  const loading = peopleLoading || loansLoading;

  // Memoize expensive calculations
  const userSummaries = useMemo<UserLoanSummary[]>(() => {
    if (loading) return [];

    const summaries: UserLoanSummary[] = [];

    people.forEach((person) => {
      const activeLoans = loans.filter(
        (loan) => loan.personId === person.id && loan.status === 'active'
      );

      if (activeLoans.length === 0) {
        // Include users with no active loans for completeness
        summaries.push({
          personId: person.id,
          personName: person.name,
          personPhone: person.phone,
          totalActiveLoans: 0,
          totalPrincipalRemaining: 0,
          totalCurrentInterest: 0,
          totalCurrentDue: 0,
          totalPaid: 0,
          activeLoans: [],
        });
        return;
      }

      let totalPrincipalRemaining = 0;
      let totalCurrentInterest = 0;
      let totalCurrentDue = 0;
      let totalPaid = 0;

      activeLoans.forEach((loan) => {
        // Calculate current loan details as of today
        const currentDetails = calculateLoanBalanceAsOfDate(loan, today);

        // Remaining principal = original amount - principal paid
        const principalRemaining = loan.amount - (loan.totalPrincipalPaid || 0);
        totalPrincipalRemaining += principalRemaining;

        // Current interest = accrued interest - interest already paid
        const currentInterest = currentDetails.interestAccrued - (loan.totalInterestPaid || 0);
        totalCurrentInterest += currentInterest;

        // Current balance due
        totalCurrentDue += currentDetails.balance;

        // Total paid from embedded payment history
        const loanTotalPaid =
          loan.paymentHistory
            ?.filter((entry) => entry.paymentAmount > 0)
            .reduce((sum, entry) => sum + entry.paymentAmount, 0) || 0;
        totalPaid += loanTotalPaid;
      });

      summaries.push({
        personId: person.id,
        personName: person.name,
        personPhone: person.phone,
        totalActiveLoans: activeLoans.length,
        totalPrincipalRemaining,
        totalCurrentInterest,
        totalCurrentDue,
        totalPaid,
        activeLoans,
      });
    });

    // Sort by total due amount (highest first)
    summaries.sort((a, b) => b.totalCurrentDue - a.totalCurrentDue);
    return summaries;
  }, [people, loans, today, loading]);

  // Filter summaries based on search query
  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return userSummaries;

    const query = searchQuery.toLowerCase().trim();
    return userSummaries.filter((summary) => {
      const nameMatch = summary.personName.toLowerCase().includes(query);
      const phoneMatch = summary.personPhone?.toLowerCase().includes(query) || false;
      return nameMatch || phoneMatch;
    });
  }, [userSummaries, searchQuery]);

  // Memoize currency formatter
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.round(amount * 100) / 100);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Error loading dashboard</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loan Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Manage loans and track payments</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Link
                to="/loans/add?from=dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Loan
              </Link>
              <Link
                to="/loans"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View All Loans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-900 mb-3">Search Users</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone number..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                Showing {filteredSummaries.length} of {userSummaries.length} users
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{people.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loans.filter((loan) => loan.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredSummaries.reduce((sum, user) => sum + user.totalCurrentDue, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Loan Summary</h2>
            <p className="mt-1 text-sm text-gray-600">
              Overview of all users with their loan details
            </p>
          </div>

          {filteredSummaries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search terms or clear the search to see all users.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="p-4 space-y-4">
                  {filteredSummaries.map((user) => (
                    <DashboardCard
                      key={user.personId}
                      user={user}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Loans
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Principal Remaining
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Due
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSummaries.map((user) => (
                      <tr key={user.personId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.personName}
                            </div>
                            {user.personPhone && (
                              <div className="text-sm text-gray-500">{user.personPhone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.totalActiveLoans}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(user.totalPrincipalRemaining)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(user.totalCurrentInterest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(user.totalCurrentDue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/users/${user.personId}/loans`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              View Details
                            </Link>
                            <Link
                              to={`/loans/add?personId=${user.personId}&from=dashboard`}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              New Loan
                            </Link>
                            {user.totalCurrentDue > 0 && (
                              <Link
                                to={`/users/${user.personId}/deposit`}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              >
                                Deposit
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLoanDashboard;
