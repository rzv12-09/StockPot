import React, { useState, useEffect } from 'react';
import { getIngredients, addIngredient, deleteIngredient } from '../services/ingredientsService';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State pentru a ascunde/arăta formularul
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    unit_of_measure: '',
    current_stock: '',
    alert_threshold: '',
  });

  const loadIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addIngredient({
        ...formData,
        current_stock: Number(formData.current_stock),
        alert_threshold: Number(formData.alert_threshold),
      });
      setFormData({ name: '', unit_of_measure: '', current_stock: '', alert_threshold: '' });
      setShowForm(false); // Ascundem formularul după salvare
      loadIngredients();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await deleteIngredient(id);
      loadIngredients();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-slate-500 font-body">Loading ingredients...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Calculăm statisticile dinamic, direct din datele tale
  const totalItems = ingredients.length;
  const lowStockItems = ingredients.filter(
    (ing) => ing.current_stock <= ing.alert_threshold
  ).length;

  return (
    <div className="flex-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Inventory Management
          </h2>
          <p className="font-body text-slate-500 text-sm max-w-2xl">
            Monitor stock levels, set minimum thresholds, and ensure continuous availability of
            essential ingredients.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 py-3 rounded-md font-manrope font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">
            {showForm ? 'close' : 'add'}
          </span>
          {showForm ? 'Cancel' : 'Add New Ingredient'}
        </button>
      </div>

      {/* Formularul ascuns (apare doar când dăm click pe butonul de mai sus) */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8 items-end animate-fade-in-down"
        >
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Potatoes"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Unit
            </label>
            <input
              type="text"
              name="unit_of_measure"
              placeholder="kg, L"
              value={formData.unit_of_measure}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Stock
            </label>
            <input
              type="number"
              name="current_stock"
              placeholder="0.00"
              value={formData.current_stock}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Alert At
            </label>
            <input
              type="number"
              name="alert_threshold"
              placeholder="0.00"
              value={formData.alert_threshold}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto bg-orange-100 text-orange-800 hover:bg-orange-200 font-bold px-6 py-2.5 rounded-lg transition-colors h-[42px]"
          >
            Save
          </button>
        </form>
      )}

      {/* Stats/Filter Row (Asymmetric) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8 flex gap-4">
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex-1 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-manrope text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">
              Total Items
            </h3>
            <div className="text-3xl font-manrope font-bold text-slate-900">{totalItems}</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex-1 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-manrope text-sm font-semibold text-red-800 mb-1 uppercase tracking-wider">
              Low Stock Alerts
            </h3>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-manrope font-bold text-red-900">{lowStockItems}</div>
              <span className="material-symbols-outlined text-red-600 mb-1 text-[20px]">
                warning
              </span>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 bg-slate-100 rounded-xl p-6 flex flex-col justify-center">
          <label className="font-manrope text-sm font-semibold text-slate-600 mb-2 block">
            Quick Filter
          </label>
          <select className="w-full bg-white border border-slate-200 rounded-lg text-sm font-body text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20">
            <option>All Categories</option>
            <option>Vegetables</option>
            <option>Meats & Proteins</option>
            <option>Spices & Seasonings</option>
            <option>Dairy</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl pb-4">
        <div className="w-full text-left font-body">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-t-xl mb-2">
            <div className="col-span-4 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ingredient Name
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Unit
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Stock
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Min. Alert
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Actions
            </div>
          </div>

          {/* Data Rows */}
          <div className="space-y-1 px-2">
            {ingredients.map((ingredient) => {
              const isLowStock = ingredient.current_stock <= ingredient.alert_threshold;

              return (
                <div
                  key={ingredient.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg items-center group relative overflow-hidden transition-colors ${
                    isLowStock
                      ? 'bg-red-50/50 border-l-4 border-red-500'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Left-side red border for low stock is handled by the border-l-4 class above */}

                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isLowStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-orange-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isLowStock ? 'local_fire_department' : 'grocery'}
                      </span>
                    </div>
                    <div>
                      <div
                        className={`font-semibold text-sm flex items-center gap-2 ${
                          isLowStock ? 'text-red-700' : 'text-slate-800'
                        }`}
                      >
                        {ingredient.name}
                        {isLowStock && (
                          <span className="material-symbols-outlined text-[16px] text-red-500">
                            warning
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 text-sm text-slate-500 font-medium">
                    {ingredient.unit_of_measure}
                  </div>

                  <div
                    className={`col-span-2 text-sm font-bold ${
                      isLowStock ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {ingredient.current_stock}
                  </div>

                  <div className="col-span-2 text-sm text-slate-500">
                    {ingredient.alert_threshold}
                  </div>

                  <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="w-8 h-8 rounded-md bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Mesaj când nu există ingrediente */}
            {ingredients.length === 0 && (
              <div className="text-center py-8 text-slate-500 font-medium">
                No ingredients found. Click "Add New Ingredient" to start!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
