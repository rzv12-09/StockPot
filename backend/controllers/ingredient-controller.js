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
    const { name, unit_of_measure, current_stock, alert_threshold } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    const result = await db.query(
      `INSERT INTO Ingredient (name, unit_of_measure, current_stock, alert_threshold) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, unit_of_measure, current_stock, alert_threshold]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding ingredient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`DELETE FROM Ingredient WHERE ID = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res
      .status(200)
      .json({ message: 'Ingredient deleted successfully', deletedIngredient: result.rows[0] });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getIngredients, addIngredient, deleteIngredient };
