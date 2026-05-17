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

  // Calculăm volumul total
  const totalQuantity = stock.reduce((sum, item) => sum + Number(item.current_quantity), 0);

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
            Cold Storage
          </p>
          <h2 className="text-4xl font-manrope font-extrabold text-slate-900 tracking-tight">
            Soup Inventory
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
                Total Volume
              </p>
              <p className="text-3xl font-manrope font-black text-slate-900 leading-none">
                {totalQuantity}{' '}
                <span className="text-lg text-slate-400 font-bold ml-0.5">Liters</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secțiunea Principală - Tabelul */}
      <div className="flex flex-col gap-6">
        {/* Batch Data Table */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-200">
          <div className="w-full text-left font-body">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-manrope">
              <div className="col-span-4">Soup Name</div>
              <div className="col-span-3">Prod. Date</div>
              <div className="col-span-1 text-right">Volume</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col gap-1">
              {stock.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-medium">
                  The cold room is empty. Go to Production to cook some batches!
                </div>
              ) : (
                stock.map((item, index) => {
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center rounded-lg transition-colors group ${
                        isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      {/* <div className="col-span-2 font-manrope font-bold text-slate-900">
                        B-{item.id.toString().padStart(4, '0')}
                      </div> */}

                      <div className="col-span-4 font-semibold text-slate-800 truncate pr-2">
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

                      <div className="col-span-2 text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-end gap-1 ml-auto">
                          Move to Service
                          <span className="material-symbols-outlined text-[14px]">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoupInventory;
