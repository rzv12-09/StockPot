import React, { useState, useEffect } from 'react';
import {
  getIngredients,
  addIngredient,
  deleteIngredient,
  updateIngredient,
} from '../services/ingredientsService';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Toate Categoriile');

  // State pentru Modal
  const [showForm, setShowForm] = useState(false);

  // NOU: State pentru a ști dacă suntem în modul "Editare" (și ce ID edităm)
  const [editingIngredientId, setEditingIngredientId] = useState(null);

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

  // NOU: Funcția apelată când apăsăm pe butonul "Edit" dintr-un rând
  const handleEditClick = (ingredient) => {
    setEditingIngredientId(ingredient.id);
    setFormData({
      name: ingredient.name,
      category: ingredient.category || '', // Fallback dacă cumva e null în baza de date veche
      unit_of_measure: ingredient.unit_of_measure,
      current_stock: ingredient.current_stock,
      alert_threshold: ingredient.alert_threshold,
    });
    setShowForm(true); // Deschidem modalul, dar cu datele completate!
  };

  // Funcția apelată la click pe "Add New Ingredient" (resetează totul)
  const handleAddNewClick = () => {
    setEditingIngredientId(null); // Ne asigurăm că NU suntem în modul edit
    setFormData({
      name: '',
      category: '',
      unit_of_measure: '',
      current_stock: '',
      alert_threshold: '',
    });
    setShowForm(true);
  };

  // Modificată: Acum știe să facă și Add și Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        current_stock: Number(formData.current_stock),
        alert_threshold: Number(formData.alert_threshold),
      };

      if (editingIngredientId) {
        // Modul Editare
        await updateIngredient(editingIngredientId, payload);
      } else {
        // Modul Adăugare Nouă
        await addIngredient(payload);
      }

      // Resetăm și închidem
      setEditingIngredientId(null);
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
    if (!window.confirm('Ești sigur că vrei să ștergi acest ingredient?')) return;
    try {
      await deleteIngredient(id);
      loadIngredients();
    } catch (err) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="text-slate-500 font-body">Se încarcă ingredientele...</div>;
  if (error) return <div className="text-red-500">Eroare: {error}</div>;

  // Filtrăm lista bazat pe categoria selectată
  const filteredIngredients =
  const filteredIngredients =
    selectedCategory === 'Toate Categoriile'
      ? ingredients
      : ingredients.filter((ing) => ing.category === selectedCategory);

  // Calculăm statisticile folosind DOAR lista filtrată
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
            Gestiune Ingrediente
          </h2>
          <p className="font-body text-slate-500 text-sm max-w-2xl">
            Gestionează ingredientele și nivelul stocurilor.
          </p>
        </div>
        <button
          onClick={handleAddNewClick} // Modificat pentru a apela funcția dedicată
          className="flex items-center gap-2 bg-gradient-to-b from-orange-600 to-orange-700 text-white px-6 py-3 rounded-md font-manrope font-semibold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Adaugă Ingredient Nou
        </button>
      </div>

      {/* Stats/Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-8 flex gap-4">
        <div className="md:col-span-8 flex gap-4">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1 transition-all">
            <p className="font-body text-sm font-semibold text-slate-500 mb-1">Total Ingrediente</p>
            <div className="text-2xl font-manrope font-bold text-orange-600">{totalItems}</div>
          </div>
          {lowStockItems > 0 ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex-1 relative overflow-hidden transition-all shadow-sm">
              <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <p className="font-body text-sm font-semibold text-red-800 mb-1 relative z-10">
                Alerte Stoc Scăzut
              </p>
              <div className="flex items-center gap-2 relative z-10">
                <div className="text-2xl font-manrope font-bold text-red-600">{lowStockItems}</div>
                <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1 transition-all">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex-1 transition-all">
              <p className="font-body text-sm font-semibold text-slate-500 mb-1">
                Alerte Stoc Scăzut
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
          <label className="font-manrope text-sm font-semibold text-slate-600 mb-2 block">
            Filtru Rapid
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg text-sm font-body text-slate-700 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-orange-600/20 cursor-pointer"
          >
            <option value="Toate Categoriile">Toate Categoriile</option>
            <option value="Vegetables">Legume</option>
            <option value="Meat & Poultry">Carne și Pui</option>
            <option value="Dairy & Eggs">Lactate și Ouă</option>
            <option value="Dry Goods">Produse Uscate</option>
            <option value="Spices & Herbs">Condimente și Ierburi</option>
            <option value="Liquids">Lichide</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl pb-4">
        <div className="w-full text-left font-body">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-t-xl mb-2">
            <div className="col-span-4 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nume Ingredient
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              U.M.
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stoc Curent
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider">
              Limită Alertă
            </div>
            <div className="col-span-2 font-manrope text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
              Acțiuni
            </div>
          </div>

          <div className="space-y-1 px-2">
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
                    {/* Buton EDIT adăugat aici */}
                    <button
                      onClick={() => handleEditClick(ingredient)}
                      className="w-8 h-8 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-600 flex items-center justify-center transition-colors"
                      title="Editează"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="w-8 h-8 rounded-md bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-600 flex items-center justify-center transition-colors"
                      title="Șterge"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredIngredients.length === 0 && (
              <div className="text-center py-8 text-slate-500 font-medium">
                Niciun ingredient găsit în această categorie.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY - DINAMIC PENTRU ADD SI EDIT */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          {/* Modal Container */}
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                {/* NOU: Titlu dinamic */}
                <h2 className="font-manrope text-2xl font-bold text-slate-900">
                  {editingIngredientId ? 'Editează Ingredient' : 'Adaugă Ingredient Nou'}
                </h2>
                <p className="font-body text-sm text-slate-500 mt-1">
                  {editingIngredientId
                    ? 'Actualizează detaliile pentru monitorizarea inventarului.'
                    : 'Introdu detaliile pentru noul articol din stoc.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingIngredientId(null); // Curățăm state-ul de editare la închidere
                }}
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
                    Nume Ingredient
                  </label>
                  <input
                    required
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ex., Morcovi organici"
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
                      Categorie
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
                          Selectează categoria
                        </option>
                        <option value="Vegetables">Legume</option>
                        <option value="Meat & Poultry">Carne și Pui</option>
                        <option value="Dairy & Eggs">Lactate și Ouă</option>
                        <option value="Dry Goods">Produse Uscate</option>
                        <option value="Spices & Herbs">Condimente și Ierburi</option>
                        <option value="Liquids">Lichide</option>
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
                      Unitate de Măsură
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
                          Selectează unitatea
                        </option>
                        <option value="kg">kg (Kilograme)</option>
                        <option value="g">g (Grame)</option>
                        <option value="L">L (Litri)</option>
                        <option value="ml">ml (Mililitri)</option>
                        <option value="units">Bucăți / Unitate</option>
                        <option value="bunch">Legătură</option>
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
                      Stoc Curent
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
                      Limită Alertă Minimă
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
                    <p className="text-xs text-slate-500 mt-1 ml-1 font-body">
                      Te notifică când stocul scade sub acest nivel.
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 flex justify-end items-center gap-4 border-t border-slate-100 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingIngredientId(null);
                }}
                className="px-6 py-2.5 font-body text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                type="button"
              >
                Anulează
              </button>
              {/* NOU: Buton dinamic și design similar cu referința pentru Edit */}
              <button
                form="addIngredientForm"
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-b from-orange-600 to-orange-700 text-white font-body text-sm font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm focus:outline-none flex items-center gap-2 active:scale-95"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {editingIngredientId ? 'save' : 'add'}
                </span>
                {editingIngredientId ? 'Salvează Modificările' : 'Adaugă Ingredient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
