import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, logout, getToken } from '../../api/auth';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Не удалось загрузить профиль. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id1-src/components/Profile/index.jsx">
        <div className="profile-card">
          <div className="profile-loading">
            <div className="profile-spinner"></div>
            <span className="profile-loading-text">Загрузка профиля...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container" data-easytag="id1-src/components/Profile/index.jsx">
        <div className="profile-card">
          <div className="profile-error">
            <div className="profile-error-icon">⚠️</div>
            <p className="profile-error-text">{error}</p>
            <button 
              className="profile-btn profile-btn-primary"
              onClick={fetchProfile}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id1-src/components/Profile/index.jsx">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitial(profile?.username)}
          </div>
          <h1 className="profile-title">Профиль</h1>
          <p className="profile-subtitle">Информация о вашем аккаунте</p>
        </div>

        <div className="profile-info">
          <div className="profile-info-item">
            <div className="profile-info-icon">👤</div>
            <div className="profile-info-content">
              <div className="profile-info-label">Имя пользователя</div>
              <div className="profile-info-value">{profile?.username || '—'}</div>
            </div>
          </div>

          <div className="profile-info-item">
            <div className="profile-info-icon">📅</div>
            <div className="profile-info-content">
              <div className="profile-info-label">Дата регистрации</div>
              <div className="profile-info-value">{formatDate(profile?.date_joined)}</div>
            </div>
          </div>

          {profile?.email && (
            <div className="profile-info-item">
              <div className="profile-info-icon">✉️</div>
              <div className="profile-info-content">
                <div className="profile-info-label">Email</div>
                <div className="profile-info-value">{profile.email}</div>
              </div>
            </div>
          )}

          {(profile?.first_name || profile?.last_name) && (
            <div className="profile-info-item">
              <div className="profile-info-icon">🏷️</div>
              <div className="profile-info-content">
                <div className="profile-info-label">Полное имя</div>
                <div className="profile-info-value">
                  {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button
            className="profile-btn profile-btn-primary"
            onClick={handleBackToChat}
          >
            💬 Назад в чат
          </button>

          <button
            className="profile-btn profile-btn-danger"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? '⏳ Выход...' : '🚪 Выйти из аккаунта'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
