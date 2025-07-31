export interface Loan {
  id: string;
  personId: string;
  amount: number;
  interestRate: number; // percentage
  startDate: string; // ISO date string
  dueDate: string; // ISO date string
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string; // ISO date string
  description?: string;
  createdAt: string;
}

export type CreateLoanData = Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateLoanPaymentData = Omit<LoanPayment, 'id' | 'createdAt'>;
