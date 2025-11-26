import instance from './axios';
import { getAuthHeaders } from './auth';

/**
 * Get list of all chat messages
 * GET /api/messages/
 * isSecure: true
 * @returns {Promise<Array<{id: number, content: string, author: string, created_at: string, updated_at: string, is_edited: boolean}>>}
 */
export const getMessages = async () => {
  const response = await instance.get('/api/messages/', {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Send a new message
 * POST /api/messages/
 * isSecure: true
 * @param {string} content - Message content
 * @returns {Promise<{id: number, content: string, author: string, created_at: string, updated_at: string, is_edited: boolean}>}
 */
export const sendMessage = async (content) => {
  const response = await instance.post('/api/messages/', {
    content,
  }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Edit a message
 * PUT /api/messages/{id}/
 * isSecure: true
 * Only the author can edit their message
 * @param {number} id - Message ID
 * @param {string} content - Updated message content
 * @returns {Promise<{id: number, content: string, author: string, created_at: string, updated_at: string, is_edited: boolean}>}
 */
export const editMessage = async (id, content) => {
  const response = await instance.put(`/api/messages/${id}/`, {
    content,
  }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Delete a message
 * DELETE /api/messages/{id}/
 * isSecure: true
 * Only the author can delete their message
 * @param {number} id - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (id) => {
  await instance.delete(`/api/messages/${id}/`, {
    headers: getAuthHeaders(),
  });
};

export default {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
};
