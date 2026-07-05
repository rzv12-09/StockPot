import React, { useState, useEffect } from 'react';
import { getCookedStock } from '../services/productionService';
import { emptyServingSlot, getServingSlots, executeTransfer, createServingSlot, updateServingSlot, deleteServingSlot } from '../services/transferService';

const ServiceTransfer = ({ user }) => {
  const isManager = user?.role === 'MANAGER';

  const [fridgeStock, setFridgeStock] = useState([]);
  const [servingSlots, setServingSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State pentru selecții
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State pentru modal CRUD supieră
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // null = creare, obiect = editare
  const [slotFormName, setSlotFormName] = useState('');
  const [slotFormError, setSlotFormError] = useState('');
  const [isSavingSlot, setIsSavingSlot] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stockData, slotsData] = await Promise.all([getCookedStock(), getServingSlots()]);
      setFridgeStock(stockData.filter((item) => item.current_quantity > 0)); // Arătăm doar ce e în stoc
      setServingSlots(slotsData);
    } catch (err) {
      setError('Încărcarea datelor de transfer a eșuat.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async () => {
    if (!selectedRecipe || !selectedSlot) return;

    setIsTransferring(true);
    setError('');
    setSuccess('');

    try {
      await executeTransfer({
        recipe_id: selectedRecipe.recipe_id,
        slot_id: selectedSlot.id,
      });
      setSuccess(
        `S-a transferat cu succes ${selectedRecipe.recipe_name} la ${selectedSlot.slot_name}!`
      );
      setSelectedRecipe(null);
      setSelectedSlot(null);
      await fetchData(); // Reîncărcăm datele
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleEmptySlot = async (slotId) => {
    if (!window.confirm('Ești sigur că vrei să golești această supieră?')) return;

    setError('');
    setSuccess('');

    try {
      await emptyServingSlot(slotId);
      setSuccess('Supiera a fost golită cu succes!');
      if (selectedSlot?.id === slotId) setSelectedSlot(null);
      await fetchData(); // Reîncărcăm datele
    } catch (err) {
      setError(err.message);
    }
  };

  // --- CRUD Supiere ---
  const openCreateModal = () => {
    setEditingSlot(null);
    setSlotFormName('');
    setSlotFormError('');
    setShowSlotModal(true);
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setSlotFormName(slot.slot_name);
    setSlotFormError('');
    setShowSlotModal(true);
  };

  const closeSlotModal = () => {
    setShowSlotModal(false);
    setEditingSlot(null);
    setSlotFormName('');
    setSlotFormError('');
  };

  const handleSlotSave = async (e) => {
    e.preventDefault();
    if (!slotFormName.trim()) {
      setSlotFormError('Numele supiererei este obligatoriu.');
      return;
    }

    setIsSavingSlot(true);
    setSlotFormError('');

    try {
      if (editingSlot) {
        await updateServingSlot(editingSlot.id, slotFormName.trim());
        setSuccess(`Supiera "${slotFormName.trim()}" a fost actualizată cu succes!`);
      } else {
        await createServingSlot(slotFormName.trim());
        setSuccess(`Supiera "${slotFormName.trim()}" a fost creată cu succes!`);
      }
      closeSlotModal();
      await fetchData();
    } catch (err) {
      setSlotFormError(err.message);
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Ești sigur că vrei să ștergi supiera "${slot.slot_name}"?`)) return;

    setError('');
    setSuccess('');

    try {
      await deleteServingSlot(slot.id);
      setSuccess(`Supiera "${slot.slot_name}" a fost ștearsă cu succes!`);
      if (selectedSlot?.id === slot.id) setSelectedSlot(null);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-orange-600">
          refresh
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Header Pagină - Stil Standardizat */}
      <div className="mb-8">
        <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Transfer Servire
        </h2>
        <p className="font-body text-slate-500 text-sm max-w-2xl">
          Transferă șarjele preparate din camera frigorifică pe linia de servire activă.
        </p>
      </div>

      {/* Alerte */}
      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
          {success}
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLOANA 1: Frigorific Storage (Left) */}
        <section className="lg:col-span-4 flex flex-col max-h-[800px]">
          <h3 className="font-manrope text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">kitchen</span>
            Depozit Frigorific
          </h3>
          <div className="bg-white rounded-xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm border border-slate-200">
            {fridgeStock.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Niciun stoc disponibil.</p>
            ) : (
              fridgeStock.map((item) => {
                const isSelected = selectedRecipe?.recipe_id === item.recipe_id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRecipe(item)}
                    className={`rounded-xl p-4 flex gap-4 items-center cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 shadow-sm border-l-4'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
                        isSelected ? 'bg-orange-200' : 'bg-slate-100'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[28px] ${
                          isSelected ? 'text-orange-600' : 'text-slate-400'
                        }`}
                      >
                        soup_kitchen
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4
                          className={`font-manrope font-bold text-sm ${
                            isSelected ? 'text-orange-700' : 'text-slate-900'
                          }`}
                        >
                          {item.recipe_name}
                        </h4>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-slate-500">Disponibil:</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.current_quantity}{' '}
                          <span className="text-slate-500 text-xs font-normal">Litri</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* COLOANA 2: Transfer Controls (Center) */}
        <section className="lg:col-span-4 flex flex-col justify-center mt-10">
          <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden group min-h-[400px] flex flex-col justify-center">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-700"></div>

            <div className="text-center mb-8 relative z-10">
              <span className="inline-block px-3 py-1 bg-slate-100 text-orange-600 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                Transfer
              </span>
              <h3 className="font-manrope text-2xl font-black text-slate-900 mb-1 leading-tight">
                {selectedRecipe ? selectedRecipe.recipe_name : 'Selectează o Ciorbă'}
              </h3>
              <p className="text-slate-500 text-sm font-mono mt-2">
                {selectedSlot ? `La ${selectedSlot.slot_name}` : 'Selectează supiera destinație'}
              </p>
            </div>

            {/* Volume Controls (Adaptat pt 1 Marmită) */}
            <div className="flex justify-center items-center bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <div className="text-center">
                <div className="font-manrope text-5xl font-black text-orange-600 tracking-tighter">
                  10
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Litri de Transferat
                </div>
              </div>
            </div>

            {/* Main Action */}
            <button
              onClick={handleTransfer}
              disabled={!selectedRecipe || !selectedSlot || isTransferring}
              className="w-full py-4 rounded-xl bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? 'Se procesează...' : 'Execută Transferul'}
              {!isTransferring && (
                <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              )}
            </button>
          </div>
        </section>

        {/* COLOANA 3: Serving Area (Right) */}
        <section className="lg:col-span-4 flex flex-col max-h-[800px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-manrope text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">heat_pump</span>
              Zonă Servire
            </h3>
            {isManager && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Supieră Nouă
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 flex-1 overflow-y-auto space-y-4 border border-slate-200 shadow-sm">
            {servingSlots.map((slot) => {
              const isOccupied = slot.recipe_id !== null;
              const isSelected = selectedSlot?.id === slot.id;

              if (isOccupied) {
                return (
                  <div
                    key={slot.id}
                    className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-orange-500">
                            local_fire_department
                          </span>
                          <h4 className="font-manrope font-bold text-slate-900">
                            {slot.slot_name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                            Ocupată
                          </span>
                          {isManager && (
                            <button
                              onClick={() => openEditModal(slot)}
                              className="p-1 text-slate-400 hover:text-orange-600 transition-colors"
                              title="Editează supiera"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{slot.recipe_name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Umplută la:{' '}
                            {new Date(slot.last_filled_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-manrope font-bold text-lg text-orange-600">10 L</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEmptySlot(slot.id)}
                      className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Golește Supiera
                    </button>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center h-32 transition-colors cursor-pointer relative group/slot ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Butoane de Management pe slot gol - doar pentru Manager */}
                  {isManager && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(slot);
                        }}
                        className="p-1 text-slate-400 hover:text-orange-600 transition-colors rounded hover:bg-white"
                        title="Editează supiera"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(slot);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded hover:bg-white"
                        title="Șterge supiera"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  )}

                  <span
                    className={`material-symbols-outlined text-3xl mb-2 ${
                      isSelected ? 'text-orange-600' : 'text-slate-400 opacity-50'
                    }`}
                  >
                    {isSelected ? 'check_circle' : 'add_circle'}
                  </span>
                  <h4
                    className={`font-manrope font-bold text-sm ${
                      isSelected ? 'text-orange-700' : 'text-slate-500'
                    }`}
                  >
                    {slot.slot_name}
                  </h4>
                  <p
                    className={`text-xs mt-1 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}
                  >
                    Slot Liber
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Modal Creare/Editare Supieră */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600">
                    {editingSlot ? 'edit' : 'add_circle'}
                  </span>
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-lg text-slate-900">
                    {editingSlot ? 'Editează Supiera' : 'Supieră Nouă'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingSlot
                      ? 'Modifică numele supiererei existente.'
                      : 'Adaugă o nouă supieră în zona de servire.'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeSlotModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleSlotSave}>
              <div className="px-6 py-6">
                {slotFormError && (
                  <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
                    {slotFormError}
                  </div>
                )}

                <label
                  className="block font-body text-sm font-semibold text-slate-700 mb-2"
                  htmlFor="slot_name"
                >
                  Numele Supiererei
                </label>
                <input
                  required
                  autoFocus
                  id="slot_name"
                  type="text"
                  value={slotFormName}
                  onChange={(e) => setSlotFormName(e.target.value)}
                  placeholder="ex. Supiera A-4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-body text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                />
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeSlotModal}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={isSavingSlot}
                  className="px-6 py-2.5 bg-gradient-to-b from-orange-600 to-orange-700 text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingSlot ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      {editingSlot ? 'Salvează' : 'Creează'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTransfer;
