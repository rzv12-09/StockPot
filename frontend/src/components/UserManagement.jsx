import React, { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, rejectUser, getActiveUsers } from '../services/userService';

const UsersManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Păstrăm în state ce rol a selectat managerul din dropdown pentru fiecare user
  const [selectedRoles, setSelectedRoles] = useState({});

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'MANAGER':
        return 'bg-orange-100 text-orange-700';
      case 'PRODUCTION':
        return 'bg-purple-100 text-purple-700';
      case 'SALES':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pending = await getPendingUsers();
      setPendingUsers(pending);

      const active = await getActiveUsers();
      setActiveUsers(active);
    } catch (err) {
      setError('Încărcarea datelor utilizatorilor a eșuat.', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setSelectedRoles({
      ...selectedRoles,
      [userId]: newRole,
    });
  };

  const handleApprove = async (userId) => {
    setError('');
    setSuccess('');
    try {
      // Dacă nu a selectat nimic, trimitem 'null' ca să se aplice logica ta deșteaptă din backend
      const roleToAssign = selectedRoles[userId] || null;
      await approveUser(userId, roleToAssign);
      setSuccess('Utilizator aprobat cu succes!');
      fetchData(); // Reîncărcăm lista
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Ești sigur că vrei să respingi și să ștergi această cerere?')) return;
    setError('');
    setSuccess('');
    try {
      await rejectUser(userId);
      setSuccess('Cererea utilizatorului a fost respinsă.');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="material-symbols-outlined animate-spin text-4xl text-orange-600">
          refresh
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-16 bg-[#f3faff]">
      {/* Alerte */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
          {success}
        </div>
      )}

      {/* Section A: Pending Approvals */}
      <section className="bg-[#e6f6ff] rounded-[1.5rem] p-8 lg:p-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-manrope font-bold text-2xl text-slate-900">Aprobări în Așteptare</h3>
            <p className="font-body text-slate-500 mt-2 text-sm">
              Revizuiește și atribuie roluri noilor cereri ale personalului.
            </p>
          </div>
          {pendingUsers.length > 0 && (
            <span className="bg-[#d5ecf8] text-orange-700 font-bold text-xs px-3 py-1.5 rounded-full inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-600 mr-2"></span>{' '}
              {pendingUsers.length} Noi
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUsers.length === 0 ? (
            <p className="text-slate-500 col-span-full">Nicio aprobare în așteptare momentan.</p>
          ) : (
            pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl p-6 shadow-sm relative group hover:shadow-md transition-all border border-slate-100"
              >
                <div className="absolute -top-3 -right-3 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm border border-amber-200/50">
                  În Așteptare
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 shadow-sm">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      person_add
                    </span>
                  </div>
                  <div>
                    <h4 className="font-manrope font-bold text-slate-900">{user.username}</h4>
                    <p className="font-body text-xs text-slate-500 mt-0.5">
                      Rol Cerut: {user.role}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block font-body text-xs text-slate-500 mb-2">Atribuie Rol</label>
                  <div className="relative">
                    <select
                      value={selectedRoles[user.id] || user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 rounded-md px-4 py-2.5 font-body text-sm text-slate-800 outline-none cursor-pointer transition-colors"
                    >
                      <option value="STAFF">VÂNZĂRI</option>
                      <option value="PRODUCTION">PRODUCȚIE</option>
                      <option value="MANAGER">MANAGER</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="flex-1 bg-gradient-to-b from-orange-600 to-orange-700 text-white font-body font-semibold text-sm py-2.5 rounded-md hover:shadow-lg transition-shadow flex justify-center items-center"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5">check</span>{' '}
                    Aprobă
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="flex-1 bg-transparent border border-red-200 text-red-600 font-body font-semibold text-sm py-2.5 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors flex justify-center items-center"
                  >
                    <span className="material-symbols-outlined text-[18px] mr-1.5">close</span>{' '}
                    Respinge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Section B: Active Team Members (Tabel static momentan) */}
      <section className="bg-white rounded-[1.5rem] p-8 lg:p-10 shadow-sm border border-slate-100">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h3 className="font-manrope font-bold text-2xl text-slate-900">Membri Activi ai Echipei</h3>
            <p className="font-body text-slate-500 mt-2 text-sm">
              Gestionează rolurile și statusurile personalului existent.
            </p>
          </div>
          <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-body font-semibold text-sm py-2 px-4 rounded-md flex items-center">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span> Exportă
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 rounded-lg">
                <th className="py-4 px-6 font-manrope font-semibold text-sm text-slate-600 rounded-l-lg">
                  Utilizator
                </th>
                <th className="py-4 px-6 font-manrope font-semibold text-sm text-slate-600">
                  Rol
                </th>
                <th className="py-4 px-6 font-manrope font-semibold text-sm text-slate-600">
                  Status
                </th>
                <th className="py-4 px-6 font-manrope font-semibold text-sm text-slate-600 text-right rounded-r-lg">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {activeUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 px-6 text-center text-slate-500">
                    Niciun membru activ al echipei găsit.
                  </td>
                </tr>
              ) : (
                activeUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {/* Generăm prima literă din nume pentru avatar */}
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center uppercase">
                          {user.username.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </td>
                    <td className="py-4 px-6 text-teal-600 font-medium capitalize">
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span>
                        {user.status === 'ACTIVE' ? 'Activ' : user.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-slate-400 hover:text-orange-600 transition-colors p-2 rounded-full hover:bg-orange-50">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UsersManagement;
