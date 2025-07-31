import { database } from '@/service/firebase';
import { ref, onValue, push, remove, update, DataSnapshot } from 'firebase/database';
import type { Loan, CreateLoanData, LoanPayment, CreateLoanPaymentData } from '@/types/loan.type';

// Loan CRUD operations
export function subscribeToLoans(onData: (loans: Loan[]) => void, onError: (error: Error) => void) {
  const loansRef = ref(database, 'loans');
  const unsubscribe = onValue(
    loansRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        onData(
          Object.entries(data).map(([id, value]: [string, unknown]) => {
            const loan = value as Record<string, unknown>;
            return {
              id,
              personId: loan.personId as string,
              amount: loan.amount as number,
              interestRate: loan.interestRate as number,
              startDate: loan.startDate as string,
              dueDate: loan.dueDate as string,
              status: loan.status as Loan['status'],
              description: (loan.description as string) || '',
              createdAt: loan.createdAt as string,
              updatedAt: loan.updatedAt as string,
            };
          })
        );
      } else {
        onData([]);
      }
    },
    (err: Error) => {
      onError(err);
    }
  );
  return unsubscribe;
}

export async function addLoan(loan: CreateLoanData): Promise<void> {
  const now = new Date().toISOString();
  const loanWithTimestamps = {
    ...loan,
    createdAt: now,
    updatedAt: now,
  };
  await push(ref(database, 'loans'), loanWithTimestamps);
}

export async function updateLoan(id: string, loan: Partial<CreateLoanData>): Promise<void> {
  const updatedLoan = {
    ...loan,
    updatedAt: new Date().toISOString(),
  };
  await update(ref(database, `loans/${id}`), updatedLoan);
}

export async function deleteLoan(id: string): Promise<void> {
  await remove(ref(database, `loans/${id}`));
}

// Loan Payment CRUD operations
export function subscribeToLoanPayments(
  onData: (payments: LoanPayment[]) => void,
  onError: (error: Error) => void
) {
  const paymentsRef = ref(database, 'loan_payments');
  const unsubscribe = onValue(
    paymentsRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        onData(
          Object.entries(data).map(([id, value]: [string, unknown]) => {
            const payment = value as Record<string, unknown>;
            return {
              id,
              loanId: payment.loanId as string,
              amount: payment.amount as number,
              paymentDate: payment.paymentDate as string,
              description: (payment.description as string) || '',
              createdAt: payment.createdAt as string,
            };
          })
        );
      } else {
        onData([]);
      }
    },
    (err: Error) => {
      onError(err);
    }
  );
  return unsubscribe;
}

export async function addLoanPayment(payment: CreateLoanPaymentData): Promise<void> {
  const paymentWithTimestamp = {
    ...payment,
    createdAt: new Date().toISOString(),
  };
  await push(ref(database, 'loan_payments'), paymentWithTimestamp);
}

export async function deleteLoanPayment(id: string): Promise<void> {
  await remove(ref(database, `loan_payments/${id}`));
}

// Helper functions
export function calculateLoanInterest(principal: number, rate: number, days: number): number {
  return (principal * rate * days) / (365 * 100);
}

export function calculateTotalAmount(loan: Loan): number {
  const startDate = new Date(loan.startDate);
  const dueDate = new Date(loan.dueDate);
  const daysDiff = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const interest = calculateLoanInterest(loan.amount, loan.interestRate, daysDiff);
  return loan.amount + interest;
}

export function isLoanOverdue(loan: Loan): boolean {
  return new Date() > new Date(loan.dueDate) && loan.status === 'active';
}
