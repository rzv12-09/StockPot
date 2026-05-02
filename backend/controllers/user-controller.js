import db from '../db.js';

// Obține toți userii care așteaptă aprobare
export const getPendingUsers = async (req, res) => {
  try {
    const query = `SELECT id, username, role, status FROM Users WHERE status = 'PENDING' ORDER BY id ASC`;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users.' });
  }
};

// Aprobă un user (Managerul poate trimite un 'role' nou dacă vrea să îl schimbe)
export const approveUser = async (req, res) => {
  const { id } = req.params;
  let { role } = req.body;

  try {
    if (!role) {
      const selectedRole = await db.query(`SELECT Role from users where id = $1`, [id]);
      if (selectedRole.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }
      role = selectedRole.rows[0].role;
    }

    const query = `
      UPDATE Users 
      SET status = 'APPROVED', role = $1 
      WHERE id = $2 
      RETURNING id, username, role, status
    `;
    const { rows } = await db.query(query, [role, id]);

    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: 'User approved successfully!', user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve user.' });
  }
};

export const rejectUser = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM Users WHERE id = $1 RETURNING username`;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: `User ${rows[0].username} rejected and deleted.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject user.' });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const query = `SELECT id, username, role, status FROM Users WHERE status = 'APPROVED' ORDER BY id ASC`;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: 'Failed to fetch active users.' });
  }
};
