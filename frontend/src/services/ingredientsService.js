const baseUrl = import.meta.env.VITE_API_URL;

export const getIngredients = async () => {
  const response = await fetch(`${baseUrl}/api/ingredients`);
  if (!response.ok) {
    throw new Error('Failed to fetch inredients from server');
  }
  return await response.json();
};

export const addIngredient = async (ingredientData) => {
  const response = await fetch(`${baseUrl}/api/ingredients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredientData),
  });
  if (!response.ok) throw new Error('Failed to add ingredient');
  return await response.json();
};

export const updateIngredient = async (id, ingredientData) => {
  const response = await fetch(`${baseUrl}/api/ingredients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredientData),
  });
  if (!response.ok) throw new Error('Failed to update ingredient');
  return await response.json();
};

export const deleteIngredient = async (id) => {
  const response = await fetch(`${baseUrl}/api/ingredients/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete ingredient');
  return await response.json();
};
