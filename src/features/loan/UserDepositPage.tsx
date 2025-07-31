import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  addLoanPayment,
  calculateLoanBalanceAsOfDate,
  getCurrentLoanStatus,
  getLoanPaymentHistoryTable,
  type Loan,
} from '../loan/loan.service';
import { type Person } from '../people/people.service';
import { useDataContext } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';

const UserDepositPage: React.FC = () => {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const { people, loans } = useDataContext();
  const { userId } = useUser();

  const [person, setPerson] = useState<Person | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [depositDescription, setDepositDescription] = useState('');
  const [allocations, setAllocations] = useState<{ [loanId: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState<{ [loanId: string]: boolean }>({});

  useEffect(() => {
    if (!personId) return;

    const foundPerson = people.find((p) => p.id === personId);
    setPerson(foundPerson || null);

    const filteredLoans = loans.filter((loan) => loan.personId === personId);
    setUserLoans(filteredLoans);
  }, [personId, people, loans]);

  // Calculate loan details as of deposit date for accurate tracking
  const getLoanDetailsAsOfDate = (loan: Loan) => {
    return calculateLoanBalanceAsOfDate(loan, depositDate);
  };

  const calculateTotalOutstanding = () => {
    return userLoans
      .filter((loan) => loan.status === 'active') // Only active loans for outstanding total
      .reduce((sum, loan) => {
        const details = calculateLoanBalanceAsOfDate(loan, depositDate);
        return sum + Math.max(0, details.balance); // Don't count overpaid loans
      }, 0);
  };

  const handleAutoAllocate = () => {
    const amount = Number(depositAmount) || 0;
    if (amount <= 0) return;

    const newAllocations: { [loanId: string]: number } = {};
    let remainingAmount = amount;

    // Sort loans by due date (oldest first) for prioritized allocation
    const sortedLoans = [...userLoans].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    for (const loan of sortedLoans) {
      if (remainingAmount <= 0) break;

      const details = getLoanDetailsAsOfDate(loan);
      const balance = details.balance;
      const allocation = Math.min(remainingAmount, balance);

      if (allocation > 0) {
        newAllocations[loan.id] = allocation;
        remainingAmount -= allocation;
      }
    }

    setAllocations(newAllocations);
  };

  const handleManualAllocation = (loanId: string, amount: string) => {
    const numAmount = Number(amount) || 0;
    setAllocations((prev) => ({
      ...prev,
      [loanId]: numAmount,
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  };

  // Function to calculate preview of new payment entry
  const getPreviewPaymentEntry = (loan: Loan) => {
    const allocation = allocations[loan.id] || 0;
    if (allocation <= 0) return null;

    const details = getLoanDetailsAsOfDate(loan);
    const newBalance = Math.max(0, details.balance - allocation);

    // Calculate days from last payment to deposit date
    const lastPaymentDate = loan.lastPaymentDate || loan.startDate;
    const daysSinceLastPayment = Math.ceil(
      (new Date(depositDate).getTime() - new Date(lastPaymentDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Calculate how the allocation would be split between interest and principal
    const outstandingInterest = details.interestAccrued - (loan.totalInterestPaid || 0);
    const interestPayment = Math.min(allocation, outstandingInterest);
    const principalPayment = allocation - interestPayment;

    return {
      date: depositDate,
      daysSinceLast: Math.max(0, daysSinceLastPayment), // Days from last payment to deposit date
      balanceBefore: details.balance, // Current outstanding balance (principal remaining + accrued interest)
      interest: outstandingInterest, // Outstanding interest only
      totalDue: details.balance, // Total amount due
      payment: allocation,
      interestPayment: interestPayment,
      principalPayment: principalPayment,
      newBalance: newBalance,
      cumulativeInterest: details.interestAccrued,
      notes: depositDescription.trim() || 'Deposit payment',
      isPreview: true,
    };
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(depositAmount);
    const totalAllocated = getTotalAllocated();

    if (amount <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (!depositDate) {
      setError('Please select a deposit date');
      return;
    }

    const selectedDate = new Date(depositDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      setError('Deposit date cannot be in the future');
      return;
    }

    if (totalAllocated > amount) {
      setError('Total allocated amount cannot exceed deposit amount');
      return;
    }

    if (totalAllocated === 0) {
      setError('Please allocate the deposit amount to at least one loan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payments for each allocation
      for (const [loanId, allocatedAmount] of Object.entries(allocations)) {
        if (allocatedAmount > 0 && userId) {
          await addLoanPayment(userId, {
            loanId,
            amount: allocatedAmount,
            paymentDate: new Date(depositDate).toISOString(),
            description: depositDescription.trim() || 'Deposit payment',
          });
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.round(amount * 100) / 100);
  };

  if (!person) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalOutstanding = calculateTotalOutstanding();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          type="button"
          className="mr-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold">Deposit for {person.name}</h1>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-900 mb-2">Outstanding Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-800">Active Loans: </span>
            <span className="font-medium">{userLoans.length}</span>
          </div>
          <div>
            <span className="text-blue-800">Total Outstanding: </span>
            <span className="font-medium">{formatCurrency(totalOutstanding)}</span>
          </div>
          <div>
            <span className="text-blue-800">Person Balance: </span>
            <span className="font-medium">{formatCurrency(person.balance)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deposit Amount */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Deposit Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Deposit Amount *</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter deposit amount"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Deposit Date *</label>
              <input
                type="date"
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Description</label>
              <input
                type="text"
                value={depositDescription}
                onChange={(e) => setDepositDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleAutoAllocate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              disabled={!depositAmount || Number(depositAmount) <= 0}
            >
              Auto-Allocate (Oldest First)
            </button>
          </div>
        </div>

        {/* Loan Allocation with Payment History */}
        {userLoans.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Allocate to Loans</h3>

            <div className="space-y-6">
              {userLoans.map((loan) => {
                const details = getLoanDetailsAsOfDate(loan);
                const status = getCurrentLoanStatus(loan);
                const balance = details.balance;
                const paymentHistory = getLoanPaymentHistoryTable(loan);

                return (
                  <div key={loan.id} className="border rounded-lg overflow-hidden">
                    {/* Loan Summary */}
                    <div className="bg-gray-50 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-xl text-blue-900 mb-2">
                            {formatCurrency(balance)} (Balance Due as of{' '}
                            {new Date(depositDate).toLocaleDateString('en-IN')})
                          </div>
                          <div className="text-sm text-gray-700 mb-1">
                            Principal Remaining + Interest Accrued
                          </div>
                          <div className="font-medium text-lg">
                            Principal: {formatCurrency(loan.amount)} | Rate: {loan.interestRate}%{' '}
                            {loan.interestType === 'per_month' ? '/month' : '/year'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div>
                              Original Loan: {formatCurrency(loan.amount)} | Principal Paid:{' '}
                              {formatCurrency(loan.totalPrincipalPaid || 0)} | Principal Remaining:{' '}
                              {formatCurrency(loan.amount - (loan.totalPrincipalPaid || 0))}
                            </div>
                            <div>
                              Outstanding Interest:{' '}
                              {formatCurrency(
                                details.interestAccrued - (loan.totalInterestPaid || 0)
                              )}{' '}
                              | Total Interest Paid: {formatCurrency(loan.totalInterestPaid || 0)}
                            </div>
                            <div>
                              Payments Made: {status.paymentCount} | Total Paid:{' '}
                              {formatCurrency(details.totalPaid)}
                            </div>
                            {balance <= 0 && (
                              <span className="text-green-600 font-medium">(Fully Paid)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Due: {new Date(loan.dueDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Status:{' '}
                            <span
                              className={`font-medium ${balance <= 0 ? 'text-green-600' : 'text-orange-600'}`}
                            >
                              {balance <= 0 ? 'Paid' : loan.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Allocation Input */}
                      <div className="flex items-center gap-2 mt-3">
                        <label className="text-sm font-medium">Allocate:</label>
                        <input
                          type="number"
                          value={allocations[loan.id] || ''}
                          onChange={(e) => handleManualAllocation(loan.id, e.target.value)}
                          placeholder="0.00"
                          min="0"
                          max={Math.max(0, balance)}
                          step="0.01"
                          className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {balance > 0 && (
                          <button
                            type="button"
                            onClick={() => handleManualAllocation(loan.id, balance.toString())}
                            className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            Pay Full
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setShowPaymentHistory((prev) => ({
                              ...prev,
                              [loan.id]: !prev[loan.id],
                            }))
                          }
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          {showPaymentHistory[loan.id] ? 'Hide' : 'Show'} History
                        </button>
                      </div>
                    </div>

                    {/* Payment History Table */}
                    {showPaymentHistory[loan.id] && (
                      <div className="p-4 bg-white">
                        <h4 className="font-medium text-gray-900 mb-3">Payment History</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-2 py-2 text-left font-medium text-gray-600">
                                  Date
                                </th>
                                <th className="px-2 py-2 text-left font-medium text-gray-600">
                                  Days
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  Balance Before
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  Interest
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  Total Due
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  Payment
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  New Balance
                                </th>
                                <th className="px-2 py-2 text-right font-medium text-gray-600">
                                  Cumulative Interest
                                </th>
                                <th className="px-2 py-2 text-left font-medium text-gray-600">
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {/* Preview entry for new payment */}
                              {(() => {
                                const previewEntry = getPreviewPaymentEntry(loan);
                                if (!previewEntry) return null;

                                return (
                                  <tr className="bg-yellow-50 border-2 border-yellow-300">
                                    <td className="px-2 py-2 text-gray-900 font-medium">
                                      {new Date(previewEntry.date).toLocaleDateString()}
                                      <span className="text-xs text-yellow-600 block">
                                        (Preview)
                                      </span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-600">
                                      {previewEntry.daysSinceLast}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(previewEntry.balanceBefore)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(previewEntry.interest)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(previewEntry.totalDue)}
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium text-green-600">
                                      {formatCurrency(previewEntry.payment)}
                                      <div className="text-xs text-gray-500">
                                        Int: {formatCurrency(previewEntry.interestPayment)} | Prin:{' '}
                                        {formatCurrency(previewEntry.principalPayment)}
                                      </div>
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium text-blue-600">
                                      {formatCurrency(previewEntry.newBalance)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(previewEntry.cumulativeInterest)}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600">
                                      {previewEntry.notes}
                                    </td>
                                  </tr>
                                );
                              })()}

                              {/* Existing payment history in reverse order (newest first, oldest last) */}
                              {paymentHistory
                                .slice()
                                .reverse()
                                .map((entry, index) => (
                                  <tr key={index} className={entry.payment > 0 ? 'bg-blue-50' : ''}>
                                    <td className="px-2 py-2 text-gray-900">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600">
                                      {entry.daysSinceLast}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(entry.balanceBefore)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(entry.interest)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(entry.totalDue)}
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium text-green-600">
                                      {entry.payment > 0 ? formatCurrency(entry.payment) : '-'}
                                    </td>
                                    <td className="px-2 py-2 text-right font-medium text-blue-600">
                                      {formatCurrency(entry.newBalance)}
                                    </td>
                                    <td className="px-2 py-2 text-right text-gray-900">
                                      {formatCurrency(entry.cumulativeInterest)}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600">{entry.notes}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-sm">
                <span>Deposit Amount:</span>
                <span>{formatCurrency(Number(depositAmount) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deposit Date:</span>
                <span>{depositDate ? new Date(depositDate).toLocaleDateString('en-IN') : '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Allocated:</span>
                <span>{formatCurrency(getTotalAllocated())}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Remaining:</span>
                <span>{formatCurrency((Number(depositAmount) || 0) - getTotalAllocated())}</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={loading || getTotalAllocated() === 0}
          >
            {loading ? 'Processing Deposit...' : 'Process Deposit'}
          </button>
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserDepositPage;
