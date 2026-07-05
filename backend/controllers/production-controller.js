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

    const LITERS_PER_BATCH = 50;
    const totalLitersProduced = quantity_produced * LITERS_PER_BATCH;

    const upsertStockQuery = `
      INSERT INTO finished_soups (recipe_id, current_quantity)
      VALUES ($1, $2)
      ON CONFLICT (recipe_id) 
      DO UPDATE SET 
        current_quantity = finished_soups.current_quantity + $2,
        last_updated = CURRENT_TIMESTAMP
    `;
    await client.query(upsertStockQuery, [recipe_id, totalLitersProduced]);

    const logBatchQuery = `
      INSERT INTO Production_Batches (recipe_id, user_id, quantity_produced)
      VALUES ($1, $2, $3)
      RETURNING id, production_date
    `;
    const { rows: batchRecord } = await client.query(logBatchQuery, [
      recipe_id,
      user_id,
      totalLitersProduced,
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Production completed successfully!',
      details: {
        batch_id: batchRecord[0].id,
        recipe_id,
        quantity_added: totalLitersProduced,
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

// Reinventariere: Actualizează manual cantitatea unei ciorbe din frigider
export const updateSoupStock = async (req, res) => {
  const { id } = req.params;
  const { new_quantity } = req.body;

  if (new_quantity === undefined || new_quantity === null || isNaN(new_quantity) || Number(new_quantity) < 0) {
    return res.status(400).json({ error: 'Cantitatea trebuie să fie un număr >= 0.' });
  }

  try {
    const quantity = Number(new_quantity);

    if (quantity === 0) {
      // Dacă cantitatea e 0, ștergem înregistrarea
      const { rowCount } = await db.query(`DELETE FROM finished_soups WHERE id = $1`, [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: 'Înregistrarea nu a fost găsită.' });
      }
      return res.json({ message: 'Stocul a fost eliminat (cantitate 0).' });
    }

    const { rows, rowCount } = await db.query(
      `UPDATE finished_soups SET current_quantity = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [quantity, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Înregistrarea nu a fost găsită.' });
    }

    res.json({ message: 'Stocul a fost actualizat cu succes.', data: rows[0] });
  } catch (error) {
    console.error('Update soup stock error:', error);
    res.status(500).json({ error: 'Eroare la actualizarea stocului.' });
  }
};

// Obține batch-urile de producție pentru o rețetă specifică
export const getBatchesByRecipe = async (req, res) => {
  const { recipeId } = req.params;

  try {
    const query = `
      SELECT pb.id, pb.quantity_produced, pb.production_date, 
             u.username as produced_by
      FROM Production_Batches pb
      LEFT JOIN Users u ON pb.user_id = u.id
      WHERE pb.recipe_id = $1
      ORDER BY pb.production_date DESC
    `;
    const { rows } = await db.query(query, [recipeId]);
    res.json(rows);
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ error: 'Eroare la obținerea batch-urilor.' });
  }
};

export const getProductionPreview = async (req, res) => {
  const { recipe_id, quantity_produced } = req.body;

  if (!recipe_id || !quantity_produced || quantity_produced <= 0) {
    return res.status(400).json({ error: 'Recipe ID and quantity are required.' });
  }

  try {
    const query = `
      SELECT 
        i.name as ingredient_name,
        i.current_stock,
        ri.quantity_required as qty_per_unit,
        (ri.quantity_required * $2) as total_needed,
        (i.current_stock - (ri.quantity_required * $2)) as projected_stock
      FROM Recipe_Ingredient ri
      JOIN Ingredient i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = $1
    `;

    const { rows: previewData } = await db.query(query, [recipe_id, quantity_produced]);

    if (previewData.length === 0) {
      return res.status(404).json({ error: 'Recipe has no ingredients or does not exist.' });
    }

    const hasShortage = previewData.some((item) => Number(item.projected_stock) < 0);

    res.json({
      canProduce: !hasShortage,
      ingredients: previewData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
