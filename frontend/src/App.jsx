import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Ingredients from './components/Ingredients';
import Recipes from './components/Recipes';
import Auth from './components/Auth';
import Production from './components/Production';
import SoupInventory from './components/SoupInventory';
import ServiceTransfer from './components/ServiceTransfer';
import UsersManagement from './components/UserManagement';

// Componenta pentru butoanele din meniu (Acum știe dacă meniul e restrâns sau nu)
const NavItem = ({ to, icon, label, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={isCollapsed ? label : ''} // Afișăm un tooltip (title) când e restrâns
      className={`flex items-center transition-all duration-300 group ${
        isCollapsed
          ? 'justify-center mx-3 py-3 rounded-xl mb-1' // Design pentru meniu închis (iconițe centrate)
          : 'gap-3 px-8 py-3 ml-4 rounded-l-full mb-1' // Design pentru meniu deschis
      } ${
        isActive
          ? 'text-orange-900 font-bold bg-white shadow-sm relative z-10'
          : 'text-slate-500 hover:text-orange-700 hover:bg-slate-200/50'
      }`}
    >
      <span
        className={`material-symbols-outlined transition-transform shrink-0 ${
          isActive ? 'scale-110' : 'group-hover:-translate-y-0.5'
        }`}
      >
        {icon}
      </span>
      {/* Ascundem textul când e restrâns, dar păstrăm lățimea fixă pentru tranziție fluidă */}
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
};

// Componenta principală care conține interfața
function AppContent({ user, onLogout }) {
  // Verificăm dacă user-ul este manager pentru a-i da permisiuni speciale
  const isManager = user?.role === 'MANAGER';

  // NOU: State pentru a controla dacă meniul e deschis sau închis
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-slate-50 text-slate-900 font-body antialiased h-screen flex overflow-hidden">
      {/* SIDEBAR GLOBAL - Lățimea se schimbă dinamic (w-64 vs w-20) */}
      <nav
        className={`h-screen fixed left-0 top-0 overflow-y-auto bg-slate-100 flex flex-col py-6 transition-all duration-300 ease-in-out z-50 border-r border-slate-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Zona de Logo */}
        <div
          className={`px-4 mb-10 flex transition-all duration-300 ${
            isCollapsed ? 'flex-col items-center' : 'flex-col items-start px-8'
          } gap-2`}
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-900 mb-1 shrink-0">
            <span
              className="material-symbols-outlined text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              soup_kitchen
            </span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap transition-opacity duration-300">
              <h1 className="text-xl font-bold tracking-tighter text-orange-900 font-manrope">
                StockPot
              </h1>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Management Hub
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col font-manrope tracking-tight text-sm">
          <NavItem to="/" icon="dashboard" label="Dashboard" isCollapsed={isCollapsed} />

          {/* Ascundem tab-ul de inventar dacă NU ești manager */}
          {isManager && (
            <NavItem
              to="/ingredients"
              icon="inventory_2"
              label="Inventory"
              isCollapsed={isCollapsed}
            />
          )}

          <NavItem to="/recipes" icon="menu_book" label="Recipes" isCollapsed={isCollapsed} />
          <NavItem
            to="/production"
            icon="soup_kitchen"
            label="Production"
            isCollapsed={isCollapsed}
          />
          <NavItem
            to="/soup-inventory"
            icon="kitchen"
            label="Cold Storage"
            isCollapsed={isCollapsed}
          />
          <NavItem to="/transfer" icon="swap_horiz" label="Transfers" isCollapsed={isCollapsed} />
          {isManager && (
            <NavItem to="/staff" icon="group" label="Staff" isCollapsed={isCollapsed} />
          )}
        </div>
      </nav>

      {/* ZONA PRINCIPALĂ - Marginea din stânga se schimbă dinamic (ml-64 vs ml-20) */}
      <div
        className={`flex-1 flex flex-col bg-slate-50 min-h-screen relative transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* HEADER GLOBAL */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm flex items-center justify-between px-6 lg:px-8 h-16 font-manrope font-medium text-sm">
          <div className="flex items-center gap-4 lg:gap-6">
            {/* NOU: Butonul de Toggle Sidebar pus exact unde ai cerut! */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none"
              title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isCollapsed ? 'menu_open' : 'menu'}
              </span>
            </button>

            <div className="hidden md:block text-lg font-black text-slate-900">
              Culinary Management
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
            {/* Rute protejate */}
            {isManager && <Route path="/ingredients" element={<Ingredients />} />}
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/production" element={<Production />} />
            <Route path="/soup-inventory" element={<SoupInventory />} />
            <Route path="/transfer" element={<ServiceTransfer />} />
            {isManager && <Route path="/staff" element={<UsersManagement />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Componenta "Părinte" care decide ce să afișeze (Login sau Aplicația)
function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <AppContent user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
