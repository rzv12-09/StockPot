import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

export const getPendingUsers = async () => {
  const response = await fetch(`${baseUrl}/api/users/pending`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch pending users');
  return await response.json();
};

export const approveUser = async (userId, role) => {
  const response = await fetch(`${baseUrl}/api/users/${userId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to approve user');
  return await response.json();
};

export const rejectUser = async (userId) => {
  const response = await fetch(`${baseUrl}/api/users/${userId}/reject`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to reject user');
  return await response.json();
};

export const getActiveUsers = async () => {
  const response = await fetch(`${baseUrl}/api/users/active`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch active users');
  return await response.json();
};
