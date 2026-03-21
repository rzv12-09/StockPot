import db from '../db.js';

const getIngredients = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM Ingredient ORDER BY ID ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ingredients from database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addIngredient = async (req, res) => {
  try {
    const { name, unitate_masura, stoc_curent, prag_minim_alerta } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    const result = await db.query(
      `INSERT INTO Ingredient (nume_ingredient, unitate_masura, stoc_curent, prag_minim_alerta) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, unitate_masura, stoc_curent, prag_minim_alerta]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getIngredients, addIngredient };
