import React, { useState, useEffect } from 'react';
import { getIngredients, addIngredient, deleteIngredient } from '../services/ingredientsService';

const Ingredients = () => {
  // ... [Logica ta de state și funcțiile exact cum mi le-ai dat] ...
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-manrope text-4xl lg:text-5xl text-orange-900 font-bold tracking-tight mb-2">
            Inventory Management
          </h2>
          <p className="font-body text-slate-500 text-lg">
            Manage stock levels and alerts for raw materials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Form */}
        <div className="xl:col-span-1">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            <h3 className="font-manrope text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">inventory_2</span> Add
              Material
            </h3>

            <input
              type="text"
              name="name"
              placeholder="Name (e.g. Potatoes)"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
            <input
              type="text"
              name="unit_of_measure"
              placeholder="Unit (e.g. kg, L)"
              value={formData.unit_of_measure}
              onChange={handleInputChange}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
            <input
              type="number"
              name="current_stock"
              placeholder="Current Stock"
              value={formData.current_stock}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />
            <input
              type="number"
              name="alert_threshold"
              placeholder="Alert Threshold"
              value={formData.alert_threshold}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
            />

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Save to Inventory
            </button>
          </form>
        </div>

        {/* Right List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm font-body text-slate-600">
              <thead className="bg-slate-50 text-slate-800 font-manrope text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Ingredient Name</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Alert At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.map((ingredient) => {
                  const isLowStock = ingredient.current_stock <= ingredient.alert_threshold;
                  return (
                    <tr key={ingredient.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{ingredient.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {ingredient.current_stock} {ingredient.unit_of_measure}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {ingredient.alert_threshold} {ingredient.unit_of_measure}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ingredients;
