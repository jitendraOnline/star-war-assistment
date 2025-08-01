import React, { createContext, useContext, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import useAuthUser from '@/hooks/authHook';

interface UserContextType {
  user: User | null;
  loading: boolean;
  userId: string | null;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, loading, logout } = useAuthUser();

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        userId: user?.uid || null,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
