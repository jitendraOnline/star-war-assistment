import { database } from '@/service/firebase';
import { ref, onValue, push, remove, update, DataSnapshot } from 'firebase/database';

export interface LoanPaymentHistoryEntry {
  depositDate: string; // ISO date string
  daysSinceLast: number;
  balanceBefore: number;
  interestForPeriod: number;
  totalDue: number;
  paymentAmount: number;
  newBalance: number;
  cumulativeInterest: number;
  notes: string;
  description?: string;
  createdAt: string; // When this entry was added to system
}

export interface Loan {
  id: string;
  personId: string;
  amount: number; // Original principal
  interestRate: number; // percentage
  interestType: 'per_annum' | 'per_month';
  startDate: string; // ISO date string
  dueDate: string; // ISO date string
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  description?: string;

  // New fields for embedded payment tracking
  currentBalance: number; // Current outstanding balance
  totalInterestPaid: number; // Total interest paid so far
  totalPrincipalPaid: number; // Total principal paid so far
  lastPaymentDate: string; // Last payment date (or start date if no payments)

  // Payment history embedded in loan
  paymentHistory: LoanPaymentHistoryEntry[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type CreateLoanData = Omit<
  Loan,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'currentBalance'
  | 'totalInterestPaid'
  | 'totalPrincipalPaid'
  | 'lastPaymentDate'
  | 'paymentHistory'
>;

// Legacy interface - will be removed completely
export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  description?: string;
  createdAt: string;
}

// Loan CRUD operations
export function subscribeToLoans(
  userId: string,
  onData: (loans: Loan[]) => void,
  onError: (error: Error) => void
) {
  const loansRef = ref(database, `users/${userId}/loans`);
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
              interestType: loan.interestType as Loan['interestType'],
              startDate: loan.startDate as string,
              dueDate: loan.dueDate as string,
              status: loan.status as Loan['status'],
              description: (loan.description as string) || '',

              // Required fields - no defaults
              currentBalance: loan.currentBalance as number,
              totalInterestPaid: loan.totalInterestPaid as number,
              totalPrincipalPaid: loan.totalPrincipalPaid as number,
              lastPaymentDate: loan.lastPaymentDate as string,
              paymentHistory: loan.paymentHistory as LoanPaymentHistoryEntry[],

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

export async function addLoan(userId: string, loan: CreateLoanData): Promise<void> {
  const now = new Date().toISOString();
  const loanWithDefaults: Omit<Loan, 'id'> = {
    ...loan,
    currentBalance: loan.amount, // Initially, balance equals principal
    totalInterestPaid: 0,
    totalPrincipalPaid: 0,
    lastPaymentDate: loan.startDate, // Set to start date initially
    paymentHistory: [], // Empty payment history initially
    createdAt: now,
    updatedAt: now,
  };
  await push(ref(database, `users/${userId}/loans`), loanWithDefaults);
}

export async function updateLoan(
  userId: string,
  id: string,
  loan: Partial<CreateLoanData>
): Promise<void> {
  const updatedLoan = {
    ...loan,
    updatedAt: new Date().toISOString(),
  };
  await update(ref(database, `users/${userId}/loans/${id}`), updatedLoan);
}

export function subscribeLoanById(
  userId: string,
  id: string,
  onData: (loan: Loan | null) => void,
  onError: (error: Error) => void
) {
  const loanRef = ref(database, `users/${userId}/loans/${id}`);
  const unsubscribe = onValue(
    loanRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const loan: Loan = {
          id,
          personId: data.personId as string,
          amount: data.amount as number,
          interestRate: data.interestRate as number,
          interestType: data.interestType as Loan['interestType'],
          startDate: data.startDate as string,
          dueDate: data.dueDate as string,
          status: data.status as Loan['status'],
          description: (data.description as string) || '',

          // Required fields
          currentBalance: data.currentBalance as number,
          totalInterestPaid: data.totalInterestPaid as number,
          totalPrincipalPaid: data.totalPrincipalPaid as number,
          lastPaymentDate: data.lastPaymentDate as string,
          paymentHistory: data.paymentHistory as LoanPaymentHistoryEntry[],

          createdAt: data.createdAt as string,
          updatedAt: data.updatedAt as string,
        };
        onData(loan);
      } else {
        onData(null);
      }
    },
    (error: Error) => onError(error)
  );
  return unsubscribe;
}

export async function deleteLoan(userId: string, id: string): Promise<void> {
  await remove(ref(database, `users/${userId}/loans/${id}`));
}

// Loan Payment CRUD operations
// Legacy payment functions - removed, no longer needed
export function subscribeToLoanPayments(onData: (payments: LoanPayment[]) => void) {
  // Return empty array as payments are now embedded in loans
  onData([]);
  return () => {}; // Empty unsubscribe function
}

// New payment function that updates loan's embedded history
export async function addLoanPayment(
  userId: string,
  paymentData: {
    loanId: string;
    amount: number;
    paymentDate: string;
    description?: string;
  }
): Promise<void> {
  const { loanId, amount, paymentDate, description } = paymentData;

  // Get current loan data
  const loanRef = ref(database, `users/${userId}/loans/${loanId}`);
  const snapshot = await new Promise<DataSnapshot>((resolve, reject) => {
    onValue(loanRef, resolve, reject, { onlyOnce: true });
  });

  if (!snapshot.exists()) {
    throw new Error('Loan not found');
  }

  const loanData = snapshot.val() as Record<string, unknown>;
  const currentBalance = (loanData.currentBalance as number) ?? (loanData.amount as number);
  const paymentHistory = (loanData.paymentHistory as LoanPaymentHistoryEntry[]) ?? [];
  const lastPaymentDate = (loanData.lastPaymentDate as string) ?? (loanData.startDate as string);
  const totalInterestPaid = (loanData.totalInterestPaid as number) ?? 0;
  const totalPrincipalPaid = (loanData.totalPrincipalPaid as number) ?? 0;

  // Calculate days since last payment
  const daysSinceLast = Math.ceil(
    (new Date(paymentDate).getTime() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate interest for this period
  const interestForPeriod = calculateLoanInterest(
    currentBalance,
    loanData.interestRate as number,
    daysSinceLast,
    (loanData.interestType as 'per_annum' | 'per_month') || 'per_annum'
  );

  const totalDue = roundToTwoDecimals(currentBalance + interestForPeriod);
  const newBalance = roundToTwoDecimals(Math.max(0, totalDue - amount));

  // Calculate how much went to interest vs principal
  const interestPaid = roundToTwoDecimals(Math.min(amount, interestForPeriod));
  const principalPaid = roundToTwoDecimals(Math.max(0, amount - interestForPeriod));

  // Create new payment history entry
  const newHistoryEntry: LoanPaymentHistoryEntry = {
    depositDate: paymentDate,
    daysSinceLast,
    balanceBefore: roundToTwoDecimals(currentBalance),
    interestForPeriod: roundToTwoDecimals(interestForPeriod),
    totalDue,
    paymentAmount: roundToTwoDecimals(amount),
    newBalance,
    cumulativeInterest: roundToTwoDecimals(totalInterestPaid + interestPaid),
    notes: description || (amount >= totalDue ? 'Full Payment' : 'Partial Payment'),
    description,
    createdAt: new Date().toISOString(),
  };

  // Update loan with new data
  const updatedLoan = {
    currentBalance: newBalance,
    totalInterestPaid: roundToTwoDecimals(totalInterestPaid + interestPaid),
    totalPrincipalPaid: roundToTwoDecimals(totalPrincipalPaid + principalPaid),
    lastPaymentDate: paymentDate,
    paymentHistory: [...paymentHistory, newHistoryEntry],
    status: newBalance <= 0 ? 'paid' : loanData.status,
    updatedAt: new Date().toISOString(),
  };

  await update(loanRef, updatedLoan);
}

export async function deleteLoanPayment(id: string): Promise<void> {
  // This function will need to be redesigned to work with embedded history
  // For now, just remove from legacy payments table
  await remove(ref(database, `loan_payments/${id}`));
}

// Helper functions

// Round to 2 decimal places
function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateLoanInterest(
  principal: number,
  rate: number,
  days: number,
  interestType: 'per_annum' | 'per_month'
): number {
  // Simple Interest formula: (Principal × Rate × Days) / 100
  // Standardize all calculations using 30 days per month
  let dailyRate: number;

  if (interestType === 'per_month') {
    // For monthly rate: divide by 30 days to get daily rate
    dailyRate = (rate * 12) / 365; // Convert monthly rate to daily rate
  } else {
    dailyRate = rate / 365;
  }

  console.log('dailyRate', dailyRate, 'days', days, 'principal', principal);

  // Calculate interest for the given number of days
  const interest = (principal * dailyRate * days) / 100;
  return roundToTwoDecimals(interest);
}
export function calculateTotalAmount(loan: Loan): number {
  const startDate = new Date(loan.startDate);
  const dueDate = new Date(loan.dueDate);
  const daysDiff = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const interest = calculateLoanInterest(
    loan.amount,
    loan.interestRate,
    daysDiff,
    loan.interestType
  );
  return roundToTwoDecimals(loan.amount + interest);
}

export function isLoanOverdue(loan: Loan): boolean {
  return new Date() > new Date(loan.dueDate) && loan.status === 'active';
}

export function getLoanRemainingBalance(loan: Loan, payments: LoanPayment[]): number {
  const totalAmount = calculateTotalAmount(loan);
  const totalPaid = payments
    .filter((p) => p.loanId === loan.id)
    .reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, totalAmount - totalPaid);
}

// Calculate loan balance as of a specific date using embedded payment history
export function calculateLoanBalanceAsOfDate(
  loan: Loan,
  asOfDate: string
): {
  principal: number;
  interestAccrued: number;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  isOverpaid: boolean;
} {
  const targetDate = new Date(asOfDate);
  const startDate = new Date(loan.startDate);

  // If target date is before loan start, no amount is due
  if (targetDate < startDate) {
    return {
      principal: roundToTwoDecimals(loan.amount),
      interestAccrued: 0,
      totalAmount: roundToTwoDecimals(loan.amount),
      totalPaid: 0,
      balance: roundToTwoDecimals(loan.amount),
      isOverpaid: false,
    };
  }

  // Use embedded payment history
  const paymentHistory = loan.paymentHistory || [];

  // Find the last payment on or before the target date
  const paymentsBeforeDate = paymentHistory
    .filter((entry) => new Date(entry.depositDate) <= targetDate)
    .sort((a, b) => new Date(a.depositDate).getTime() - new Date(b.depositDate).getTime());

  if (paymentsBeforeDate.length === 0) {
    // No payments by target date - calculate interest from start
    const daysSinceStart = Math.ceil(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const interestAccrued = calculateLoanInterest(
      loan.amount,
      loan.interestRate,
      daysSinceStart,
      loan.interestType
    );

    return {
      principal: roundToTwoDecimals(loan.amount),
      interestAccrued: roundToTwoDecimals(interestAccrued),
      totalAmount: roundToTwoDecimals(loan.amount + interestAccrued),
      totalPaid: 0,
      balance: roundToTwoDecimals(loan.amount + interestAccrued),
      isOverpaid: false,
    };
  }

  const lastEntry = paymentsBeforeDate[paymentsBeforeDate.length - 1];
  const lastPaymentDate = new Date(lastEntry.depositDate);

  // If target date is same as or before last payment, use that entry's data
  if (targetDate <= lastPaymentDate) {
    return {
      principal: roundToTwoDecimals(loan.amount),
      interestAccrued: roundToTwoDecimals(lastEntry.cumulativeInterest),
      totalAmount: roundToTwoDecimals(loan.amount + lastEntry.cumulativeInterest),
      totalPaid: roundToTwoDecimals(
        paymentsBeforeDate.reduce((sum, entry) => sum + entry.paymentAmount, 0)
      ),
      balance: roundToTwoDecimals(lastEntry.newBalance),
      isOverpaid: lastEntry.newBalance < 0,
    };
  }

  // Calculate additional interest from last payment to target date
  const daysFromLastPayment = Math.ceil(
    (targetDate.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const additionalInterest =
    daysFromLastPayment > 0
      ? calculateLoanInterest(
          lastEntry.newBalance,
          loan.interestRate,
          daysFromLastPayment,
          loan.interestType
        )
      : 0;

  const totalInterestAccrued = roundToTwoDecimals(
    lastEntry.cumulativeInterest + additionalInterest
  );
  const currentBalance = roundToTwoDecimals(lastEntry.newBalance + additionalInterest);
  const totalPaid = roundToTwoDecimals(
    paymentsBeforeDate.reduce((sum, entry) => sum + entry.paymentAmount, 0)
  );

  return {
    principal: roundToTwoDecimals(loan.amount),
    interestAccrued: totalInterestAccrued,
    totalAmount: roundToTwoDecimals(loan.amount + totalInterestAccrued),
    totalPaid,
    balance: roundToTwoDecimals(Math.max(0, currentBalance)),
    isOverpaid: currentBalance < 0,
  };
} // Calculate loan amount as of today (current accrued interest)
export function calculateCurrentLoanAmount(loan: Loan): number {
  const startDate = new Date(loan.startDate);
  const today = new Date();
  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 0) return roundToTwoDecimals(loan.amount); // Loan hasn't started yet

  const accruedInterest = calculateLoanInterest(
    loan.amount,
    loan.interestRate,
    daysSinceStart,
    loan.interestType
  );
  return roundToTwoDecimals(loan.amount + accruedInterest);
}

// Calculate current accrued interest
export function calculateCurrentInterest(loan: Loan): number {
  const startDate = new Date(loan.startDate);
  const today = new Date();
  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart <= 0) return 0; // Loan hasn't started yet

  return calculateLoanInterest(loan.amount, loan.interestRate, daysSinceStart, loan.interestType);
}

// Enhanced loan payment audit calculation
export function calculateLoanPaymentHistory(
  loan: Loan,
  payments: LoanPayment[]
): {
  paymentDate: string;
  daysSinceLastPayment: number;
  balanceBeforePayment: number;
  interestForPeriod: number;
  totalDueBeforePayment: number;
  paymentAmount: number;
  newBalanceAfterPayment: number;
  cumulativeInterestPaid: number;
  cumulativePrincipalPaid: number;
  notes: string;
}[] {
  const history = [];
  const sortedPayments = payments
    .filter((p) => p.loanId === loan.id)
    .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

  let currentBalance = loan.amount;
  let lastPaymentDate = new Date(loan.startDate);
  let cumulativeInterestPaid = 0;
  let cumulativePrincipalPaid = 0;

  // Initial state
  history.push({
    paymentDate: loan.startDate,
    daysSinceLastPayment: 0,
    balanceBeforePayment: 0,
    interestForPeriod: 0,
    totalDueBeforePayment: loan.amount,
    paymentAmount: 0,
    newBalanceAfterPayment: loan.amount,
    cumulativeInterestPaid: 0,
    cumulativePrincipalPaid: 0,
    notes: 'Loan Disbursed',
  });

  for (const payment of sortedPayments) {
    const paymentDate = new Date(payment.paymentDate);
    const daysSinceLastPayment = Math.ceil(
      (paymentDate.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate interest on current balance for this period
    const interestForPeriod = calculateLoanInterest(
      currentBalance,
      loan.interestRate,
      daysSinceLastPayment,
      loan.interestType
    );

    const totalDueBeforePayment = currentBalance + interestForPeriod;
    const balanceBeforePayment = currentBalance;

    // Apply payment
    const paymentAmount = payment.amount;
    const newBalance = totalDueBeforePayment - paymentAmount;

    // Calculate how much went to interest vs principal
    const interestPaidThisPeriod = Math.min(paymentAmount, interestForPeriod);
    const principalPaidThisPeriod = Math.max(0, paymentAmount - interestForPeriod);

    cumulativeInterestPaid += interestPaidThisPeriod;
    cumulativePrincipalPaid += principalPaidThisPeriod;

    // Determine payment type
    let notes = 'Payment';
    if (paymentAmount >= totalDueBeforePayment) {
      notes = newBalance <= 0 ? 'Full Payment' : 'Overpayment';
    } else {
      notes = 'Partial Payment';
    }

    if (payment.description) {
      notes = payment.description;
    }

    history.push({
      paymentDate: payment.paymentDate,
      daysSinceLastPayment,
      balanceBeforePayment,
      interestForPeriod,
      totalDueBeforePayment,
      paymentAmount,
      newBalanceAfterPayment: Math.max(0, newBalance),
      cumulativeInterestPaid,
      cumulativePrincipalPaid,
      notes,
    });

    // Update for next iteration
    currentBalance = Math.max(0, newBalance);
    lastPaymentDate = paymentDate;
  }

  return history;
}

// Helper function to get current loan balance and status
export function getCurrentLoanStatus(loan: Loan) {
  return {
    currentBalance: loan.currentBalance,
    totalInterestPaid: loan.totalInterestPaid,
    totalPrincipalPaid: loan.totalPrincipalPaid,
    paymentCount: (loan.paymentHistory || []).filter((entry) => entry.paymentAmount > 0).length,
    lastPaymentDate: loan.lastPaymentDate,
    isFullyPaid: loan.currentBalance <= 0,
  };
}

// Helper function to get loan payment history for display
export function getLoanPaymentHistoryTable(loan: Loan) {
  return (loan.paymentHistory || []).map((entry) => ({
    date: entry.depositDate,
    daysSinceLast: entry.daysSinceLast,
    balanceBefore: entry.balanceBefore,
    interest: entry.interestForPeriod,
    totalDue: entry.totalDue,
    payment: entry.paymentAmount,
    newBalance: entry.newBalance,
    cumulativeInterest: entry.cumulativeInterest,
    notes: entry.notes,
    description: entry.description,
  }));
}

// Calculate loan age in human readable format
export function calculateLoanAge(loan: Loan): string {
  const startDate = new Date(loan.startDate);
  const today = new Date();

  if (today < startDate) {
    return 'Not started yet';
  }

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  let days = today.getDate() - startDate.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

  if (parts.length === 0) return 'Today';

  return parts.join(', ');
}
