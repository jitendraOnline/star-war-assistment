import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import {
  DashboardIcon,
  PeopleIcon,
  LoansIcon,
  CitiesIcon,
  LogoutIcon,
  MenuIcon,
  CloseIcon,
} from '@/components/UI/Icons';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const navConfig: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'People', path: '/people', icon: PeopleIcon },
  { label: 'Loans', path: '/loans', icon: LoansIcon },
  { label: 'Cities', path: '/city', icon: CitiesIcon },
];

const NavBar: React.FC = () => {
  const { user, logout } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-800">Loan Manager</h1>
          <div className="flex gap-4">
            {navConfig.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`
                  }
                >
                  <IconComponent size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogoutIcon size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-800">Loan Manager</h1>
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-2">
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 truncate">{user?.email}</span>
              </div>

              <div className="space-y-1">
                {navConfig.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <IconComponent size={20} />
                      {item.label}
                    </NavLink>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogoutIcon size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation (Alternative approach) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex items-center justify-around py-2">
          {navConfig.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`
                }
              >
                <IconComponent size={20} />
                <span className="hidden sm:block">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <LogoutIcon size={20} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
