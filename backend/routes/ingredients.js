import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req,res) => {
    try {
        const rezultat = await db.query('SELECT * FROM Ingredient ORDER BY ID ASC');
        res.json(rezultat.rows);
    } catch (error) {
        console.error('Error fetching ingredients from database:',error);
        res.status(500).json({"message": "Internal server error"});
    }
})

export default router;