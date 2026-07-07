import React, { useState, useEffect } from 'react';
import { getRecipes, addRecipe, deleteRecipe, updateRecipe, restoreRecipe, getArchivedRecipes } from '../services/recipeService';
import { getIngredients } from '../services/ingredientsService';
import { translateUnit } from '../utils/translations';

const Recipes = ({ user }) => {
  const isManager = user?.role === 'MANAGER';

  const [recipes, setRecipes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State pentru a ști ce rețetă vizualizăm
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // State pentru a ști ce rețetă edităm
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [archivedRecipes, setArchivedRecipes] = useState([]);

  // State pentru formularul de Creare/Editare
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [chefNotes, setChefNotes] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [currentIngredientId, setCurrentIngredientId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');

  const loadData = async () => {
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
    e.preventDefault();
    if (!currentIngredientId || !currentQuantity) return;

    const alreadyExists = selectedIngredients.some(
      (item) => item.ingredient_id === Number(currentIngredientId)
    );
    if (alreadyExists) {
      alert('Acest ingredient există deja în rețetă!');
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

  const handleEditClick = () => {
    setRecipeName(selectedRecipe.name);
    setRecipeDescription(selectedRecipe.description || '');
    setChefNotes(selectedRecipe.chef_notes || '');
    setSelectedIngredients(selectedRecipe.ingredients);
    setEditingRecipeId(selectedRecipe.id);
    setSelectedRecipe(null); // Ieșim din modul "Read-Only" și intrăm în Configurator
  };

  const handleSubmitRecipe = async (e) => {
    e.preventDefault();
    if (selectedIngredients.length === 0) {
      alert('Te rugăm să adaugi cel puțin un ingredient în rețetă.');
      return;
    }
    try {
      const recipePayload = {
        name: recipeName,
        description: recipeDescription,
        chef_notes: chefNotes,
        ingredients: selectedIngredients,
      };

      if (editingRecipeId) {
        await updateRecipe(editingRecipeId, recipePayload);
      } else {
        await addRecipe(recipePayload);
      }

      // Resetăm formularul
      setRecipeName('');
      setRecipeDescription('');
      setChefNotes('');
      setSelectedIngredients([]);
      setEditingRecipeId(null);
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să arhivezi această rețetă? Ea va fi mutată în secțiunea de rețete arhivate.')) return;
    try {
      await deleteRecipe(id);
      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe(null);
      }
      loadData();
      loadArchivedRecipes();
    } catch (error) {
      alert(error.message);
    }
  };

  const loadArchivedRecipes = async () => {
    try {
      const data = await getArchivedRecipes();
      setArchivedRecipes(data);
    } catch (error) {
      console.error('Error loading archived recipes:', error);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('Vrei să restaurezi această rețetă?')) return;
    try {
      await restoreRecipe(id);
      loadData();
      loadArchivedRecipes();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setEditingRecipeId(null);
    setRecipeName('');
    setRecipeDescription('');
    setSelectedIngredients([]);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading)
    return <div className="text-slate-500 font-body p-8">Se încarcă rețetarul...</div>;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden h-[calc(100vh-8rem)]">
      {/* LEFT PANEL: Recipe Vault (Master List) */}
      <section className="w-full lg:w-1/3 xl:w-1/4 flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-hidden h-full min-h-[500px] shadow-sm">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-manrope text-2xl font-bold text-slate-900">Lista de Rețete</h2>
            {isManager && (
              <button
                onClick={() => handleSelectRecipe(null)}
                className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                title="Creează Rețetă Nouă"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            )}
          </div>
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none"
              placeholder="Filtrează rețete..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-4 scrollbar-hide">
          {filteredRecipes.map((recipe) => {
            const isActive = selectedRecipe?.id === recipe.id;
            return (
              <button
                key={recipe.id}
                onClick={() => handleSelectRecipe(recipe)}
                className={`w-full text-left rounded-lg p-4 transition-all flex flex-col gap-1 relative overflow-hidden group border ${
                  isActive
                    ? 'bg-white shadow-md border-slate-200'
                    : 'bg-transparent border-transparent hover:bg-slate-200/50 hover:border-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-600"></div>
                )}
                <div className="flex justify-between items-start w-full">
                  <span
                    className={`font-manrope font-bold text-base ${
                      isActive ? 'text-slate-900' : 'text-slate-700'
                    } truncate pr-2`}
                  >
                    {recipe.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase shrink-0">
                    {recipe.ingredients.length} Ing.
                  </span>
                </div>
                {recipe.description && (
                  <span className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {recipe.description}
                  </span>
                )}
              </button>
            );
          })}
          {filteredRecipes.length === 0 && (
            <div className="text-center text-sm text-slate-400 mt-8">Nicio rețetă găsită.</div>
          )}
        </div>

        {/* Archived Recipes Toggle */}
        {isManager && (
          <div className="mt-2 border-t border-slate-200 pt-3">
            <button
              onClick={() => {
                setShowArchived(!showArchived);
                if (!showArchived) loadArchivedRecipes();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">archive</span>
                Arhivate ({archivedRecipes.length})
              </span>
              <span className="material-symbols-outlined text-[16px]">
                {showArchived ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {showArchived && (
              <div className="space-y-1 mt-1">
                {archivedRecipes.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-3">Nicio rețetă arhivată.</div>
                ) : (
                  archivedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <span className="text-sm text-slate-500 font-medium line-through">{recipe.name}</span>
                      <button
                        onClick={() => handleRestore(recipe.id)}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">restore</span>
                        Restaurează
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* RIGHT PANEL: Detail / Configuration */}
      <section className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-6 h-full overflow-y-auto pb-10 scrollbar-hide pr-2">
        {/* Header Card cu fix pentru overflow */}
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full shrink-0">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Wrapper flexibil min-w-0 previne overflow-ul input-urilor lungi */}
          <div className="flex flex-col gap-2 relative z-10 flex-1 min-w-0 w-full max-w-full">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold tracking-wider uppercase text-orange-700 bg-orange-100 px-2.5 py-1 rounded-sm">
                {selectedRecipe
                  ? 'Rețetă Activă'
                  : editingRecipeId
                  ? 'Editare Rețetă'
                  : 'Rețetă Nouă'}
              </span>
            </div>

            {selectedRecipe ? (
              <div className="w-full break-words">
                <h1 className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight break-words whitespace-normal">
                  {selectedRecipe.name}
                </h1>
                <p className="text-slate-600 text-sm mt-1 max-w-xl break-words whitespace-normal">
                  {selectedRecipe.description || 'Nicio descriere adăugată.'}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-full">
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Introdu Numele Rețetei..."
                  className="font-manrope text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 outline-none w-full text-ellipsis overflow-hidden"
                />
                {/* Textarea în loc de input pentru a forța textul lung pe mai multe rânduri */}
                <textarea
                  rows="2"
                  value={recipeDescription}
                  onChange={(e) => setRecipeDescription(e.target.value)}
                  placeholder="Adaugă o scurtă descriere..."
                  className="text-slate-600 text-sm mt-1 w-full bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-400 outline-none resize-none break-words"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Configuration Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Ingredients Table Section */}
          <div className="xl:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-manrope text-xl font-bold text-slate-900">
                Ingrediente pentru un Lot
              </h3>
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                Producție: 50 L
              </span>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-t-md text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-6">Nume Ingredient</div>
              <div className="col-span-2 text-right">Cantitate</div>
              <div className="col-span-2">U.M.</div>
              {isManager && <div className="col-span-2 text-right">Acțiune</div>}
            </div>

            {/* Table Body */}
            <div className="flex flex-col border-b border-slate-100">
              {(selectedRecipe ? selectedRecipe.ingredients : selectedIngredients).map(
                (ing, index) => (
                  <div
                    key={ing.ingredient_id || index}
                    className={`grid grid-cols-12 gap-4 px-4 py-4 items-center transition-colors rounded-sm group ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <div className="col-span-6 font-medium text-sm text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-[16px]">eco</span>
                      </div>
                      {ing.name}
                    </div>
                    <div className="col-span-2 text-right font-semibold text-teal-700">
                      {ing.quantity_required}
                    </div>
                    <div className="col-span-2 text-sm text-slate-500">{translateUnit(ing.unit_of_measure)}</div>
                    {isManager && (
                      <div className="col-span-2 text-right">
                        {!selectedRecipe && (
                          <button
                            onClick={() => handleRemoveDraftIngredient(ing.ingredient_id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {!selectedRecipe && selectedIngredients.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">
                  Niciun ingredient adăugat.
                </div>
              )}
            </div>

            {/* Add Ingredient Input (DOAR ÎN CREATE/EDIT MODE) */}
            {!selectedRecipe && isManager && (
              <div className="mt-8 pt-6 relative border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                  Adaugă Ingredient din Nomenclator
                </label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <select
                      value={currentIngredientId}
                      onChange={(e) => setCurrentIngredientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-colors"
                    >
                      <option value="">-- Selectează Ingredient --</option>
                      {availableIngredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({translateUnit(ing.unit_of_measure)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    placeholder="Cant."
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    step="0.01"
                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-orange-600 transition-colors"
                  />
                  <button
                    onClick={handleAddIngredientToRecipe}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Configuration Panel */}
          <div className="flex flex-col gap-6">
            {/* Chef's Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
              <h3 className="font-manrope text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">menu_book</span>
                Notițele Bucătarului
              </h3>
              <div className="flex-1 min-h-[200px] bg-slate-50 rounded-lg p-4 border border-slate-100">
                {selectedRecipe ? (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {selectedRecipe.chef_notes || 'Fără instrucțiuni speciale.'}
                  </p>
                ) : isManager ? (
                  <textarea
                    value={chefNotes}
                    onChange={(e) => setChefNotes(e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-900 placeholder:text-slate-400 resize-none outline-none leading-relaxed"
                    placeholder="Introdu instrucțiuni de producție sau note pentru garnitură..."
                  />
                ) : null}
              </div>
            </div>

            {/* Action Card (Publishing) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
              <h3 className="font-manrope text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
                INFORMAȚII REȚETĂ
              </h3>
              <div className="flex flex-col gap-4">
                {selectedRecipe ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-teal-700 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span> Activă
                      </span>
                    </div>
                    {isManager && (
                      <>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <button
                          onClick={handleEditClick}
                          className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Editează Rețeta
                        </button>
                        <button
                          onClick={() => handleDelete(selectedRecipe.id)}
                          className="w-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-200"
                        >
                          <span className="material-symbols-outlined text-[18px]">archive</span>
                          Arhivează Rețeta
                        </button>
                      </>
                    )}
                  </>
                ) : isManager ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>{' '}
                        {editingRecipeId ? 'În Editare' : 'Nouă'}
                      </span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <button
                      onClick={handleSubmitRecipe}
                      className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {editingRecipeId ? 'Actualizează Rețeta' : 'Salvează Rețeta'}
                    </button>
                    {/* Buton de Cancel Edit */}
                    {editingRecipeId && (
                      <button
                        onClick={() => handleSelectRecipe(null)}
                        className="w-full bg-slate-100 text-slate-600 hover:bg-slate-200 py-3 rounded-lg font-bold text-sm transition-colors mt-2"
                      >
                        Anulează
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Recipes;
