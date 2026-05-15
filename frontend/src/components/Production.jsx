import React, { useState, useEffect } from 'react';
import { getRecipes } from '../services/recipeService';
import { createProductionBatch, getProductionPreview } from '../services/productionService';

const Production = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [quantity, setQuantity] = useState(1);

  // State-uri noi pentru Preview
  const [previewData, setPreviewData] = useState([]);
  const [canProduce, setCanProduce] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Încărcarea inițială (Doar Rețete)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const recipesData = await getRecipes();
      setRecipes(recipesData);
      if (recipesData.length > 0) setSelectedRecipe(recipesData[0].id);
    } catch (err) {
      setError('Failed to load data. ' + err.message);
    }
  };

  // 2. Efectul "Ascultător" - Se activează când schimbi rețeta sau cantitatea
  useEffect(() => {
    if (selectedRecipe && quantity > 0) {
      fetchPreview();
    }
  }, [selectedRecipe, quantity]);

  const fetchPreview = async () => {
    setIsPreviewLoading(true);
    try {
      const data = await getProductionPreview({
        recipe_id: selectedRecipe,
        quantity_produced: quantity,
      });
      setPreviewData(data.ingredients);
      setCanProduce(data.canProduce); // Dacă avem stoc pe minus, asta va fi "false"
    } catch (err) {
      console.error(err);
      setPreviewData([]);
      setCanProduce(false);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // 3. Confirmarea producției reale
  const handleProduction = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await createProductionBatch({
        recipe_id: selectedRecipe,
        quantity_produced: quantity,
      });
      // Confirmare vizuală pentru câte marmite au ajuns efectiv în frigider
      setSuccess(`Production batch recorded! Added ${quantity * 10} soup pots to inventory.`);
      setQuantity(1); // Resetăm cantitatea
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 relative">
      {/* Header Pagină */}
      <div className="mb-8">
        <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Daily Production
        </h2>
        <p className="font-body text-slate-500 text-sm max-w-2xl">
          Select recipes and batch quantities to deduct ingredients from inventory.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 animate-fade-in-down font-body text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 animate-fade-in-down font-body text-sm font-medium">
          {success}
        </div>
      )}

      {/* Secțiunea Principală - Grid gap-6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* ZONA DE FORMULAR - Padding p-6 */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1">
            <h3 className="font-manrope text-xl font-bold mb-6 text-slate-900 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-orange-600 text-[22px]">
                restaurant_menu
              </span>
              Recipe Configuration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider font-manrope">
                  Select Recipe
                </label>
                <div className="relative">
                  <select
                    value={selectedRecipe}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-10 text-slate-900 font-body text-sm focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 appearance-none transition-colors cursor-pointer"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider font-manrope">
                    Batch Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 text-center text-xl font-bold font-manrope focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider font-manrope">
                    Soup Pots Produced
                  </label>
                  <div className="w-full bg-slate-100 rounded-lg py-3 px-4 text-slate-900 text-center text-xl font-bold font-manrope">
                    {quantity * 10}{' '}
                    <span className="text-sm font-normal text-slate-500 font-body">Soup pots</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONA DE PREVIEW - Padding p-6, stil similar Ingredients */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sticky top-24">
            <h3 className="font-manrope text-lg font-bold mb-1 text-slate-900">
              Stock Deduction Preview
            </h3>
            <p className="font-body text-slate-500 text-sm mb-6 pb-4 border-b border-slate-100">
              Review ingredients before confirming.
            </p>

            {/* Listă Dinamică Ingrediente */}
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {isPreviewLoading ? (
                <div className="flex justify-center py-6 text-orange-600">
                  <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
                </div>
              ) : previewData.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-4 font-body">
                  No ingredients required for this recipe.
                </p>
              ) : (
                previewData.map((item, index) => {
                  const isShortage = Number(item.projected_stock) < 0;

                  return (
                    <div key={index} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isShortage ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isShortage ? 'local_fire_department' : 'kitchen'}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              isShortage ? 'text-red-700' : 'text-slate-800'
                            }`}
                          >
                            {item.ingredient_name}
                          </p>
                          <p className="text-xs text-slate-500 font-body">
                            Current: {item.current_stock}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${
                            isShortage ? 'text-red-600' : 'text-teal-700'
                          }`}
                        >
                          - {item.total_needed}
                        </p>
                        <p
                          className={`text-xs font-bold transition-colors ${
                            isShortage
                              ? 'text-red-600'
                              : 'text-slate-300 group-hover:text-slate-500'
                          }`}
                        >
                          New: {item.projected_stock}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mesaj de eroare stoc */}
            {!canProduce && !isPreviewLoading && previewData.length > 0 && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Insufficient stock for one or more ingredients!
              </div>
            )}

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleProduction}
                disabled={isLoading || isPreviewLoading || !canProduce || previewData.length === 0}
                className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white rounded-lg py-4 px-6 font-bold font-manrope text-lg shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-xl">refresh</span>
                ) : (
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {canProduce ? 'check_circle' : 'block'}
                  </span>
                )}
                {isLoading ? 'Processing...' : 'Confirm Production'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 font-body">
                This action will immediately update ingredient inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;
