import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard Gatuno' },
    { path: '/transactions', icon: '🐾', label: 'Huellas Financieras' },
    { path: '/categories', icon: '💖', label: 'Categorías Gatunas' },
    { path: '/scheduled', icon: '💸', label: 'Gastos Programados' },
    { path: '/reports', icon: '⭐', label: 'Reportes' },
    { path: '/settings', icon: '👑', label: 'Configuración' }
  ];

  return (
    <nav className="sidebar">
      <div className="logo">
        <h2>🐱 Finanzas Gatunas</h2>
      </div>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
