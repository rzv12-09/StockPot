export const getIngredients = async () => {
  const baseUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${baseUrl}/api/ingredients`);
  if (!response.ok) {
    throw new Error('Failed to fetch inredients from server');
  }
  return await response.json();
};
