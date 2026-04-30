import db from '../db.js';

// Citește ce avem în supiere (pentru coloana din dreapta a UI-ului tău)
export const getServingSlots = async (req, res) => {
  try {
    const query = `
      SELECT ss.*, r.name as recipe_name 
      FROM Serving_Slots ss
      LEFT JOIN Recipe r ON ss.recipe_id = r.id
      ORDER BY ss.slot_name ASC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch serving slots' });
  }
};

// Execută mutarea din Frigider în Supieră (1 Marmită per Slot)
export const executeTransfer = async (req, res) => {
  // Am scos 'quantity' din body, pentru că transferăm mereu 1 marmită
  const { recipe_id, slot_id } = req.body;

  if (!recipe_id || !slot_id) {
    return res.status(400).json({ error: 'Recipe ID and Slot ID are required.' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificăm dacă avem cel puțin 1 marmită disponibilă în Frigider
    const checkStockQuery = `SELECT current_quantity FROM finished_soups WHERE recipe_id = $1`;
    const { rows: stock } = await client.query(checkStockQuery, [recipe_id]);

    if (stock.length === 0 || stock[0].current_quantity < 1) {
      throw new Error(
        'Not enough marmites in the fridge! You need at least 1 marmite to transfer.'
      );
    }

    // 2. Verificăm dacă Supiera (Slotul) este GOALĂ
    const checkSlotQuery = `SELECT recipe_id, slot_name FROM Serving_Slots WHERE id = $1`;
    const { rows: slot } = await client.query(checkSlotQuery, [slot_id]);

    if (slot[0].recipe_id !== null) {
      throw new Error(`Slot ${slot[0].slot_name} is already full! Please empty it first.`);
    }

    // 3. Scădem EXACT O MARMITĂ din Frigider
    await client.query(
      `UPDATE finished_soups SET current_quantity = current_quantity - 1 WHERE recipe_id = $1`,
      [recipe_id]
    );

    // 4. "Băgăm" marmita în Supieră
    await client.query(
      `UPDATE Serving_Slots 
       SET recipe_id = $1, last_filled_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [recipe_id, slot_id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Transfer successful! 1 marmite placed in the serving slot.' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const emptySlot = async (req, res) => {
  const { slot_id } = req.body;

  if (!slot_id) {
    return res.status(400).json({ error: 'Slot ID is required.' });
  }

  try {
    await db.query(`UPDATE Serving_Slots SET recipe_id = NULL WHERE id = $1`, [slot_id]);

    res.json({ message: 'Pan emptied successfully!' });
  } catch (error) {
    console.error('Empty slot error:', error);
    res.status(500).json({ error: 'Failed to empty the pan.' });
  }
};
