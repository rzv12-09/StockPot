// src/components/Ingredients.jsx

import React, { useState, useEffect } from 'react';
import { getIngredients } from '../services/ingredientsService';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    loadIngredients();
  }, []);

  if (isLoading) return <div>Loading ingredients...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Ingredients List</h2>
      <ul>
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>{ingredient.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Ingredients;
