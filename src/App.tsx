import './App.css';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import CharacterDetailsPage from './pages/CharacterDetailPage';
import CharacterListPage from './pages/CharacterListPage';

const AppLayout = () => {
  return (
    <div className="flex h-[100vh] w-[100vw] flex-col">
      <header className="p-4 bg-gray-100 text-lg font-bold border-b">Allica Bank</header>
      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
