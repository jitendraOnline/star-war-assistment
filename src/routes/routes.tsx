import AddPersonPage from '@/features/people/AddPersonPage';
import EditPersonPage from '@/features/people/EditPersonPage';
import PeopleListPage from '@/features/people/PeopleListPage';
import LoanListPage from '@/features/loan/LoanListPage';
import AddLoanPage from '@/features/loan/AddLoanPage';
import EditLoanPage from '@/features/loan/EditLoanPage';
import UserLoanDashboard from '@/features/loan/UserLoanDashboard';
import UserLoanDetailsPage from '@/features/loan/UserLoanDetailsPage';
import UserDepositPage from '@/features/loan/UserDepositPage';
import LoginPage from '@/pages/LoginPage';
import { Navigate, Outlet, type RouteObject } from 'react-router-dom';

import AuthGuard from './AuthGuard';
import { DataProvider } from '@/contexts/DataContext';
import { CitiesProvider } from '@/contexts/CitiesContext';
import { UserProvider } from '@/contexts/UserContext';

import CityListPage from '@/features/city/CityListPage';
import NavBar from '@/components/Shared/NavBar';
// Custom hook to get current user and loading state

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    errorElement: <div>Some Error Occured in Application</div>,
    element: (
      <AuthGuard>
        <UserProvider>
          <CitiesProvider>
            <DataProvider>
              <div className="flex h-[100vh] w-[100vw] flex-col">
                <NavBar />
                <main className="flex-1 overflow-auto p-4 bg-white/80">
                  <Outlet />
                </main>
              </div>
            </DataProvider>
          </CitiesProvider>
        </UserProvider>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <UserLoanDashboard />,
      },
      {
        path: 'city',
        element: <CityListPage />, // Updated to use standard ES import
      },
      {
        path: 'people',
        element: <PeopleListPage />,
      },
      {
        path: 'people/add',
        element: <AddPersonPage />,
      },
      {
        path: 'people/edit/:id',
        element: <EditPersonPage />,
      },
      {
        path: 'people/:id',
        element: <div>People Details</div>,
      },
      {
        path: 'users/:personId/loans',
        element: <UserLoanDetailsPage />,
      },
      {
        path: 'users/:personId/deposit',
        element: <UserDepositPage />,
      },
      {
        path: 'loans',
        element: <LoanListPage />,
      },
      {
        path: 'loans/add',
        element: <AddLoanPage />,
      },
      {
        path: 'loans/edit/:id',
        element: <EditLoanPage />,
      },
    ],
  },
];
