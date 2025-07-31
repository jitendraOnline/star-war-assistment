import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Loan } from '@/features/loan/loan.service';
import type { Person } from '@/features/people/people.service';
import {
  isLoanOverdue,
  calculateCurrentLoanAmount,
  calculateLoanAge,
} from '@/features/loan/loan.service';
import { Card, CardContent, Button, Badge } from '@/components/UI';

interface MobileLoanListProps {
  loans: Loan[];
  people: Person[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const MobileLoanList: React.FC<MobileLoanListProps> = ({
  loans,
  people,
  onDelete,
  onView,
}) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');

  const personMap = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p.name])), [people]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesStatus = statusFilter === '' || loan.status === statusFilter;
      const matchesPerson = personFilter === '' || loan.personId === personFilter;
      return matchesStatus && matchesPerson;
    });
  }, [loans, statusFilter, personFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (loan: Loan) => {
    if (loan.status === 'paid') {
      return <Badge variant="success">Paid</Badge>;
    }
    if (isLoanOverdue(loan)) {
      return <Badge variant="danger">Overdue</Badge>;
    }
    return <Badge variant="info">Active</Badge>;
  };

  const uniqueStatuses = [...new Set(loans.map((loan) => loan.status))];

  return (
    <div className="space-y-4">
      {/* Mobile Filters */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={personFilter}
          onChange={(e) => setPersonFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All People</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Loan Cards */}
      <div className="space-y-3">
        {filteredLoans.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No loans found matching the current filters.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredLoans.map((loan) => {
            const personName = personMap[loan.personId] || 'Unknown Person';
            const currentAmount = calculateCurrentLoanAmount(loan);
            const loanAge = calculateLoanAge(loan);

            return (
              <Card key={loan.id}>
                <CardContent>
                  {/* Header with person name and status */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{personName}</h3>
                      <p className="text-xs text-gray-500">Loan #{loan.id.slice(-6)}</p>
                    </div>
                    {getStatusBadge(loan)}
                  </div>

                  {/* Amount Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">Principal</p>
                      <p className="text-sm font-bold text-blue-800">
                        {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-red-600 font-medium">Current Balance</p>
                      <p className="text-sm font-bold text-red-800">
                        {formatCurrency(currentAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-600">
                    <div>
                      <span className="block font-medium">Interest Rate</span>
                      <span>{loan.interestRate}%</span>
                    </div>
                    <div>
                      <span className="block font-medium">Age</span>
                      <span>{loanAge} days</span>
                    </div>
                    <div>
                      <span className="block font-medium">Start Date</span>
                      <span>{formatDate(loan.startDate)}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Due Date</span>
                      <span>{formatDate(loan.dueDate)}</span>
                    </div>
                  </div>

                  {loan.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {loan.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => onView(loan.id)}
                      className="sm:w-auto"
                    >
                      View Details
                    </Button>
                    <Link to={`/loans/edit/${loan.id}`} className="flex-1 sm:flex-none">
                      <Button variant="ghost" size="sm" fullWidth className="sm:w-auto">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => onDelete(loan.id)}
                      className="sm:w-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
