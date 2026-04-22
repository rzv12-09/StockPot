import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';

// O componentă mică pentru a evidenția butonul activ din meniu
const NavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-8 py-3 transition-colors group ${
        isActive
          ? 'text-orange-900 font-bold bg-white rounded-l-full ml-4 shadow-sm relative z-10'
          : 'text-slate-500 hover:text-orange-700 hover:bg-slate-200/50'
      }`}
    >
      <span
        className={`material-symbols-outlined transition-transform ${
          isActive ? 'scale-110' : 'group-hover:-translate-y-0.5'
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};

function AppContent() {
  return (
    <div className="bg-slate-50 text-slate-900 font-body antialiased h-screen flex overflow-hidden">
      {/* SIDEBAR GLOBAL */}
      <nav className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-slate-100 flex flex-col py-6 transition-all duration-300 ease-in-out z-50 border-r border-slate-200">
        <div className="px-8 mb-10 flex flex-col items-start gap-2">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-900 mb-2">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              soup_kitchen
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-orange-900 font-manrope">
            StockPot
          </h1>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Management Hub
          </p>
        </div>

        <div className="flex-1 flex flex-col font-manrope tracking-tight text-sm">
          <NavItem to="/" icon="dashboard" label="Dashboard" />
          <NavItem to="/ingredients" icon="inventory_2" label="Inventory" />
          <NavItem to="/recipes" icon="menu_book" label="Recipes" />
        </div>
      </nav>

      {/* ZONA PRINCIPALĂ */}
      <div className="flex-1 flex flex-col ml-64 bg-slate-50 min-h-screen relative">
        {/* HEADER GLOBAL */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm flex items-center justify-between px-8 h-16 font-manrope font-medium text-sm">
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-lg font-black text-slate-900">Ciorbarie</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold">
                R
              </div>
              <span className="font-semibold text-slate-700">Razvan O.</span>
            </button>
          </div>
        </header>

        {/* CANVA PENTRU COMPONENTE DINAMICE (Aici se randează paginile) */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 pb-24">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h2 className="font-manrope text-4xl text-orange-900 font-bold mb-2">
                    Welcome back, Razvan!
                  </h2>
                  <p className="text-slate-500">Select a module from the left menu.</p>
                </div>
              }
            />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
