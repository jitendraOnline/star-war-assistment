import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateLoan, subscribeLoanById, calculateLoanInterest, type Loan } from './loan.service';
import { useDataContext } from '@/contexts/DataContext';
import { useUser } from '@/contexts/UserContext';

type LoanFormData = {
  personId: string;
  amount: string;
  interestRate: string;
  interestType: 'per_annum' | 'per_month';
  startDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  description: string;
};

const EditLoanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { people, peopleLoading } = useDataContext();
  const { userId } = useUser();
  const [loanData, setLoanData] = useState<LoanFormData | null>(null);
  const [originalLoan, setOriginalLoan] = useState<Loan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLoan, setLoadingLoan] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !userId) {
      setError('No loan ID or user ID provided');
      setLoadingLoan(false);
      return;
    }

    const unsubLoan = subscribeLoanById(
      userId,
      id,
      (loan) => {
        if (loan) {
          setOriginalLoan(loan);
          setLoanData({
            personId: loan.personId,
            amount: loan.amount.toString(),
            interestRate: loan.interestRate.toString(),
            interestType: loan.interestType,
            startDate: loan.startDate,
            dueDate: loan.dueDate,
            status: loan.status,
            description: loan.description || '',
          });
        } else {
          setError('Loan not found');
        }
        setLoadingLoan(false);
      },
      (err) => {
        setError(err.message);
        setLoadingLoan(false);
      }
    );

    return () => unsubLoan();
  }, [id, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !loanData || !userId) return;

    if (!loanData.personId || !loanData.amount || !loanData.interestRate || !loanData.dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(loanData.dueDate) <= new Date(loanData.startDate)) {
      setError('Due date must be after start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateLoan(userId, id, {
        personId: loanData.personId,
        amount: Number(loanData.amount),
        interestRate: Number(loanData.interestRate),
        interestType: loanData.interestType,
        startDate: loanData.startDate,
        dueDate: loanData.dueDate,
        status: loanData.status,
        description: loanData.description.trim(),
      });
      navigate('/loans');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoanFormData, value: string) => {
    setLoanData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const calculateTotalAmount = () => {
    if (!loanData) return 0;
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

  if (loadingLoan) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center">Loading loan...</div>
      </div>
    );
  }

  if (!loanData || !originalLoan) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center text-red-600">{error || 'Loan not found'}</div>
        <button
          type="button"
          className="mt-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => navigate('/loans')}
        >
          ← Back to Loans
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="mr-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => navigate('/loans')}
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Edit Loan</h1>
      </div>

      {originalLoan.paymentHistory && originalLoan.paymentHistory.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div>
              <div className="font-medium text-yellow-800">Note: Loan has payment history</div>
              <div className="text-sm text-yellow-700">
                This loan has {originalLoan.paymentHistory.length} payment(s). Changes to the loan
                terms may affect calculations. Consider the impact on existing payments.
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-lg">
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
              Interest Rate (% {loanData.interestType === 'per_month' ? 'per month' : 'per year'}) *
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
          <label className="block mb-1 text-gray-700 font-medium">Status *</label>
          <select
            value={loanData.status}
            onChange={(e) => handleInputChange('status', e.target.value as LoanFormData['status'])}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="defaulted">Defaulted</option>
          </select>
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
            <h3 className="font-medium text-blue-900 mb-2">Updated Loan Summary</h3>
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
                  (new Date(loanData.dueDate).getTime() - new Date(loanData.startDate).getTime()) /
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

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Updating Loan...' : 'Update Loan'}
          </button>
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/loans')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLoanPage;
