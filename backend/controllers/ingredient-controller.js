import db from '../db.js';

export const getIngredients = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM Ingredient ORDER BY ID ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ingredients from database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
