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
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h1 className="text-3xl font-bold text-gray-900">Loan Dashboard</h1>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/loans/add"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            + New Loan
          </Link>
          <Link
            to="/loans"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            View All Loans
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name or Phone
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or phone number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredSummaries.length} of {userSummaries.length} users
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-blue-900 font-medium">Total Users</h3>
          <p className="text-2xl font-bold text-blue-700">{people.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-green-900 font-medium">Active Loans</h3>
          <p className="text-2xl font-bold text-green-700">
            {userSummaries.reduce((sum, user) => sum + user.totalActiveLoans, 0)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-yellow-900 font-medium">Total Principal</h3>
          <p className="text-xl font-bold text-yellow-700">
            {formatCurrency(
              userSummaries.reduce((sum, user) => sum + user.totalPrincipalRemaining, 0)
            )}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-red-900 font-medium">Total Due</h3>
          <p className="text-xl font-bold text-red-700">
            {formatCurrency(userSummaries.reduce((sum, user) => sum + user.totalCurrentDue, 0))}
          </p>
        </div>
      </div>

      {/* User Summary - Responsive Layout */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">User Loan Summary</h2>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredSummaries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredSummaries.map((user) => (
                <DashboardCard key={user.personId} user={user} formatCurrency={formatCurrency} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Loans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Loan Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
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
                      <div className="text-sm font-medium text-gray-900">{user.personName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.totalActiveLoans} loan{user.totalActiveLoans !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(user.totalPrincipalRemaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(user.totalCurrentInterest)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(user.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={user.totalCurrentDue > 0 ? 'text-red-600' : 'text-green-600'}
                      >
                        {formatCurrency(user.totalCurrentDue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/users/${user.personId}/loans`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/loans/add?personId=${user.personId}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Loan More
                        </Link>
                        {user.totalCurrentDue > 0 && (
                          <Link
                            to={`/users/${user.personId}/deposit`}
                            className="text-indigo-600 hover:text-indigo-900"
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

          {filteredSummaries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLoanDashboard;
