import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

export const getCookedStock = async () => {
  const response = await fetch(`${baseUrl}/api/production/stock`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch stock');
  return await response.json();
};

export const createProductionBatch = async (data) => {
  const response = await fetch(`${baseUrl}/api/production`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Production failed');
  }
  return await response.json();
};
