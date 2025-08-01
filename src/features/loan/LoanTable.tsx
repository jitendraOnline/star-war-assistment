import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Loan } from './loan.service';
import type { Person } from '../people/people.service';
import LoanCard from './LoanCard';
import {
  calculateTotalAmount,
  isLoanOverdue,
  calculateCurrentLoanAmount,
  calculateCurrentInterest,
  calculateLoanAge,
} from './loan.service';

interface LoanTableProps {
  loans: Loan[];
  people: Person[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const LoanTable: React.FC<LoanTableProps> = ({ loans, people, onDelete, onView }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Loan>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const personMap = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p.name])), [people]);

  const filteredAndSortedLoans = useMemo(() => {
    const filtered = loans.filter((loan) => {
      const matchesStatus = statusFilter === '' || loan.status === statusFilter;
      const matchesPerson = personFilter === '' || loan.personId === personFilter;
      return matchesStatus && matchesPerson;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'amount') {
        aValue = calculateTotalAmount(a);
        bValue = calculateTotalAmount(b);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [loans, statusFilter, personFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Loan) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Loan) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getStatusBadge = (loan: Loan) => {
    const isOverdue = isLoanOverdue(loan);
    const status = isOverdue ? 'overdue' : loan.status;

    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      defaulted: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Person</label>
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All People</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedLoans.length} of {loans.length} loans
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="grid gap-4">
          {filteredAndSortedLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              people={people}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('personId')}
              >
                Person {getSortIcon('personId')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('interestRate')}
              >
                Interest Rate {getSortIcon('interestRate')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('startDate')}
              >
                Start Date {getSortIcon('startDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Age
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                Due Date {getSortIcon('dueDate')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {personMap[loan.personId] || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(loan.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {loan.interestRate}% {loan.interestType === 'per_month' ? '/month' : '/year'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(loan.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calculateLoanAge(loan)} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(loan.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(loan)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(calculateCurrentInterest(loan))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(calculateCurrentLoanAmount(loan))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(loan.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <Link
                      to={`/loans/edit/${loan.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(loan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedLoans.length === 0 && (
        <div className="text-center py-8 text-gray-500">No loans found matching your filters.</div>
      )}
    </div>
  );
};

export default LoanTable;
