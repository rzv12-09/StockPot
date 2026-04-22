import db from '../db.js';

const addRecipe = async (req, res) => {
  const { name, description, ingredients } = req.body;

  if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      error: 'Recipe name and an array of at least one ingredient are required!',
    });
  }

  try {
    await db.query('BEGIN');
    const recipeResult = await db.query(
      `INSERT INTO Recipe (name, description) 
       VALUES ($1, $2) 
       RETURNING *`,
      [name, description]
    );

    const newRecipe = recipeResult.rows[0];

    for (let item of ingredients) {
      await db.query(
        `INSERT INTO Recipe_Ingredient (recipe_id, ingredient_id, quantity_required) 
         VALUES ($1, $2, $3)`,
        [newRecipe.id, item.ingredient_id, item.quantity_required]
      );
    }
    await db.query('COMMIT');

    res.status(201).json({
      message: 'Recipe created successfully!',
      recipeId: newRecipe.id,
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error adding recipe:', error);
    res.status(500).json({ error: 'Internal server error while creating recipe.' });
  }
};

export { addRecipe };
