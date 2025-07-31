import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { subscribeToLoans, type Loan } from '@/features/loan/loan.service';
import { subscribeToPeople, type Person } from '@/features/people/people.service';
import { useUser } from './UserContext';

interface DataContextType {
  people: Person[];
  loans: Loan[];
  peopleLoading: boolean;
  loansLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { userId } = useUser();
  const [people, setPeople] = useState<Person[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    if (!userId) return;
    setPeopleLoading(true);
    setLoansLoading(true);
    setError(null);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      // Clear data when no user is logged in
      setPeople([]);
      setLoans([]);
      setPeopleLoading(false);
      setLoansLoading(false);
      return;
    }

    setPeopleLoading(true);
    setLoansLoading(true);

    const unsubPeople = subscribeToPeople(
      userId,
      (people) => {
        setPeople(people);
        setPeopleLoading(false);
      },
      (err) => {
        setError(err.message);
        setPeopleLoading(false);
      }
    );

    const unsubLoans = subscribeToLoans(
      userId,
      (loans) => {
        setLoans(loans);
        setLoansLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoansLoading(false);
      }
    );

    return () => {
      unsubPeople();
      unsubLoans();
    };
  }, [userId]);

  const value: DataContextType = {
    people,
    loans,
    peopleLoading,
    loansLoading,
    error,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
