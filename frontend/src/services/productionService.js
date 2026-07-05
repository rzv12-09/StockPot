import { getAuthHeaders } from '../utils/apiUtils';

const baseUrl = import.meta.env.VITE_API_URL;

export const getCookedStock = async () => {
  const response = await fetch(`${baseUrl}/api/production/stock`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch stock');
  return await response.json();
};

export const getProductionPreview = async (data) => {
  const response = await fetch(`${baseUrl}/api/production/preview`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch preview');
  }
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

export const updateSoupStock = async (id, newQuantity) => {
  const response = await fetch(`${baseUrl}/api/production/stock/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_quantity: newQuantity }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Eroare la actualizarea stocului.');
  }
  return await response.json();
};

export const getBatchesByRecipe = async (recipeId) => {
  const response = await fetch(`${baseUrl}/api/production/stock/batches/${recipeId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch batches');
  return await response.json();
};
