import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { calculateLoanAge, calculateLoanBalanceAsOfDate, type Loan } from '../loan/loan.service';
import { type Person } from '../people/people.service';
import { useDataContext } from '@/contexts/DataContext';
import {
  Container,
  PageHeader,
  Button,
  Card,
  CardContent,
  StatsCard,
  Badge,
} from '@/components/UI';
import { ResponsiveLayout } from '@/components/UI/ResponsiveLayout';

const UserLoanDetailsPage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { people, loans } = useDataContext();

  const [person, setPerson] = useState<Person | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);

  useEffect(() => {
    if (!personId) return;

    const foundPerson = people.find((p) => p.id === personId);
    setPerson(foundPerson || null);

    const filteredLoans = loans.filter((loan) => loan.personId === personId);
    setUserLoans(filteredLoans);
  }, [personId, people, loans]);

  // Memoize expensive calculations
  const loanSummaries = useMemo(() => {
    if (userLoans.length === 0) return [];

    return userLoans.map((loan) => {
      const today = new Date().toISOString().split('T')[0];
      const currentDetails = calculateLoanBalanceAsOfDate(loan, today);
      const payments = (loan.paymentHistory || []).filter((entry) => entry.paymentAmount > 0);

      return {
        loan,
        currentDetails,
        payments,
        age: calculateLoanAge(loan),
      };
    });
  }, [userLoans]);

  const getLoanPayments = (loanId: string) => {
    const loanSummary = loanSummaries.find((summary) => summary.loan.id === loanId);
    return loanSummary ? loanSummary.payments : [];
  };

  const today = new Date().toISOString().split('T')[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.round(amount * 100) / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!person) {
    return <div className="text-center py-8 text-red-600">Person not found</div>;
  }

  const activeLoans = userLoans?.filter((loan) => loan.status === 'active');

  // Calculate current balances as of today for all active loans
  const loanDetails = activeLoans.map((loan) => ({
    loan,
    details: calculateLoanBalanceAsOfDate(loan, today),
  }));

  const totalPrincipal = loanDetails.reduce(
    (sum, { loan }) => sum + (loan.amount - (loan.totalPrincipalPaid || 0)),
    0
  );
  const totalCurrentInterest = loanDetails.reduce(
    (sum, { loan, details }) => sum + (details.interestAccrued - (loan.totalInterestPaid || 0)),
    0
  );
  const totalOutstanding = loanDetails.reduce((sum, { details }) => sum + details.balance, 0);

  return (
    <ResponsiveLayout>
      <Container>
        <PageHeader
          title={`Loan Details - ${person.name}`}
          backButton={
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
          }
          actions={
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Link to={`/loans/add?personId=${personId}`}>
                <Button variant="success" size="sm" fullWidth className="sm:w-auto">
                  + New Loan
                </Button>
              </Link>
              {totalOutstanding > 0 && (
                <Link to={`/users/${personId}/deposit`}>
                  <Button variant="primary" size="sm" fullWidth className="sm:w-auto">
                    Make Deposit
                  </Button>
                </Link>
              )}
            </div>
          }
        />

        <div className="py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatsCard title="Active Loans" value={activeLoans.length} color="blue" />
            <StatsCard
              title="Total Principal"
              value={formatCurrency(totalPrincipal)}
              color="green"
            />
            <StatsCard
              title="Current Interest"
              value={formatCurrency(totalCurrentInterest)}
              color="yellow"
            />
            <StatsCard
              title="Total Outstanding"
              value={formatCurrency(totalOutstanding)}
              color="red"
            />
          </div>

          {/* Loans Detailed Cards */}
          <div className="space-y-6 mb-6">
            {userLoans.map((loan) => {
              const loanPayments = getLoanPayments(loan.id);
              const totalPaid = loanPayments.reduce((sum, p) => sum + p.paymentAmount, 0);
              const currentDetails = calculateLoanBalanceAsOfDate(loan, today);
              const currentInterest =
                currentDetails.interestAccrued - (loan.totalInterestPaid || 0);
              const balance = currentDetails.balance;
              const paymentHistory = (loan.paymentHistory || []).filter(
                (entry) => entry.paymentAmount > 0
              );
              const isExpanded = expandedLoan === loan.id;

              return (
                <Card key={loan.id}>
                  {/* Loan Summary Header */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0 mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Loan #{loan.id.slice(-6)}
                          </h3>
                          <Badge
                            variant={
                              loan.status === 'paid'
                                ? 'success'
                                : loan.status === 'overdue'
                                  ? 'danger'
                                  : 'info'
                            }
                          >
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Principal:</span>
                            <div className="font-medium text-gray-900">
                              {formatCurrency(loan.amount)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Interest:</span>
                            <div className="font-medium text-gray-900">
                              {loan.interestRate}%{' '}
                              {loan.interestType === 'per_month' ? '/month' : '/year'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Start:</span>
                            <div className="font-medium text-gray-900">
                              {formatDate(loan.startDate)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Due:</span>
                            <div className="font-medium text-gray-900">
                              {formatDate(loan.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                        className="w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  {/* Current Balance and Summary */}
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-600 text-xs sm:text-sm font-medium">
                          Current Balance
                        </div>
                        <div
                          className={`text-lg sm:text-xl font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}
                        >
                          {formatCurrency(balance)}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-yellow-600 text-xs sm:text-sm font-medium">
                          Current Interest
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-yellow-700">
                          {formatCurrency(currentInterest)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-600 text-xs sm:text-sm font-medium">
                          Total Paid
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-green-700">
                          {formatCurrency(totalPaid)}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-blue-600 text-xs sm:text-sm font-medium">Loan Age</div>
                        <div className="text-lg sm:text-xl font-bold text-blue-700">
                          {calculateLoanAge(loan)} days
                        </div>
                      </div>
                    </div>

                    {loan.description && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {loan.description}
                      </div>
                    )}
                  </CardContent>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t">
                      {/* Detailed Calculations */}
                      <div className="px-6 py-4 bg-gray-50">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">
                          Detailed Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Principal Remaining:</div>
                            <div className="font-medium">
                              {formatCurrency(loan.amount - (loan.totalPrincipalPaid || 0))}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Interest Accrued:</div>
                            <div className="font-medium">
                              {formatCurrency(currentDetails.interestAccrued)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Interest Paid:</div>
                            <div className="font-medium">
                              {formatCurrency(loan.totalInterestPaid || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Principal Paid:</div>
                            <div className="font-medium">
                              {formatCurrency(loan.totalPrincipalPaid || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total Payments:</div>
                            <div className="font-medium">{loanPayments.length} payments</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Last Payment:</div>
                            <div className="font-medium">
                              {loan.lastPaymentDate ? formatDate(loan.lastPaymentDate) : 'Never'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment History */}
                      {paymentHistory.length > 0 && (
                        <div className="px-6 py-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-3">
                            Payment History
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Balance Before
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Interest
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    New Balance
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Days
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {paymentHistory.map((entry, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {formatDate(entry.depositDate)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {formatCurrency(entry.balanceBefore)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-yellow-600">
                                      {formatCurrency(entry.interestForPeriod)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                                      {formatCurrency(entry.paymentAmount)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                      <span
                                        className={
                                          entry.newBalance > 0 ? 'text-red-600' : 'text-green-600'
                                        }
                                      >
                                        {formatCurrency(entry.newBalance)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {entry.daysSinceLast}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {entry.description || entry.notes || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {paymentHistory.length === 0 && (
                        <div className="px-6 py-4 text-center text-gray-500">
                          No payments made on this loan yet.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}

            {userLoans.length === 0 && (
              <div className="text-center py-8 text-gray-500">No loans found for this user.</div>
            )}
          </div>

          {/* Overall Payment Summary */}
          {userLoans.some((loan) =>
            (loan.paymentHistory || []).some((entry) => entry.paymentAmount > 0)
          ) && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">All Payments Summary</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Chronological list of all payments across all loans
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance After
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userLoans
                      .flatMap((loan) =>
                        (loan.paymentHistory || [])
                          .filter((entry) => entry.paymentAmount > 0)
                          .map((entry) => ({
                            ...entry,
                            loanId: loan.id,
                            loanAmount: loan.amount,
                            loanRate: loan.interestRate,
                          }))
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime()
                      )
                      .map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.depositDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Loan #{payment.loanId.slice(-6)} - {formatCurrency(payment.loanAmount)}{' '}
                            @ {payment.loanRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(payment.paymentAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {formatCurrency(payment.newBalance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.description || payment.notes || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Container>
    </ResponsiveLayout>
  );
};

export default UserLoanDetailsPage;
