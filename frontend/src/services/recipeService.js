const baseUrl = import.meta.env.VITE_API_URL;

export const getRecipes = async () => {
  const response = await fetch(`${baseUrl}/api/recipes`);
  if (!response.ok) throw new Error('Failed to fetch recipes');
  return await response.json();
};

export const addRecipe = async (recipeData) => {
  const response = await fetch(`${baseUrl}/api/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  });
  if (!response.ok) throw new Error('Failed to add recipe');
  return await response.json();
};

export const deleteRecipe = async (id) => {
  const response = await fetch(`${baseUrl}/api/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete recipe');
  return await response.json();
};
