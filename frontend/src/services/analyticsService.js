import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

export const getDashboardData = async (timeframe = 'weekly') => {
  const response = await fetch(`${baseUrl}/api/analytics/dashboard?timeframe=${timeframe}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch analytics data');
  return await response.json();
};
