import db from '../db.js';

export const createProductionBatch = async (req, res) => {
  const { recipe_id, quantity_produced } = req.body;
  const user_id = req.user.userId;

  if (!recipe_id || !quantity_produced || quantity_produced <= 0) {
    return res.status(400).json({ error: 'Recipe ID and quantity are required.' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const recipeQuery = `
      SELECT ri.ingredient_id, ri.quantity_required as qty_per_unit, i.current_stock, i.name
      FROM Recipe_Ingredient ri
      JOIN Ingredient i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = $1
    `;
    const { rows: ingredientsNeeded } = await client.query(recipeQuery, [recipe_id]);

    if (ingredientsNeeded.length === 0) {
      throw new Error('Recipe has no ingredients or does not exist.');
    }

    for (const item of ingredientsNeeded) {
      const totalRequired = item.qty_per_unit * quantity_produced;
      if (item.current_stock < totalRequired) {
        throw new Error(
          `Insufficient stock for ${item.name}. Need ${totalRequired}, have ${item.current_stock}`
        );
      }
    }

    for (const item of ingredientsNeeded) {
      const totalRequired = item.qty_per_unit * quantity_produced;
      await client.query('UPDATE Ingredient SET current_stock = current_stock - $1 WHERE id = $2', [
        totalRequired,
        item.ingredient_id,
      ]);
    }

    const upsertStockQuery = `
      INSERT INTO finished_soups (recipe_id, current_quantity)
      VALUES ($1, $2)
      ON CONFLICT (recipe_id) 
      DO UPDATE SET 
        current_quantity = finished_soups.current_quantity + $2,
        last_updated = CURRENT_TIMESTAMP
    `;
    await client.query(upsertStockQuery, [recipe_id, quantity_produced]);

    const logBatchQuery = `
      INSERT INTO Production_Batches (recipe_id, user_id, quantity_produced)
      VALUES ($1, $2, $3)
      RETURNING id, production_date
    `;
    const { rows: batchRecord } = await client.query(logBatchQuery, [
      recipe_id,
      user_id,
      quantity_produced,
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Production completed successfully!',
      details: {
        batch_id: batchRecord[0].id,
        recipe_id,
        quantity_added: quantity_produced,
        timestamp: batchRecord[0].production_date,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getCookedStock = async (req, res) => {
  try {
    const query = `
        SELECT fs.*, r.name as recipe_name 
        FROM finished_soups fs
        JOIN Recipe r ON fs.recipe_id = r.id
        ORDER BY r.name ASC
      `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
