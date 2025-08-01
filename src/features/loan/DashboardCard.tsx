import React from 'react';
import { Link } from 'react-router-dom';

interface UserLoanSummary {
  personId: string;
  personName: string;
  totalActiveLoans: number;
  totalPrincipalRemaining: number;
  totalCurrentInterest: number;
  totalCurrentDue: number;
  totalPaid: number;
}

interface DashboardCardProps {
  user: UserLoanSummary;
  formatCurrency: (amount: number) => string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ user, formatCurrency }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{user.personName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.totalActiveLoans} loan{user.totalActiveLoans !== 1 ? 's' : ''}
            </span>
            {user.totalCurrentDue > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Due
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Amounts Grid - Compact */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500 uppercase tracking-wide font-medium">Loan Amount</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {formatCurrency(user.totalPrincipalRemaining)}
          </p>
        </div>
        <div className="bg-orange-50 rounded p-2">
          <p className="text-orange-600 uppercase tracking-wide font-medium">Interest</p>
          <p className="font-semibold text-orange-700 mt-0.5">
            {formatCurrency(user.totalCurrentInterest)}
          </p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-green-600 uppercase tracking-wide font-medium">Paid</p>
          <p className="font-semibold text-green-700 mt-0.5">{formatCurrency(user.totalPaid)}</p>
        </div>
        <div className="bg-red-50 rounded p-2">
          <p className="text-red-600 uppercase tracking-wide font-medium">Total Due</p>
          <p className="font-semibold text-red-700 mt-0.5">
            {formatCurrency(user.totalCurrentDue)}
          </p>
        </div>
      </div>

      {/* Actions - Compact */}
      <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
        <Link
          to={`/users/${user.personId}/loans`}
          className="flex-1 text-center text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
        >
          View Details
        </Link>
        <Link
          to={`/loans/add?personId=${user.personId}`}
          className="flex-1 text-center text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1.5 rounded hover:bg-green-50 transition-colors"
        >
          New Loan
        </Link>
        {user.totalCurrentDue > 0 && (
          <Link
            to={`/users/${user.personId}/deposit`}
            className="flex-1 text-center text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2 py-1.5 rounded hover:bg-indigo-50 transition-colors"
          >
            Deposit
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
