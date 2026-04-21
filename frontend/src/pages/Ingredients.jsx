import React, { useState, useEffect } from 'react';
import { getIngredients, addIngredient, deleteIngredient } from '../services/ingredientsService';

const Ingredients = () => {
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newIngredientData = {
        ...formData,
        current_stock: Number(formData.current_stock),
        alert_threshold: Number(formData.alert_threshold),
      };

      await addIngredient(newIngredientData);

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

  if (isLoading) return <div>Loading ingredients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Ingredients Management</h2>

      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}
      >
        <h3>Add New Ingredient</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="unit_of_measure"
          placeholder="Unit (e.g. kg, L)"
          value={formData.unit_of_measure}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="current_stock"
          placeholder="Current Stock"
          value={formData.current_stock}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="alert_threshold"
          placeholder="Alert Threshold"
          value={formData.alert_threshold}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Ingredient</button>
      </form>

      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id} style={{ marginBottom: '10px' }}>
            <strong>{ingredient.name}</strong> - {ingredient.current_stock}{' '}
            {ingredient.unit_of_measure} (Alert at: {ingredient.alert_threshold})
            <button
              onClick={() => handleDelete(ingredient.id)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Ingredients;
