import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../services/analyticsService';

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDashboardData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-orange-600 py-20">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 font-body p-8">Error loading dashboard: {error}</div>;
  }

  const { kpis, charts } = data;
  const isManager = user?.role === 'MANAGER';

  return (
    <div className="flex-1 pb-10">
      {/* Welcome Section */}
      <div className="mb-10">
        <h2 className="font-manrope text-4xl text-slate-900 font-extrabold mb-2 tracking-tight">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-slate-500 font-body">
          Here's what's happening in your kitchen today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Link to="/production" className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
          <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">soup_kitchen</span>
          <span className="font-manrope font-bold text-sm">New Batch</span>
        </Link>
        {isManager && (
          <>
            <Link to="/invoices" className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
              <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">receipt_long</span>
              <span className="font-manrope font-bold text-sm">Add Invoice</span>
            </Link>
            <Link to="/ingredients" className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
              <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">grocery</span>
              <span className="font-manrope font-bold text-sm">Manage Stock</span>
            </Link>
          </>
        )}
        <Link to="/soup-inventory" className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors group">
          <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">kitchen</span>
          <span className="font-manrope font-bold text-sm">Cold Storage</span>
        </Link>
      </div>

      {/* KPIs Grid */}
      <h3 className="font-manrope text-xl font-bold text-slate-900 mb-4">At a Glance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* KPI 1: Active Batches */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">Active Batches</h3>
            <span className="material-symbols-outlined text-sky-600 p-2 bg-sky-50 rounded-lg">soup_kitchen</span>
          </div>
          <p className="text-3xl font-manrope font-black text-slate-900 tracking-tight">
            {kpis.activeMarmites} <span className="text-lg font-bold text-slate-400">Pots</span>
          </p>
        </div>

        {/* KPI 2: Low Stock */}
        <div className={`rounded-xl p-6 shadow-sm border relative overflow-hidden ${kpis.lowStockAlerts > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-sm font-manrope font-bold uppercase tracking-wider ${kpis.lowStockAlerts > 0 ? 'text-red-600' : 'text-slate-500'}`}>Low Stock Alerts</h3>
            <span className={`material-symbols-outlined p-2 rounded-lg ${kpis.lowStockAlerts > 0 ? 'text-red-600 bg-red-100' : 'text-slate-400 bg-slate-50'}`}>warning</span>
          </div>
          <p className={`text-3xl font-manrope font-black tracking-tight ${kpis.lowStockAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {kpis.lowStockAlerts} <span className={`text-lg font-bold ${kpis.lowStockAlerts > 0 ? 'text-red-400' : 'text-slate-400'}`}>Items</span>
          </p>
        </div>

        {/* KPI 3: Total Ingredients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">Ingredients</h3>
            <span className="material-symbols-outlined text-orange-600 p-2 bg-orange-50 rounded-lg">kitchen</span>
          </div>
          <p className="text-3xl font-manrope font-black text-slate-900 tracking-tight">
            {kpis.totalIngredients}
          </p>
        </div>

        {/* KPI 4: Efficiency */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">Efficiency</h3>
            <span className="material-symbols-outlined text-teal-600 p-2 bg-teal-50 rounded-lg">speed</span>
          </div>
          <p className="text-3xl font-manrope font-black text-teal-700 tracking-tight">
            {kpis.productionEfficiency}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Stock Action List */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Needs Attention (Stock)</h3>
            <Link to="/ingredients" className="text-orange-600 text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="p-6 space-y-3 flex-1">
            {charts.criticalStock.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 text-sm">All ingredients are well stocked! 🎉</p>
              </div>
            ) : (
              charts.criticalStock.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <p className="text-sm font-manrope font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 font-body mt-0.5">Alert limit: {item.alert_threshold}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-red-700 text-sm font-black font-manrope">{item.current_stock}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">Current</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Recipes Summary */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Top Recipes This Week</h3>
            <Link to="/analytics" className="text-orange-600 text-sm font-bold hover:underline">Full Report</Link>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-4">
              {charts.topRecipes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500 text-sm">No production data yet.</p>
                </div>
              ) : (
                charts.topRecipes.map((recipe, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </div>
                      <span className="font-semibold text-slate-800 text-sm">{recipe.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block text-sm">{recipe.total_volume} <span className="text-slate-500 text-xs font-normal">Marmites</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
