import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookedStock, updateSoupStock, getBatchesByRecipe } from '../services/productionService';

const SoupInventory = ({ user }) => {
  const isProduction = user?.role === 'PRODUCTION';
  const isManager = user?.role === 'MANAGER';
  const isSales = user?.role === 'SALES';
  const canAdjust = isManager || isProduction;
  const canTransfer = isManager || isSales;

  const navigate = useNavigate();

  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State pentru modal de reinventariere
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Feedback global
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // State pentru expand batch-uri
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [batchesData, setBatchesData] = useState({});
  const [loadingBatches, setLoadingBatches] = useState(null);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const data = await getCookedStock();
      setStock(data);
    } catch (error) {
      console.error('Failed to fetch stock', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrăm stocul pe baza căutării
  const filteredStock = stock.filter((item) =>
    item.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculăm volumul total doar pentru elementele filtrate
  const totalQuantity = filteredStock.reduce((sum, item) => sum + Number(item.current_quantity), 0);

  // --- Expand Batch-uri ---
  const toggleExpand = async (item) => {
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
      return;
    }

    setExpandedItemId(item.id);

    // Încărcăm batch-urile doar dacă nu le avem deja
    if (!batchesData[item.recipe_id]) {
      setLoadingBatches(item.id);
      try {
        const batches = await getBatchesByRecipe(item.recipe_id);
        setBatchesData((prev) => ({ ...prev, [item.recipe_id]: batches }));
      } catch (err) {
        console.error('Failed to fetch batches', err);
      } finally {
        setLoadingBatches(null);
      }
    }
  };

  // Helper pentru timp relativ
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `acum ${diffMins} min`;
    if (diffHours < 24) return `acum ${diffHours} ore`;
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `acum ${diffDays} zile`;
    return `acum ${Math.floor(diffDays / 7)} săpt.`;
  };

  const getAgeBadge = (dateString) => {
    const diffMs = new Date() - new Date(dateString);
    const diffHours = diffMs / 3600000;

    if (diffHours < 12) return { color: 'bg-green-100 text-green-700', label: 'Proaspăt' };
    if (diffHours < 24) return { color: 'bg-yellow-100 text-yellow-700', label: 'Azi' };
    if (diffHours < 48) return { color: 'bg-orange-100 text-orange-700', label: 'Ieri' };
    return { color: 'bg-red-100 text-red-700', label: 'Vechi' };
  };

  // --- Reinventariere ---
  const openAdjustModal = (item) => {
    setAdjustingItem(item);
    setAdjustQuantity(String(item.current_quantity));
    setAdjustError('');
  };

  const closeAdjustModal = () => {
    setAdjustingItem(null);
    setAdjustQuantity('');
    setAdjustError('');
  };

  const handleAdjustSave = async (e) => {
    e.preventDefault();

    const qty = Number(adjustQuantity);
    if (isNaN(qty) || qty < 0) {
      setAdjustError('Cantitatea trebuie să fie un număr >= 0.');
      return;
    }

    setIsSaving(true);
    setAdjustError('');
    setError('');
    setSuccess('');

    try {
      await updateSoupStock(adjustingItem.id, qty);
      if (qty === 0) {
        setSuccess(`„${adjustingItem.recipe_name}" a fost eliminată din inventar (cantitate 0).`);
      } else {
        setSuccess(
          `Stocul pentru „${adjustingItem.recipe_name}" a fost actualizat la ${qty} L.`
        );
      }
      closeAdjustModal();
      await fetchStock();
    } catch (err) {
      setAdjustError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-orange-600 py-20">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Page Header & Key Metrics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
        <div>
          <p className="text-sm font-body font-bold text-orange-600 uppercase tracking-wider mb-1">
            Cameră Frigorifică
          </p>
          <h2 className="text-4xl font-manrope font-extrabold text-slate-900 tracking-tight">
            Inventar Ciorbe
          </h2>
        </div>

        {/* Metrica Principală */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-5">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <span
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_drop
              </span>
            </div>
            <div>
              <p className="text-sm font-body text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                Volum Total
              </p>
              <p className="text-3xl font-manrope font-black text-slate-900 leading-none">
                {totalQuantity}{' '}
                <span className="text-lg text-slate-400 font-bold ml-0.5">Litri</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Global */}
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

      {/* Bară de Căutare */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 focus:border-orange-600 focus:ring-1 focus:ring-orange-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors outline-none shadow-sm"
            placeholder="Caută după numele ciorbei..."
          />
        </div>
      </div>

      {/* Secțiunea Principală - Tabelul */}
      <div className="flex flex-col gap-6">
        {/* Batch Data Table */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="w-full text-left font-body">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-manrope">
              <div className="col-span-4">Nume Ciorbă</div>
              <div className="col-span-3">Dată Prod.</div>
              <div className="col-span-1 text-right">Volum</div>
              <div className="col-span-2 text-right">Acțiune</div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col gap-1">
              {filteredStock.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium">
                  {searchQuery ? 'Nu am găsit nicio ciorbă cu acest nume.' : 'Camera frigorifică este goală. Mergi la Producție pentru a găti câteva loturi!'}
                </div>
              ) : (
                filteredStock.map((item, index) => {
                  const isEven = index % 2 === 0;
                  const isExpanded = expandedItemId === item.id;
                  const batches = batchesData[item.recipe_id] || [];
                  const isLoadingThis = loadingBatches === item.id;

                  return (
                    <div key={item.id}>
                      {/* Rândul principal */}
                      <div
                        onClick={() => toggleExpand(item)}
                        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center rounded-lg transition-colors group cursor-pointer ${
                          isExpanded
                            ? 'bg-orange-50 border-l-4 border-orange-500'
                            : isEven
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="col-span-4 font-semibold text-slate-800 truncate pr-2 flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-[18px] transition-transform ${
                              isExpanded ? 'rotate-90 text-orange-600' : 'text-slate-400'
                            }`}
                          >
                            chevron_right
                          </span>
                          {item.recipe_name}
                        </div>

                        <div className="col-span-3 text-slate-500 text-sm font-medium">
                          {new Date(item.last_updated).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>

                        <div className="col-span-1 text-right font-manrope font-extrabold text-orange-600 text-lg">
                          {item.current_quantity}{' '}
                          <span className="text-sm font-normal text-slate-500 ml-0.5">L</span>
                        </div>

                        <div className="col-span-2 text-right flex items-center justify-end gap-2">
                          {canAdjust && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openAdjustModal(item);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                              title="Ajustare stoc"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                inventory
                              </span>
                              Ajustare
                            </button>
                          )}
                          {canTransfer && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/transfer', { state: { preselectedRecipe: item } });
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1"
                              title="Transferă la servire"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                arrow_forward
                              </span>
                              Servire
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Secțiune expandată - Batch-uri */}
                      {isExpanded && (
                        <div className="ml-6 mr-2 mb-2 mt-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                          {/* Header Batch-uri */}
                          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-manrope">
                            <div className="col-span-1">Lot</div>
                            <div className="col-span-3">Data Producție</div>
                            <div className="col-span-2">Vechime</div>
                            <div className="col-span-2 text-right">Volum</div>
                            <div className="col-span-2">Produs de</div>
                            <div className="col-span-2 text-right">Status</div>
                          </div>

                          {isLoadingThis ? (
                            <div className="flex justify-center py-6">
                              <span className="material-symbols-outlined animate-spin text-xl text-orange-500">
                                refresh
                              </span>
                            </div>
                          ) : batches.length === 0 ? (
                            <div className="py-6 text-center text-slate-400 text-sm">
                              Nu s-au găsit batch-uri de producție.
                            </div>
                          ) : (
                            batches.map((batch, bIndex) => {
                              const age = getAgeBadge(batch.production_date);
                              return (
                                <div
                                  key={batch.id}
                                  className={`grid grid-cols-12 gap-4 px-5 py-3 items-center text-sm ${
                                    bIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                                  }`}
                                >
                                  <div className="col-span-1 font-mono text-xs text-slate-400">
                                    #{batch.id}
                                  </div>
                                  <div className="col-span-3 text-slate-600 text-xs">
                                    {new Date(batch.production_date).toLocaleString('ro-RO', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                  <div className="col-span-2 text-xs text-slate-500">
                                    {getTimeAgo(batch.production_date)}
                                  </div>
                                  <div className="col-span-2 text-right font-semibold text-slate-800">
                                    {batch.quantity_produced}{' '}
                                    <span className="text-xs font-normal text-slate-400">L</span>
                                  </div>
                                  <div className="col-span-2 text-xs text-slate-500 truncate">
                                    {batch.produced_by || '—'}
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${age.color}`}
                                    >
                                      {age.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Reinventariere */}
      {adjustingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600">inventory</span>
                </div>
                <div>
                  <h3 className="font-manrope font-bold text-lg text-slate-900">
                    Ajustare Stoc
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reinventariere manuală pentru camera frigorifică.
                  </p>
                </div>
              </div>
              <button
                onClick={closeAdjustModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <form onSubmit={handleAdjustSave}>
              <div className="px-6 py-6">
                {adjustError && (
                  <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
                    {adjustError}
                  </div>
                )}

                {/* Numele ciorbei (read-only) */}
                <div className="mb-5">
                  <label className="block font-body text-sm font-semibold text-slate-700 mb-2">
                    Produs
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg py-3 px-4">
                    <span className="material-symbols-outlined text-orange-500 text-[20px]">soup_kitchen</span>
                    <span className="text-slate-900 font-semibold text-sm">{adjustingItem.recipe_name}</span>
                  </div>
                </div>

                {/* Cantitatea curentă (informativ) */}
                <div className="mb-5 flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">info</span>
                  <p className="text-sm text-slate-600">
                    Cantitate curentă în sistem:{' '}
                    <span className="font-bold text-slate-900">{adjustingItem.current_quantity} L</span>
                  </p>
                </div>

                {/* Input cantitate nouă */}
                <div>
                  <label
                    className="block font-body text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="adjust_quantity"
                  >
                    Cantitate Reală (Litri)
                  </label>
                  <input
                    required
                    autoFocus
                    id="adjust_quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    placeholder="Introdu cantitatea reală măsurată"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 text-slate-900 font-body text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 transition-all"
                  />
                  {Number(adjustQuantity) === 0 && adjustQuantity !== '' && (
                    <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Cantitatea 0 va elimina acest produs din inventar.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-b from-orange-600 to-orange-700 text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Confirmă Ajustarea
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

export default SoupInventory;
