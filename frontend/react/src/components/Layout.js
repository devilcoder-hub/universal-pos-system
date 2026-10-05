import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Layout({ children }) {
  const [activeNav, setActiveNav] = useState(window.location.pathname);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/orders', label: 'Orders', icon: '🛒' },
    { path: '/reports', label: 'Reports', icon: '📈' },
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Universal POS</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Admin Panel</p>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <a
                onClick={() => {
                  setActiveNav(item.path);
                  navigate(item.path);
                }}
                className={`nav-link ${activeNav === item.path ? 'active' : ''}`}
              >
                <span>{item.icon}</span> {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div></div>
          <div className="topbar-right">
            <div className="user-info">
              <span>👤 Admin</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Layout;
