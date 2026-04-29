import React, { useState, useEffect } from 'react';
import { getCookedStock } from '../services/productionService';

const SoupInventory = () => {
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // 1. Calculăm cantitatea totală de mâncare din frigider
  const totalQuantity = stock.reduce((sum, item) => sum + Number(item.current_quantity), 0);

  // 2. Funcție inteligentă pentru calcularea prospețimii (pe baza orei gătirii)
  const getFreshness = (dateString) => {
    const hoursOld = (new Date() - new Date(dateString)) / (1000 * 60 * 60);

    if (hoursOld > 48) {
      return {
        status: 'Critical',
        barColor: 'bg-red-500',
        textColor: 'text-red-600',
        width: '90%',
        alert: true,
      };
    }
    if (hoursOld > 24) {
      return {
        status: 'Good',
        barColor: 'bg-amber-500',
        textColor: 'text-amber-600',
        width: '50%',
        alert: false,
      };
    }
    return {
      status: 'Optimal',
      barColor: 'bg-teal-500',
      textColor: 'text-teal-600',
      width: '15%',
      alert: false,
    };
  };

  // Numărăm câte batch-uri sunt "Critice"
  const criticalBatches = stock.filter((item) => getFreshness(item.last_updated).alert).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-orange-600">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-manrope text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Cold Storage Inventory
          </h2>
          <p className="font-body text-slate-500 text-lg">
            Real-time monitoring of finished soup batches in main fridge.
          </p>
        </div>
        {/* Filters */}
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-lg text-orange-600">filter_list</span>
            All Soups
          </button>
        </div>
      </div>

      {/* Bento Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Quantity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-6 z-10">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Total Finished Volume</h3>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <span className="material-symbols-outlined">water_drop</span>
            </div>
          </div>
          <div className="z-10">
            <div className="flex items-baseline gap-2">
              <span className="font-manrope text-5xl font-black text-slate-900 tracking-tighter">
                {totalQuantity}
              </span>
              <span className="font-body text-slate-500 font-medium">Units</span>
            </div>
            <p className="font-body text-sm text-teal-600 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Live data from database
            </p>
          </div>
        </div>

        {/* Expiry Warning */}
        <div
          className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
            criticalBatches > 0 ? 'border-red-500' : 'border-green-500'
          } flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Batches Near Expiry</h3>
            <div
              className={`p-2 rounded-lg ${
                criticalBatches > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}
            >
              <span className="material-symbols-outlined">warning</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-manrope text-5xl font-black tracking-tighter ${
                  criticalBatches > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {criticalBatches}
              </span>
              <span className="font-body text-slate-500 font-medium">Batches</span>
            </div>
            <p className="font-body text-sm text-slate-500 mt-2">
              {criticalBatches > 0
                ? 'Require immediate action!'
                : 'All batches are perfectly fresh.'}
            </p>
          </div>
        </div>

        {/* Fridge Temp (Simulated) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-teal-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-6 z-10">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Fridge Temp</h3>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <span className="material-symbols-outlined">ac_unit</span>
            </div>
          </div>
          <div className="z-10 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-manrope text-5xl font-black text-teal-600 tracking-tighter">
                  2.4
                </span>
                <span className="font-manrope text-2xl font-bold text-teal-600">°C</span>
              </div>
              <p className="font-body text-sm text-slate-500 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span> Optimal Zone
              </p>
            </div>
            <div className="h-16 w-4 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end border border-slate-200">
              <div className="w-full bg-teal-500 h-3/4 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Inventory Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-manrope text-2xl font-bold text-slate-900">Active Batches</h3>
          <div className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            {stock.length} Batches Logged
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {stock.length === 0 ? (
            <p className="col-span-full text-center py-10 text-slate-500">
              The cold room is empty.
            </p>
          ) : (
            stock.map((item) => {
              const freshness = getFreshness(item.last_updated);

              // Folosim o imagine default de tip "placeholder" estetică
              const imageUrl = `https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=80`;

              return (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-transform hover:-translate-y-1 duration-300 relative group"
                >
                  {/* Warning Badge (Dacă e nevoie) */}
                  {freshness.alert && (
                    <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">timer</span> Urgent
                    </div>
                  )}

                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.recipe_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/30">
                        #{item.id}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="font-manrope text-xl font-bold text-slate-900 mb-1">
                      {item.recipe_name}
                    </h4>
                    <p className="font-body text-sm text-slate-500 mb-6">
                      Produced:{' '}
                      {new Date(item.last_updated).toLocaleString(undefined, {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {/* Volume & Freshness Card */}
                    <div className="mb-6 bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-slate-700 font-semibold">
                          Volume Remaining
                        </span>
                        <span className="font-manrope font-bold text-orange-600 text-lg">
                          {item.current_quantity}{' '}
                          <span className="text-slate-400 text-sm font-medium">
                            {item.unit_of_measure}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline mb-2 mt-4">
                        <span className="text-sm text-slate-700 font-semibold">
                          Freshness Status
                        </span>
                        <span className={`text-xs font-bold ${freshness.textColor}`}>
                          {freshness.status}
                        </span>
                      </div>
                      {/* Freshness Bar */}
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${freshness.barColor}`}
                          style={{ width: freshness.width }}
                        ></div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
                      <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold py-2 rounded-md transition-colors text-center shadow-sm">
                        Log Service
                      </button>
                      <button className="flex-1 bg-transparent border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm font-semibold py-2 rounded-md transition-colors text-center">
                        Dispose
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default SoupInventory;
