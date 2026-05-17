import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../services/analyticsService';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const COLORS = ['#ea580c', '#f97316', '#fdba74', '#0f766e', '#14b8a6', '#99f6e4', '#64748b'];

const Analytics = () => {
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

  if (error)
    return <div className="text-red-500 font-body p-8">Eroare la încărcarea panoului: {error}</div>;

  const { kpis, charts } = data;

  return (
    <div className="flex-1 relative pb-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-manrope text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Panou Analize
        </h2>
        <p className="font-body text-slate-500 text-sm max-w-2xl">
          Analize în timp real ale operațiunilor culinare, inventarului și producției.
        </p>
      </div>

      {/* SECTION 1: Top Row KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1: Total Ingredients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">
              Total Ingrediente
            </h3>
            <span className="material-symbols-outlined text-orange-600 p-2 bg-orange-50 rounded-lg">
              kitchen
            </span>
          </div>
          <p className="text-3xl font-manrope font-black text-slate-900 tracking-tight">
            {kpis.totalIngredients}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-body">
            <span className="text-slate-400">Înregistrate în nomenclator</span>
          </div>
        </div>

        {/* KPI 2: Active Batches */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">
              Inventar Ciorbe
            </h3>
            <span className="material-symbols-outlined text-sky-600 p-2 bg-sky-50 rounded-lg">
              soup_kitchen
            </span>
          </div>
          <p className="text-3xl font-manrope font-black text-slate-900 tracking-tight">
            {kpis.activeMarmites}{' '}
            <span className="text-lg font-bold text-slate-400">Litri</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-body">
            <span className="text-slate-400">În camera frigorifică</span>
          </div>
        </div>

        {/* KPI 3: Low Stock */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-red-600 uppercase tracking-wider">
              Alerte Stoc Scăzut
            </h3>
            <span className="material-symbols-outlined text-red-600 p-2 bg-red-50 rounded-lg">
              warning
            </span>
          </div>
          <p className="text-3xl font-manrope font-black text-red-600 tracking-tight">
            {kpis.lowStockAlerts} <span className="text-lg font-bold text-red-400/70">Articole</span>
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-body text-red-500 font-medium">
            Revizuiește inventarul imediat
          </div>
        </div>

        {/* KPI 4: Efficiency */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-manrope font-bold text-slate-500 uppercase tracking-wider">
              Eficiență
            </h3>
            <span className="material-symbols-outlined text-teal-600 p-2 bg-teal-50 rounded-lg">
              speed
            </span>
          </div>
          <p className="text-3xl font-manrope font-black text-teal-700 tracking-tight">
            {kpis.productionEfficiency}% TODO
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs font-body">
            <span className="material-symbols-outlined text-[14px] text-teal-600">trending_up</span>
            <span className="text-teal-600 font-bold">+1.2%</span>
            <span className="text-slate-400">față de țintă</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col min-h-[360px]">
          <div className="mb-6">
            <h3 className="font-manrope text-lg font-bold text-slate-900">
              Volum Producție Săptămânală
            </h3>
            <p className="text-sm font-body text-slate-500">Litri produși pe zi</p>
          </div>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={charts.weeklyVolume}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#ea580c', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#ea580c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Charts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Top Ingredients (Real DB Data) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-1">
            <h3 className="font-manrope text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Top Ingrediente Folosite
            </h3>
            {charts.topIngredients && charts.topIngredients.length > 0 ? (
              <>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.topIngredients}
                      layout="vertical"
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" hide />
                      <RechartsTooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value, name, props) => [
                          `${value} ${props.payload.unit}`,
                          'Total Consumat',
                        ]}
                      />
                      <Bar dataKey="use" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Labels for Bar Chart */}
                <div className="flex flex-col gap-2 mt-2">
                  {charts.topIngredients.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-body">
                      <span className="text-slate-600 font-medium truncate pr-2" title={item.name}>
                        {item.name}
                      </span>
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        {item.use} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[150px]">
                <p className="text-slate-400 text-xs font-medium">Niciun ingredient consumat încă.</p>
              </div>
            )}
          </div>

          {/* Category Distribution (Real DB Data) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex-1 flex flex-col">
            <h3 className="font-manrope text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Categorii Inventar
            </h3>
            <h3>TODO</h3>
            <div className="flex-1 min-h-[150px] relative flex items-center justify-center">
              {charts.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryDistribution}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {charts.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-xs">Fără date de categorie.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Recipes Table (Real DB Data) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-manrope text-lg font-bold text-slate-900">
              Cele Mai Bune Rețete
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-manrope font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Nume Rețetă</th>
                  <th className="px-6 py-4">Șarje Gătite</th>
                  <th className="px-6 py-4 text-right">Volum Total</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body text-slate-800 divide-y divide-slate-100">
                {charts.topRecipes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">
                      Fără date de producție încă.
                    </td>
                  </tr>
                ) : (
                  charts.topRecipes.map((recipe, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{recipe.name}</td>
                      <td className="px-6 py-4 text-slate-500">{recipe.frequency} Șarje</td>
                      <td className="px-6 py-4 text-right font-manrope font-bold text-orange-600">
                        {recipe.total_volume} Litri
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Stock Heatmap (Real DB Data) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-manrope text-lg font-bold text-slate-900">Stoc Critic</h3>
            <span className="material-symbols-outlined text-red-500">local_fire_department</span>
          </div>
          <div className="space-y-3">
            {charts.criticalStock.length === 0 ? (
              <p className="text-slate-500 text-sm">Toate ingredientele au stoc suficient!</p>
            ) : (
              charts.criticalStock.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div>
                    <p className="text-sm font-manrope font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 font-body mt-0.5">
                      Limită alertă: {item.alert_threshold}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-red-700 text-sm font-black font-manrope">
                      {item.current_stock}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-500">
                      Curent
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
