import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getProfile, getToken } from '../../api/auth';
import './Header.css';

/**
 * Header component with navigation for authenticated users
 * Displays navigation links to Chat and Profile pages
 * Shows current username and logout button
 */
function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (token) {
          const profile = await getProfile();
          setUsername(profile.username);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header" data-easytag="id2-src/components/Header/index.jsx">
      <Link to="/chat" className="header-logo">
        <div className="header-logo-icon">S</div>
        <span>SlackChat</span>
      </Link>

      <nav className="header-nav">
        <Link 
          to="/chat" 
          className={`header-nav-link ${isActive('/chat') ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
          Чат
        </Link>
        <Link 
          to="/profile" 
          className={`header-nav-link ${isActive('/profile') ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Профиль
        </Link>
      </nav>

      <div className="header-user">
        {username && <span className="header-username">{username}</span>}
        <button 
          className="header-logout-btn" 
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Выход...' : 'Выйти'}
        </button>
      </div>
    </header>
  );
}

export default Header;
