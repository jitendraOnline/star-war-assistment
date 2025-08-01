import React from 'react';
import { Link } from 'react-router-dom';
import type { Loan } from './loan.service';
import type { Person } from '../people/people.service';
import {
  calculateTotalAmount,
  isLoanOverdue,
  calculateCurrentLoanAmount,
  calculateCurrentInterest,
  calculateLoanAge,
} from './loan.service';

interface LoanCardProps {
  loan: Loan;
  people: Person[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, people, onDelete, onView }) => {
  const personName = people.find((p) => p.id === loan.personId)?.name || 'Unknown';
  const isOverdue = isLoanOverdue(loan);
  const status = isOverdue ? 'overdue' : loan.status;
  const totalAmount = calculateTotalAmount(loan);
  const currentAmount = calculateCurrentLoanAmount(loan);
  const currentInterest = calculateCurrentInterest(loan);
  const loanAge = calculateLoanAge(loan);

  const getStatusBadge = () => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paid: 'bg-blue-100 text-blue-800 border-blue-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      defaulted: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{personName}</h3>
          <p className="text-sm text-gray-500">Loan #{loan.id.slice(-8)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge()}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(loan.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              View
            </button>
            <Link
              to={`/loans/edit/${loan.id}`}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(loan.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Principal</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatCurrency(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Amount
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current Interest
            </p>
            <p className="text-sm font-semibold text-orange-600 mt-1">
              {formatCurrency(currentInterest)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Current Total
            </p>
            <p className="text-sm font-semibold text-green-600 mt-1">
              {formatCurrency(currentAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interest Rate</p>
          <p className="text-sm text-gray-900 mt-1">{loan.interestRate}% per month</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Loan Age</p>
          <p className="text-sm text-gray-900 mt-1">{loanAge} days</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
          <p className="text-sm text-gray-900 mt-1">{formatDate(loan.startDate)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</p>
          <p className="text-sm text-gray-900 mt-1">{formatDate(loan.dueDate)}</p>
        </div>
      </div>

      {/* Description */}
      {loan.description && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Description
          </p>
          <p className="text-sm text-gray-700">{loan.description}</p>
        </div>
      )}
    </div>
  );
};

export default LoanCard;
