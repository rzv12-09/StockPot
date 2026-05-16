import db from '../db.js';

const getSuppliers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Supplier ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact_info } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required!' });
    }

    const result = await db.query(
      `INSERT INTO Supplier (name, contact_info) VALUES ($1, $2) RETURNING *`,
      [name, contact_info || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Supplier already exists.' });
    }
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getSuppliers, createSupplier };
