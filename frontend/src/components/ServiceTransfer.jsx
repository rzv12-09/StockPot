import React, { useState, useEffect } from 'react';
import { getCookedStock } from '../services/productionService';
import { emptyServingSlot, getServingSlots, executeTransfer } from '../services/transferService';

const ServiceTransfer = () => {
  const [fridgeStock, setFridgeStock] = useState([]);
  const [servingSlots, setServingSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State pentru selecții
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stockData, slotsData] = await Promise.all([getCookedStock(), getServingSlots()]);
      setFridgeStock(stockData.filter((item) => item.current_quantity > 0)); // Arătăm doar ce e în stoc
      setServingSlots(slotsData);
    } catch (err) {
      setError('Failed to load transfer data.');
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
        `Successfully transferred ${selectedRecipe.recipe_name} to ${selectedSlot.slot_name}!`
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
    if (!window.confirm('Are you sure you want to empty this pan?')) return;

    setError('');
    setSuccess('');

    try {
      await emptyServingSlot(slotId);
      setSuccess('Pan emptied successfully!');
      if (selectedSlot?.id === slotId) setSelectedSlot(null);
      await fetchData(); // Reîncărcăm datele
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
          Service Transfer
        </h2>
        <p className="font-body text-slate-500 text-sm max-w-2xl">
          Move prepared batches from the cold room to the active serving line.
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
            Frigorific Storage
          </h3>
          <div className="bg-white rounded-xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm border border-slate-200">
            {fridgeStock.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No stock available.</p>
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
                        <p className="text-xs text-slate-500">Available:</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.current_quantity}{' '}
                          <span className="text-slate-500 text-xs font-normal">marmites</span>
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
                Transferring
              </span>
              <h3 className="font-manrope text-2xl font-black text-slate-900 mb-1 leading-tight">
                {selectedRecipe ? selectedRecipe.recipe_name : 'Select a Soup'}
              </h3>
              <p className="text-slate-500 text-sm font-mono mt-2">
                {selectedSlot ? `To ${selectedSlot.slot_name}` : 'Select destination pan'}
              </p>
            </div>

            {/* Volume Controls (Adaptat pt 1 Marmită) */}
            <div className="flex justify-center items-center bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
              <div className="text-center">
                <div className="font-manrope text-5xl font-black text-orange-600 tracking-tighter">
                  1
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                  Full Marmite
                </div>
              </div>
            </div>

            {/* Main Action */}
            <button
              onClick={handleTransfer}
              disabled={!selectedRecipe || !selectedSlot || isTransferring}
              className="w-full py-4 rounded-xl bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-bold text-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? 'Processing...' : 'Execute Transfer'}
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
          <h3 className="font-manrope text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">heat_pump</span>
            Serving Area
          </h3>
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
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                          Occupied
                        </span>
                      </div>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{slot.recipe_name}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Filled:{' '}
                            {new Date(slot.last_filled_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-manrope font-bold text-lg text-orange-600">1 M</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEmptySlot(slot.id)}
                      className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Empty Pan
                    </button>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center h-32 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
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
                    Empty Slot
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceTransfer;
