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

export const getComparisonData = async (timeframe = 'weekly', recipeId = null) => {
  let url = `${baseUrl}/api/analytics/comparison?timeframe=${timeframe}`;
  if (recipeId) url += `&recipe_id=${recipeId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch comparison data');
  return await response.json();
};
