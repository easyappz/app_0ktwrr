import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length > 150) {
      newErrors.username = 'Имя пользователя не должно превышать 150 символов';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData.username, formData.password);
      setSuccessMessage(response.message || 'Регистрация успешна!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.username) {
          setErrors((prev) => ({
            ...prev,
            username: Array.isArray(data.username) ? data.username[0] : data.username,
          }));
        }
        if (data.password) {
          setErrors((prev) => ({
            ...prev,
            password: Array.isArray(data.password) ? data.password[0] : data.password,
          }));
        }
        if (data.detail) {
          setServerError(data.detail);
        }
        if (!data.username && !data.password && !data.detail) {
          setServerError('Ошибка при регистрации. Попробуйте снова.');
        }
      } else {
        setServerError('Ошибка сети. Проверьте подключение к интернету.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" data-easytag="id1-src/components/Auth/Register.jsx">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h1 className="auth-title">Создать аккаунт</h1>
          <p className="auth-subtitle">Присоединяйтесь к нашей платформе</p>
        </div>

        {serverError && (
          <div className="alert alert-error">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Введите имя пользователя"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
              maxLength={150}
            />
            {errors.username && (
              <div className="form-error">
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Минимум 8 символов"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="form-error">
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading && <span className="spinner"></span>}
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="auth-link">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
