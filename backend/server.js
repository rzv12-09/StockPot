import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api-router.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api',apiRouter)

app.get('/', (req, res) => {
  res.send('StockPot server is running perfectly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});