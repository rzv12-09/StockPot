import React, { useState, useEffect } from 'react';
import { getRecipes } from '../services/recipeService';
import {
  getCookedStock,
  createProductionBatch,
  getProductionPreview,
} from '../services/productionService';

const Production = () => {
  const [recipes, setRecipes] = useState([]);
  const [stock, setStock] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [quantity, setQuantity] = useState(1);

  // State-uri noi pentru Preview
  const [previewData, setPreviewData] = useState([]);
  const [canProduce, setCanProduce] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Încărcarea inițială (Rețete și Frigider)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const recipesData = await getRecipes();
      const stockData = await getCookedStock();
      setRecipes(recipesData);
      setStock(stockData);
      if (recipesData.length > 0) setSelectedRecipe(recipesData[0].id);
    } catch (err) {
      setError('Failed to load data.' + err);
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
      setSuccess('Production batch recorded! Inventory updated.');
      setQuantity(1); // Resetăm cantitatea
      fetchData(); // Reîncărcăm frigiderul
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-4xl font-manrope font-bold text-slate-900 tracking-tight mb-2">
          Daily Production
        </h2>
        <p className="text-slate-500 font-body">
          Select recipes and batch quantities to deduct ingredients from inventory.
        </p>
      </header>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* ZONA DE FORMULAR (Coloana stângă) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-manrope font-bold mb-6 text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">restaurant_menu</span>
              Recipe Configuration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Recipe
                </label>
                <div className="relative">
                  <select
                    value={selectedRecipe}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-10 text-slate-900 font-body focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 appearance-none transition-colors cursor-pointer"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Batch Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 text-center text-lg font-bold focus:bg-white focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Est. Portions
                  </label>
                  <div className="w-full bg-slate-100 rounded-lg py-3 px-4 text-slate-900 text-center text-lg font-bold">
                    {quantity * 10}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ZONA DE PREVIEW (Coloana dreaptă) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-lg font-manrope font-bold mb-1 text-slate-900">
              Stock Deduction Preview
            </h3>
            <p className="text-sm text-slate-500 font-body mb-6 pb-4 border-b border-slate-100">
              Review ingredients before confirming.
            </p>

            {/* Listă Dinamică Ingrediente */}
            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
              {isPreviewLoading ? (
                <div className="flex justify-center py-6 text-orange-600">
                  <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
                </div>
              ) : previewData.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">
                  No ingredients required for this recipe.
                </p>
              ) : (
                previewData.map((item, index) => {
                  const isShortage = Number(item.projected_stock) < 0;

                  return (
                    <div key={index} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center ${
                            isShortage ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isShortage ? 'warning' : 'kitchen'}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-medium text-sm font-body ${
                              isShortage ? 'text-red-700 font-bold' : 'text-slate-900'
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
                          className={`font-bold text-sm font-body ${
                            isShortage ? 'text-red-600' : 'text-slate-700'
                          }`}
                        >
                          - {item.total_needed}
                        </p>
                        <p
                          className={`text-xs font-bold font-body transition-colors ${
                            isShortage
                              ? 'text-red-600'
                              : 'text-slate-400 group-hover:text-slate-600'
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

            {/* Mesaj de eroare dacă nu avem stoc destul */}
            {!canProduce && !isPreviewLoading && previewData.length > 0 && (
              <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                Insufficient stock for one or more ingredients!
              </div>
            )}

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleProduction}
                // Butonul e dezactivat dacă: se încarcă ORICE, sau nu putem produce din lipsă stoc
                disabled={isLoading || isPreviewLoading || !canProduce || previewData.length === 0}
                className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white rounded-lg py-4 px-6 font-bold font-manrope text-lg shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {canProduce ? 'check_circle' : 'block'}
                  </span>
                )}
                {isLoading ? 'Processing...' : 'Confirm Production'}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3 font-body">
                This action will immediately update inventory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA FRIGORIFICĂ (Tabel Stoc) */}
      {/* ... [Tabelul rămâne neschimbat] ... */}
      <div>
        <h3 className="text-2xl font-manrope font-bold mb-6 text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">ac_unit</span>
          Cold Room Stock
        </h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Recipe Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Quantity Available
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {stock.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                    No cooked batches in the fridge yet.
                  </td>
                </tr>
              ) : (
                stock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {item.recipe_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                        {item.current_quantity} {item.unit_of_measure}s
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(item.last_updated).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Production;
