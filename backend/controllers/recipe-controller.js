import db from '../db.js';

const addRecipe = async (req, res) => {
  const { name, description, chef_notes, ingredients } = req.body;

  if (!name || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      error: 'Recipe name and an array of at least one ingredient are required!',
    });
  }

  try {
    await db.query('BEGIN');
    const recipeResult = await db.query(
      `INSERT INTO Recipe (name, description, chef_notes) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, chef_notes || '']
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

const getRecipes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        r.id, 
        r.name, 
        r.description,
        r.chef_notes,
        COALESCE(
          json_agg(
            json_build_object(
              'ingredient_id', i.id,
              'name', i.name,
              'unit_of_measure', i.unit_of_measure,
              'quantity_required', ri.quantity_required
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]'::json
        ) AS ingredients
      FROM Recipe r
      LEFT JOIN Recipe_Ingredient ri ON r.id = ri.recipe_id
      LEFT JOIN Ingredient i ON ri.ingredient_id = i.id
      WHERE r.is_archived = false
      GROUP BY r.id
      ORDER BY r.id ASC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error while fetching recipes.' });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE Recipe SET is_archived = true WHERE id = $1 AND is_archived = false RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recipe not found or already archived!' });
    }

    res.status(200).json({
      message: 'Recipe archived successfully!',
      archivedRecipe: result.rows[0],
    });
  } catch (error) {
    console.error('Error archiving recipe:', error);
    res.status(500).json({ error: 'Internal server error while archiving recipe.' });
  }
};

const restoreRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE Recipe SET is_archived = false WHERE id = $1 AND is_archived = true RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Recipe not found or not archived!' });
    }

    res.status(200).json({
      message: 'Recipe restored successfully!',
      restoredRecipe: result.rows[0],
    });
  } catch (error) {
    console.error('Error restoring recipe:', error);
    res.status(500).json({ error: 'Internal server error while restoring recipe.' });
  }
};

const getArchivedRecipes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, description
      FROM Recipe
      WHERE is_archived = true
      ORDER BY name ASC;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching archived recipes:', error);
    res.status(500).json({ error: 'Internal server error while fetching archived recipes.' });
  }
};

const updateRecipe = async (req, res) => {
  const { id } = req.params;
  const { name, description, chef_notes, ingredients } = req.body;

  if (!name || !ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: 'Recipe name and at least one ingredient are required!' });
  }

  try {
    await db.query('BEGIN');

    const recipeResult = await db.query(
      `UPDATE Recipe 
       SET name = $1, description = $2, chef_notes = $3 
       WHERE id = $4 
       RETURNING *`,
      [name, description, chef_notes || '', id]
    );

    if (recipeResult.rowCount === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Recipe not found!' });
    }

    await db.query(`DELETE FROM Recipe_Ingredient WHERE recipe_id = $1`, [id]);

    for (const ing of ingredients) {
      await db.query(
        `INSERT INTO Recipe_Ingredient (recipe_id, ingredient_id, quantity_required) 
         VALUES ($1, $2, $3)`,
        [id, ing.ingredient_id, ing.quantity_required]
      );
    }

    await db.query('COMMIT');

    res.status(200).json({
      message: 'Recipe updated successfully!',
      updatedRecipe: recipeResult.rows[0],
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal server error while updating recipe.' });
  }
};

export { addRecipe, getRecipes, deleteRecipe, updateRecipe, restoreRecipe, getArchivedRecipes };
