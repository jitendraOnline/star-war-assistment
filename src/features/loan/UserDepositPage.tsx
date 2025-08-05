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

  const getBackPath = () => {
    if (personId) {
      return `/users/${personId}/loans`;
    }
    return '/dashboard';
  };

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

      navigate(getBackPath());
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => navigate(getBackPath())}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Deposit for {person.name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">Make payments towards loans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Loans</p>
                <p className="text-xl font-bold text-gray-900">{userLoans.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Person Balance</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(person.balance)}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Deposit Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Deposit Details</h3>
              <p className="mt-1 text-sm text-gray-600">
                Enter the deposit amount and allocation details
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
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
                <div className="sm:col-span-2 lg:col-span-1">
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

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleAutoAllocate}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  disabled={!depositAmount || Number(depositAmount) <= 0}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Auto-Allocate (Oldest First)
                </button>
              </div>
            </div>
          </div>

          {/* Loan Allocation with Payment History */}
          {userLoans.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Allocate to Loans</h3>

              <div className="space-y-4 sm:space-y-6">
                {userLoans.map((loan) => {
                  const details = getLoanDetailsAsOfDate(loan);
                  const status = getCurrentLoanStatus(loan);
                  const balance = details.balance;
                  const paymentHistory = getLoanPaymentHistoryTable(loan);

                  return (
                    <div key={loan.id} className="border rounded-lg overflow-hidden">
                      {/* Loan Summary */}
                      <div className="bg-gray-50 p-3 sm:p-4">
                        <div className="mb-3">
                          <div className="font-bold text-lg sm:text-xl text-blue-900 mb-2">
                            {formatCurrency(balance)}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-700 mb-1">
                            Balance Due as of {new Date(depositDate).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-700 mb-2">
                            Principal Remaining + Interest Accrued
                          </div>

                          {/* Mobile-friendly loan details */}
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Principal:</span>
                              <span className="font-medium">{formatCurrency(loan.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rate:</span>
                              <span className="font-medium">
                                {loan.interestRate}%{' '}
                                {loan.interestType === 'per_month' ? '/month' : '/year'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="font-medium">
                                {new Date(loan.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span
                                className={`font-medium ${balance <= 0 ? 'text-green-600' : 'text-orange-600'}`}
                              >
                                {balance <= 0 ? 'Paid' : loan.status}
                              </span>
                            </div>
                          </div>

                          {/* Detailed breakdown - collapsible on mobile */}
                          <details className="mt-3">
                            <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                              View Details
                            </summary>
                            <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                              <div>
                                Original Loan: {formatCurrency(loan.amount)} | Principal Paid:{' '}
                                {formatCurrency(loan.totalPrincipalPaid || 0)} | Principal
                                Remaining:{' '}
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
                          </details>
                        </div>

                        {/* Allocation Input */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="text-sm font-medium sm:whitespace-nowrap">
                              Allocate:
                            </label>
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="number"
                                value={allocations[loan.id] || ''}
                                onChange={(e) => handleManualAllocation(loan.id, e.target.value)}
                                placeholder="0.00"
                                min="0"
                                max={Math.max(0, balance)}
                                step="0.01"
                                className="flex-1 sm:w-32 sm:flex-none px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {balance > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleManualAllocation(loan.id, balance.toString())
                                  }
                                  className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 whitespace-nowrap"
                                >
                                  Pay Full
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setShowPaymentHistory((prev) => ({
                                ...prev,
                                [loan.id]: !prev[loan.id],
                              }))
                            }
                            className="w-full sm:w-auto text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                          >
                            {showPaymentHistory[loan.id] ? 'Hide' : 'Show'} Payment History
                          </button>
                        </div>
                      </div>

                      {/* Payment History Table */}
                      {showPaymentHistory[loan.id] && (
                        <div className="p-3 sm:p-4 bg-white">
                          <h4 className="font-medium text-gray-900 mb-3">Payment History</h4>

                          {/* Mobile-friendly card layout */}
                          <div className="block sm:hidden space-y-3">
                            {/* Preview entry for new payment */}
                            {(() => {
                              const previewEntry = getPreviewPaymentEntry(loan);
                              if (!previewEntry) return null;

                              return (
                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900">
                                      {new Date(previewEntry.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-yellow-600 bg-yellow-200 px-2 py-1 rounded">
                                      Preview
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Days:</span>{' '}
                                      {previewEntry.daysSinceLast}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Balance Before:</span>{' '}
                                      {formatCurrency(previewEntry.balanceBefore)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Interest:</span>{' '}
                                      {formatCurrency(previewEntry.interest)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Total Due:</span>{' '}
                                      {formatCurrency(previewEntry.totalDue)}
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-gray-500">Payment:</span>{' '}
                                      <span className="font-medium text-green-600">
                                        {formatCurrency(previewEntry.payment)}
                                      </span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        Interest: {formatCurrency(previewEntry.interestPayment)} |
                                        Principal: {formatCurrency(previewEntry.principalPayment)}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">New Balance:</span>{' '}
                                      <span className="font-medium text-blue-600">
                                        {formatCurrency(previewEntry.newBalance)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Cumulative Interest:</span>{' '}
                                      {formatCurrency(previewEntry.cumulativeInterest)}
                                    </div>
                                    {previewEntry.notes && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Notes:</span>{' '}
                                        {previewEntry.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Existing payment history in reverse order */}
                            {paymentHistory
                              .slice()
                              .reverse()
                              .map((entry, index) => (
                                <div
                                  key={index}
                                  className={`border rounded p-3 ${entry.payment > 0 ? 'bg-blue-50' : 'bg-gray-50'}`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900">
                                      {new Date(entry.date).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Days: {entry.daysSinceLast}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Balance Before:</span>{' '}
                                      {formatCurrency(entry.balanceBefore)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Interest:</span>{' '}
                                      {formatCurrency(entry.interest)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Total Due:</span>{' '}
                                      {formatCurrency(entry.totalDue)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Payment:</span>{' '}
                                      <span className="font-medium text-green-600">
                                        {entry.payment > 0 ? formatCurrency(entry.payment) : '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">New Balance:</span>{' '}
                                      <span className="font-medium text-blue-600">
                                        {formatCurrency(entry.newBalance)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Cumulative Interest:</span>{' '}
                                      {formatCurrency(entry.cumulativeInterest)}
                                    </div>
                                    {entry.notes && (
                                      <div className="col-span-2">
                                        <span className="text-gray-500">Notes:</span> {entry.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Desktop table layout */}
                          <div className="hidden sm:block overflow-x-auto">
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
                                          Int: {formatCurrency(previewEntry.interestPayment)} |
                                          Prin: {formatCurrency(previewEntry.principalPayment)}
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
                                    <tr
                                      key={index}
                                      className={entry.payment > 0 ? 'bg-blue-50' : ''}
                                    >
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Deposit Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(Number(depositAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Deposit Date:</span>
                    <span className="font-medium">
                      {depositDate ? new Date(depositDate).toLocaleDateString('en-IN') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Total Allocated:</span>
                    <span className="font-medium">{formatCurrency(getTotalAllocated())}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium">
                      {formatCurrency((Number(depositAmount) || 0) - getTotalAllocated())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
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
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || getTotalAllocated() === 0}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Deposit...
                </>
              ) : (
                'Process Deposit'
              )}
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => navigate(getBackPath())}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDepositPage;
