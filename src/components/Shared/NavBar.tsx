import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

const navConfig: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'People', path: '/people' },
  { label: 'Loans', path: '/loans' },
  { label: 'Cities', path: '/city' },
];

const NavBar: React.FC = () => {
  return (
    <nav className="flex gap-4 px-4 py-2 bg-gray-50 border-b">
      {navConfig.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `px-3 py-1 rounded text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar;
