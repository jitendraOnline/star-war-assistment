import CharacterDetailsPage from '@/pages/CharacterDetailPage';
import CharacterListPage from '@/pages/CharacterListPage';

import { Navigate, Outlet, type RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    errorElement: <div>Some Error Occured in Application</div>,
    element: (
      <div className="flex h-[100vh] w-[100vw] flex-col">
        <header className="p-4 bg-gray-100 text-lg font-bold border-b">Allica Bank</header>
        <main className="flex-1 overflow-auto p-4 bg-white/80">
          <Outlet />
        </main>
      </div>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/characters" replace />,
      },
      {
        path: 'characters',
        element: <CharacterListPage />,
      },
      {
        path: 'characters/:id',
        element: <CharacterDetailsPage />,
      },
    ],
  },
];
