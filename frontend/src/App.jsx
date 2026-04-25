import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import Login from './components/Login'; // Importăm noua pagină de login
import Production from './components/Production';

// Componenta pentru butoanele din meniu
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

// Componenta principală care conține interfața (se randează DOAR dacă suntem logați)
function AppContent({ user, onLogout }) {
  // Verificăm dacă user-ul este manager pentru a-i da permisiuni speciale
  const isManager = user?.role === 'MANAGER';

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

          {/* Ascundem tab-ul de inventar dacă NU ești manager */}
          {isManager && <NavItem to="/ingredients" icon="inventory_2" label="Inventory" />}

          <NavItem to="/recipes" icon="menu_book" label="Recipes" />
          <NavItem to="/production" icon="soup_kitchen" label="Production" />
        </div>
      </nav>

      {/* ZONA PRINCIPALĂ */}
      <div className="flex-1 flex flex-col ml-64 bg-slate-50 min-h-screen relative">
        {/* HEADER GLOBAL */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm flex items-center justify-between px-8 h-16 font-manrope font-medium text-sm">
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-lg font-black text-slate-900">
              StockPot Workspace
            </div>
          </div>

          {/* Zona din dreapta cu profilul și logout */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="font-bold text-slate-800 text-sm">{user?.username}</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 rounded-full mt-0.5">
                {user?.role}
              </span>
            </div>

            {/* Buton de Logout */}
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined text-[22px]">logout</span>
            </button>
          </div>
        </header>

        {/* CANVA PENTRU COMPONENTE DINAMICE */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 pb-24">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <h2 className="font-manrope text-4xl text-slate-900 font-extrabold mb-2 tracking-tight">
                    Welcome back, {user?.username}! 👋
                  </h2>
                  <p className="text-slate-500 font-body">
                    Select a module from the left menu to get started.
                  </p>
                </div>
              }
            />
            {/* Rute protejate și pe frontend */}
            {isManager && <Route path="/ingredients" element={<Ingredients />} />}
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/production" element={<Production />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Componenta "Părinte" care decide ce să afișeze (Login sau Aplicația)
function App() {
  // 1. Verificăm dacă avem deja user-ul salvat în browser (ex: după un refresh)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Funcție apelată când logarea are succes din <Login />
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // 3. Funcție pentru Logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Ștergem legitimația
    localStorage.removeItem('user'); // Ștergem datele userului
    setUser(null); // Resetăm state-ul pentru a afișa ecranul de login
  };

  // Zidul de securitate: Dacă nu avem user, arată DOAR pagina de login!
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Dacă avem user, randăm aplicația cu tot cu React Router
  return (
    <BrowserRouter>
      <AppContent user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
