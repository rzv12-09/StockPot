import db from '../db.js';

// GET all invoices (with supplier name joined)
const getInvoices = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.id, 
        i.invoice_number, 
        i.issue_date, 
        i.total_amount, 
        i.notes, 
        i.created_at,
        s.name AS supplier_name,
        s.id AS supplier_id,
        (SELECT COUNT(*) FROM InvoiceItem ii WHERE ii.invoice_id = i.id) AS item_count
      FROM Invoice i
      JOIN Supplier s ON i.supplier_id = s.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single invoice with its items
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoiceResult = await db.query(
      `SELECT i.*, s.name AS supplier_name 
       FROM Invoice i 
       JOIN Supplier s ON i.supplier_id = s.id 
       WHERE i.id = $1`,
      [id]
    );

    if (invoiceResult.rowCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const itemsResult = await db.query(
      `SELECT ii.*, ing.name AS ingredient_name, ing.unit_of_measure
       FROM InvoiceItem ii
       JOIN Ingredient ing ON ii.ingredient_id = ing.id
       WHERE ii.invoice_id = $1
       ORDER BY ii.id ASC`,
      [id]
    );

    res.json({
      ...invoiceResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST create invoice with items — uses a transaction
const createInvoice = async (req, res) => {
  const client = await db.connect();

  try {
    const { supplier_id, invoice_number, issue_date, notes, items } = req.body;
    const created_by = req.user?.userId || null;

    if (!supplier_id || !invoice_number || !issue_date || !items || items.length === 0) {
      return res.status(400).json({
        error: 'supplier_id, invoice_number, issue_date, and at least one item are required!',
      });
    }

    await client.query('BEGIN');

    // Calculate total from items
    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    // Insert invoice header
    const invoiceResult = await client.query(
      `INSERT INTO Invoice (supplier_id, invoice_number, issue_date, total_amount, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [supplier_id, invoice_number, issue_date, total_amount, notes || null, created_by]
    );

    const invoiceId = invoiceResult.rows[0].id;

    // Insert each item and update ingredient stock
    for (const item of items) {
      await client.query(
        `INSERT INTO InvoiceItem (invoice_id, ingredient_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [invoiceId, item.ingredient_id, item.quantity, item.unit_price]
      );

      // Update ingredient current_stock
      await client.query(
        `UPDATE Ingredient SET current_stock = current_stock + $1 WHERE id = $2`,
        [Number(item.quantity), item.ingredient_id]
      );
    }

    await client.query('COMMIT');

    // Fetch the complete invoice to return
    const fullInvoice = await db.query(
      `SELECT i.*, s.name AS supplier_name 
       FROM Invoice i 
       JOIN Supplier s ON i.supplier_id = s.id 
       WHERE i.id = $1`,
      [invoiceId]
    );

    res.status(201).json(fullInvoice.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// DELETE invoice (cascade deletes items)
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Invoice WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.status(200).json({
      message: 'Invoice deleted successfully',
      deletedInvoice: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getInvoices, getInvoiceById, createInvoice, deleteInvoice };
