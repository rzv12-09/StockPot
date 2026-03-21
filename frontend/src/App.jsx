import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Ingredients from './pages/Ingredients';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '15px', backgroundColor: '#2c3e50', color: 'white' }}>
        <h3 style={{ display: 'inline', marginRight: '30px' }}>StockPot</h3>
        <Link to="/" style={{ color: '#ecf0f1', textDecoration: 'none', marginRight: '20px' }}>
          Dashboard
        </Link>
        <Link to="/ingredients" style={{ color: '#ecf0f1', textDecoration: 'none' }}>
          Ingrediente
        </Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: '20px' }}>
              <h1>Dashboard Principal</h1>
              <p>Selectează un modul din meniul de sus.</p>
            </div>
          }
        />
        <Route path="/ingredients" element={<Ingredients />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
