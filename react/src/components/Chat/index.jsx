import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../../api/messages';
import { getToken, getProfile, logout } from '../../api/auth';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const editInputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await getMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setIsAuthenticated(false);
      } else {
        setError('Не удалось загрузить сообщения');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const profile = await getProfile();
      setCurrentUser(profile);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchCurrentUser();
      fetchMessages();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [fetchCurrentUser, fetchMessages]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await sendMessage(newMessage.trim());
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStartEdit = (message) => {
    setEditingId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingContent.trim()) return;

    try {
      const updatedMessage = await editMessage(editingId, editingContent.trim());
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editingId ? updatedMessage : msg))
      );
      handleCancelEdit();
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это сообщение?')) return;

    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const isOwnMessage = (message) => {
    return currentUser && message.author === currentUser.username;
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
        <div className="chat-login-required">
          <div className="chat-login-icon">🔐</div>
          <h2 className="chat-login-title">Требуется авторизация</h2>
          <p className="chat-login-subtitle">
            Для доступа к чату необходимо войти в систему
          </p>
          <Link to="/login" className="chat-login-btn">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" data-easytag="id1-react/src/components/Chat/index.jsx">
      <header className="chat-header">
        <div className="chat-header-left">
          <span className="chat-channel-icon">#</span>
          <h1 className="chat-channel-name">общий</h1>
        </div>
        <div className="chat-header-right">
          {currentUser && (
            <div className="chat-user-info">
              <div className="chat-user-avatar">
                {getInitials(currentUser.username)}
              </div>
              <span className="chat-username">{currentUser.username}</span>
            </div>
          )}
          <button className="chat-logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="chat-messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-loading">
            <div className="chat-loading-spinner" />
          </div>
        ) : error ? (
          <div className="chat-error">
            <div className="chat-error-icon">⚠️</div>
            <p className="chat-error-text">{error}</p>
            <button className="chat-retry-btn" onClick={fetchMessages}>
              Попробовать снова
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <h3 className="chat-empty-title">Добро пожаловать в #общий</h3>
            <p className="chat-empty-subtitle">
              Это начало канала. Напишите первое сообщение!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="chat-message">
                <div className="chat-message-avatar">
                  {getInitials(message.author)}
                </div>
                <div className="chat-message-content">
                  <div className="chat-message-header">
                    <span className="chat-message-author">{message.author}</span>
                    <span className="chat-message-time">
                      {formatTime(message.created_at)}
                    </span>
                    {message.is_edited && (
                      <span className="chat-message-edited">(изменено)</span>
                    )}
                  </div>
                  {editingId === message.id ? (
                    <div className="chat-edit-container">
                      <textarea
                        ref={editInputRef}
                        className="chat-edit-input"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        rows={1}
                      />
                      <p className="chat-edit-hint">
                        escape для{' '}
                        <span onClick={handleCancelEdit}>отмены</span> • enter для{' '}
                        <span onClick={handleSaveEdit}>сохранения</span>
                      </p>
                    </div>
                  ) : (
                    <p className="chat-message-text">{message.content}</p>
                  )}
                </div>
                {isOwnMessage(message) && editingId !== message.id && (
                  <div className="chat-message-actions">
                    <button
                      className="chat-action-btn"
                      onClick={() => handleStartEdit(message)}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      className="chat-action-btn delete"
                      onClick={() => handleDeleteMessage(message.id)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
          <textarea
            className="chat-input"
            placeholder="Написать сообщение в #общий..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={sending}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!newMessage.trim() || sending}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
