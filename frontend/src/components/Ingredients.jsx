import React, { useState, useEffect } from 'react';
import { getIngredients, addIngredient, deleteIngredient } from '../services/ingredientsService';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // State pentru Modal
  const [showForm, setShowForm] = useState(false);

  // State formular
  const [formData, setFormData] = useState({
    name: '',
    category: '',
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
      // Resetăm formularul și închidem modalul
      setFormData({
        name: '',
        category: '',
        unit_of_measure: '',
        current_stock: '',
        alert_threshold: '',
      });
      setShowForm(false);
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

  // 1. Filtrăm lista bazat pe categoria selectată
  const filteredIngredients =
    selectedCategory === 'All Categories'
      ? ingredients
      : ingredients.filter((ing) => ing.category === selectedCategory);

  // 2. Calculăm statisticile folosind DOAR lista filtrată
  const totalItems = filteredIngredients.length;
  const lowStockItems = filteredIngredients.filter(
    (ing) => Number(ing.current_stock) <= Number(ing.alert_threshold)
  ).length;

  return (
    <div className="flex-1 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Inventory Management
          </h2>
          <p className="font-body text-slate-500 text-sm max-w-2xl">
            Manage your ingredients and stock levels.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 py-3 rounded-md font-manrope font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Add New Ingredient
        </button>
      </div>

      {/* Stats/Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8 flex gap-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1 transition-all">
            <p className="font-body text-sm font-semibold text-slate-500 mb-1">Total Ingredients</p>
            <div className="text-2xl font-manrope font-bold text-orange-600">{totalItems}</div>
          </div>
          {lowStockItems > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex-1 relative overflow-hidden transition-all shadow-sm">
              {/* Efectul de blur roșu în colț */}
              <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <p className="font-body text-sm font-semibold text-red-800 mb-1 relative z-10">
                Low Stock Alerts
              </p>
              <div className="flex items-center gap-2 relative z-10">
                <div className="text-2xl font-manrope font-bold text-red-600">{lowStockItems}</div>
                <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1 transition-all">
              <p className="font-body text-sm font-semibold text-slate-500 mb-1">
                Low Stock Alerts
              </p>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-manrope font-bold text-slate-300">0</div>
                <span className="material-symbols-outlined text-slate-300 text-[20px]">
                  check_circle
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-4 bg-slate-100 rounded-xl p-6 flex flex-col justify-center">
          <label className="font-manrope text-sm font-semibold text-slate-600 mb-2 block">
            Quick Filter
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg text-sm font-body text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Dairy & Eggs">Dairy & Eggs</option>
            <option value="Dry Goods">Dry Goods</option>
            <option value="Spices & Herbs">Spices & Herbs</option>
            <option value="Liquids">Liquids</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl pb-4">
        <div className="w-full text-left font-body">
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

          <div className="space-y-1 px-2">
            {/* 3. Folosim filteredIngredients în loc de ingredients */}
            {filteredIngredients.map((ingredient) => {
              const isLowStock =
                Number(ingredient.current_stock) <= Number(ingredient.alert_threshold);

              return (
                <div
                  key={ingredient.id}
                  className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg items-center group relative overflow-hidden transition-colors ${
                    isLowStock
                      ? 'bg-red-50/50 border-l-4 border-red-500'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
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
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {ingredient.category}
                      </span>
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

            {/* Mesajul este actualizat pentru a reflecta filtrarea */}
            {filteredIngredients.length === 0 && (
              <div className="text-center py-8 text-slate-500 font-medium">
                No ingredients found in this category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY - Se randează doar dacă showForm este true */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          {/* Modal Container */}
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-manrope text-2xl font-bold text-slate-900">
                  Add New Ingredient
                </h2>
                <p className="font-body text-sm text-slate-500 mt-1">
                  Enter the details for the new inventory item.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-orange-50 focus:outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 flex-1 overflow-y-auto">
              <form id="addIngredientForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Ingredient Name */}
                <div>
                  <label
                    className="block font-body text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="name"
                  >
                    Ingredient Name
                  </label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Organic Carrots"
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-body text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category Dropdown */}
                  <div>
                    <label
                      className="block font-body text-sm font-semibold text-slate-700 mb-2"
                      htmlFor="category"
                    >
                      Category
                    </label>
                    <div className="relative">
                      <select
                        required
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-10 text-slate-900 font-body text-sm appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all cursor-pointer"
                      >
                        <option disabled value="">
                          Select category
                        </option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Meat & Poultry">Meat & Poultry</option>
                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                        <option value="Dry Goods">Dry Goods</option>
                        <option value="Spices & Herbs">Spices & Herbs</option>
                        <option value="Liquids">Liquids</option>
                        <option value="General">General</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Unit of Measure Dropdown */}
                  <div>
                    <label
                      className="block font-body text-sm font-semibold text-slate-700 mb-2"
                      htmlFor="unit_of_measure"
                    >
                      Unit of Measure
                    </label>
                    <div className="relative">
                      <select
                        required
                        id="unit_of_measure"
                        name="unit_of_measure"
                        value={formData.unit_of_measure}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-4 pr-10 text-slate-900 font-body text-sm appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all cursor-pointer"
                      >
                        <option disabled value="">
                          Select unit
                        </option>
                        <option value="kg">kg (Kilograms)</option>
                        <option value="g">g (Grams)</option>
                        <option value="L">L (Liters)</option>
                        <option value="ml">ml (Milliliters)</option>
                        <option value="units">Units / Pieces</option>
                        <option value="bunch">Bunch</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Current Stock */}
                  <div>
                    <label
                      className="block font-body text-sm font-semibold text-slate-700 mb-2"
                      htmlFor="current_stock"
                    >
                      Current Stock
                    </label>
                    <input
                      required
                      id="current_stock"
                      name="current_stock"
                      value={formData.current_stock}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-body text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                    />
                  </div>

                  {/* Alert Threshold */}
                  <div>
                    <label
                      className="block font-body text-sm font-semibold text-slate-700 mb-2"
                      htmlFor="alert_threshold"
                    >
                      Alert Threshold{' '}
                      <span className="text-slate-400 font-normal text-xs ml-1">(Warning)</span>
                    </label>
                    <input
                      required
                      id="alert_threshold"
                      name="alert_threshold"
                      value={formData.alert_threshold}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0.00"
                      step="0.01"
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-body text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 flex justify-end items-center gap-4 border-t border-slate-100 rounded-b-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 font-body text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                type="button"
              >
                Cancel
              </button>
              {/* Butonul e legat de form prin atributul form="addIngredientForm" */}
              <button
                form="addIngredientForm"
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-b from-orange-600 to-orange-700 text-white font-body text-sm font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm focus:outline-none flex items-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add
                </span>
                Add Ingredient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
