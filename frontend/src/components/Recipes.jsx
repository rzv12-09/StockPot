import React, { useState, useEffect } from 'react';
import { getRecipes, addRecipe, deleteRecipe } from '../services/recipeService';
import { getIngredients } from '../services/ingredientsService';

const Recipes = () => {
  // ... [Toată logica ta de state și funcțiile loadData, handleSubmit, etc. rămân EXACT LA FEL cum le-ai atașat] ...
  const [recipes, setRecipes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [currentIngredientId, setCurrentIngredientId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');

  const loadData = async () => {
    /* ... logica ta ... */
    try {
      const [recipesData, ingredientsData] = await Promise.all([getRecipes(), getIngredients()]);
      setRecipes(recipesData);
      setAvailableIngredients(ingredientsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  const handleAddIngredientToRecipe = (e) => {
    /* ... logica ta ... */
    e.preventDefault();
    if (!currentIngredientId || !currentQuantity) return;
    const alreadyExists = selectedIngredients.some(
      (item) => item.ingredient_id === Number(currentIngredientId)
    );
    if (alreadyExists) {
      alert('Already exists!');
      return;
    }
    const ingredientInfo = availableIngredients.find((i) => i.id === Number(currentIngredientId));
    setSelectedIngredients([
      ...selectedIngredients,
      {
        ingredient_id: Number(currentIngredientId),
        name: ingredientInfo.name,
        unit_of_measure: ingredientInfo.unit_of_measure,
        quantity_required: Number(currentQuantity),
      },
    ]);
    setCurrentIngredientId('');
    setCurrentQuantity('');
  };
  const handleRemoveDraftIngredient = (id) => {
    setSelectedIngredients(selectedIngredients.filter((item) => item.ingredient_id !== id));
  };

  const handleSubmitRecipe = async (e) => {
    /* ... logica ta ... */
    e.preventDefault();
    if (selectedIngredients.length === 0) {
      alert('Add at least one ingredient');
      return;
    }
    try {
      await addRecipe({
        name: recipeName,
        description: recipeDescription,
        ingredients: selectedIngredients,
      });
      setRecipeName('');
      setRecipeDescription('');
      setSelectedIngredients([]);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };
  const handleDelete = async (id) => {
    /* ... logica ta ... */
    if (!window.confirm('Delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (isLoading) return <div className="text-slate-500 font-body">Loading recipes data...</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-manrope text-4xl lg:text-5xl text-orange-900 font-bold tracking-tight mb-2">
            Recipes Management
          </h2>
          <p className="font-body text-slate-500 text-lg">
            Create, edit, and manage your culinary formulas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Create Recipe Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-100">
            <h3 className="font-manrope text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">add_circle</span>
              Create New Recipe
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Recipe Name (e.g. Classic Beef Ciorba)"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 text-sm font-medium"
              />
              <textarea
                placeholder="Brief description or instructions..."
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 text-sm min-h-[100px] resize-none"
              />
            </div>

            <div className="bg-orange-50/50 rounded-xl p-5 mb-6 border border-orange-100">
              <h4 className="font-manrope text-sm font-bold text-orange-900 mb-3">
                Add Ingredients
              </h4>
              <div className="flex flex-col gap-3">
                <select
                  value={currentIngredientId}
                  onChange={(e) => setCurrentIngredientId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                >
                  <option value="">-- Select from Inventory --</option>
                  {availableIngredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit_of_measure})
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    step="0.01"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredientToRecipe}
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200 font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1 text-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
              </div>
            </div>

            {selectedIngredients.length > 0 && (
              <div className="mb-6">
                <h4 className="font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Draft List
                </h4>
                <ul className="flex flex-col gap-2">
                  {selectedIngredients.map((item) => (
                    <li
                      key={item.ingredient_id}
                      className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-lg text-sm border border-slate-100"
                    >
                      <span className="font-medium text-slate-700">
                        {item.name}{' '}
                        <span className="text-slate-400 font-normal">
                          ({item.quantity_required} {item.unit_of_measure})
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftIngredient(item.ingredient_id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-base block">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleSubmitRecipe}
              className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">save</span> Save Recipe
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Existing Recipes Grid */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                  </div>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl block">delete</span>
                  </button>
                </div>
                <div className="mb-4">
                  <h3 className="font-manrope text-xl font-extrabold text-slate-800 tracking-tight leading-tight">
                    {recipe.name}
                  </h3>
                  {recipe.description && (
                    <p className="font-body text-slate-500 text-sm mt-2 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <p className="font-manrope text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Ingredients
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing) => (
                      <span
                        key={ing.ingredient_id}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md"
                      >
                        {ing.name}: {ing.quantity_required}
                        {ing.unit_of_measure}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Recipes;
