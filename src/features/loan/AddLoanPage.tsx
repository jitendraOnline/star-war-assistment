import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addLoan, calculateLoanInterest } from './loan.service';
import { useDataContext } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';

const initialLoanData = {
  personId: '',
  amount: '',
  interestRate: '',
  interestType: 'per_annum' as 'per_annum' | 'per_month',
  startDate: new Date().toISOString().split('T')[0], // Today's date
  dueDate: '',
  status: 'active' as const,
  description: '',
};

type LoanFormData = typeof initialLoanData;

const AddLoanPage: React.FC = () => {
  const { people, peopleLoading } = useDataContext();
  const { userId } = useUser();
  const [loanData, setLoanData] = useState<LoanFormData>(initialLoanData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Pre-select person if personId is provided in URL
    const personId = searchParams.get('personId');
    if (personId) {
      setLoanData((prev) => ({ ...prev, personId }));
    }
  }, [searchParams]);

  const getBackPath = () => {
    const from = searchParams.get('from');
    const personId = searchParams.get('personId');

    if (from === 'user-details' && personId) {
      return `/users/${personId}/loans`;
    }
    if (from === 'dashboard') {
      return '/dashboard';
    }
    return '/loans';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanData.personId || !loanData.amount || !loanData.interestRate || !loanData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(loanData.dueDate) <= new Date(loanData.startDate)) {
      setError('Due date must be after start date');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addLoan(userId, {
        personId: loanData.personId,
        amount: Number(loanData.amount),
        interestRate: Number(loanData.interestRate),
        interestType: loanData.interestType,
        startDate: loanData.startDate,
        dueDate: loanData.dueDate,
        status: loanData.status,
        description: loanData.description.trim(),
      });
      navigate(getBackPath());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setLoanData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotalAmount = () => {
    const principal = Number(loanData.amount) || 0;
    const rate = Number(loanData.interestRate) || 0;
    if (!loanData.startDate || !loanData.dueDate || principal === 0) {
      return 0;
    }

    const startDate = new Date(loanData.startDate);
    const dueDate = new Date(loanData.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) return principal;

    // Use the service function for consistent calculation
    const interest = calculateLoanInterest(principal, rate, daysDiff, loanData.interestType);
    return principal + interest;
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Loan</h1>
              <p className="mt-1 text-sm text-gray-600">Create a new loan for a person</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Loan Details</h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the information below to create a new loan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Person *</label>
              <select
                value={loanData.personId}
                onChange={(e) => handleInputChange('personId', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={peopleLoading}
              >
                <option value="">{peopleLoading ? 'Loading people...' : 'Select a person'}</option>
                {!peopleLoading &&
                  people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} (Balance: ₹{person.balance})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Loan Amount *</label>
                <input
                  type="number"
                  value={loanData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Interest Type *</label>
                <select
                  value={loanData.interestType}
                  onChange={(e) => handleInputChange('interestType', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="per_annum">Per Annum (Yearly)</option>
                  <option value="per_month">Per Month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">
                  Interest Rate (%{' '}
                  {loanData.interestType === 'per_month' ? 'per month' : 'per year'}) *
                </label>
                <input
                  type="number"
                  value={loanData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  placeholder={loanData.interestType === 'per_month' ? 'e.g., 2' : 'e.g., 12'}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Start Date *</label>
                <input
                  type="date"
                  value={loanData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-700 font-medium">Due Date *</label>
                <input
                  type="date"
                  value={loanData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={loanData.startDate}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Description</label>
              <textarea
                value={loanData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional description or notes about the loan"
                rows={3}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Loan Summary */}
            {loanData.amount && loanData.interestRate && loanData.startDate && loanData.dueDate && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Loan Summary</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>Principal Amount: ₹{Number(loanData.amount).toLocaleString('en-IN')}</div>
                  <div>
                    Interest Rate: {loanData.interestRate}%{' '}
                    {loanData.interestType === 'per_month' ? 'per month' : 'per year'}
                  </div>
                  <div>
                    Interest Type: {loanData.interestType === 'per_month' ? 'Monthly' : 'Yearly'}{' '}
                    (Simple Interest)
                  </div>
                  <div>
                    Duration:{' '}
                    {Math.ceil(
                      (new Date(loanData.dueDate).getTime() -
                        new Date(loanData.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </div>
                  <div className="font-medium text-lg">
                    Total Amount: ₹
                    {calculateTotalAmount().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating Loan...' : 'Create Loan'}
              </button>
              <button
                type="button"
                className="px-6 py-3 sm:px-6 sm:py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={() => navigate(getBackPath())}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLoanPage;
