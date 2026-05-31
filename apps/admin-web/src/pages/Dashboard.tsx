import { useState, useMemo } from 'react';
import { useAnalytics, useABCAnalysis } from '../hooks/useAnalytics'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Loader2, Calendar, DollarSign, Layers, LayoutGrid, ListFilter } from 'lucide-react';

export const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  
  
  const [activeView, setActiveView] = useState<'overview' | 'abc'>('overview');

  const dateParams = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    if (dateFilter === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'week') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (dateFilter === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }, [dateFilter]);

  const { data, isLoading, isError } = useAnalytics(dateParams);
  const { data: abcData, isLoading: abcLoading } = useABCAnalysis(dateParams);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-600px">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading real-time analytics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 min-h-600px">
        <AlertCircle className="mb-4" size={32} />
        <p>Failed to load dashboard data. Is the API running?</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-4">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm text-gray-500">Live operational overview.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* --- NEW: Tabbed Interface Toggle --- */}
          <div className="flex items-center p-1 bg-gray-100/80 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeView === 'overview' 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              <LayoutGrid size={16} /> Overview
            </button>
            <button
              onClick={() => setActiveView('abc')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeView === 'abc' 
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              <ListFilter size={16} /> ABC Analysis
            </button>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Calendar size={18} className="text-gray-400" />
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================
          TAB 1: OVERVIEW 
          ========================================= */}
      {activeView === 'overview' && (
        <div className="animate-fadeIn space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  ₱{(data.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-xl text-green-600">
                <DollarSign size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  ₱{(data.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
                <ShoppingBag size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
                <h2 className="text-3xl font-bold text-gray-900">{data.orderCount} Transactions</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products</h3>
              <div className="h-70 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="totalSold" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="text-red-500" size={20} />
                <h3 className="text-lg font-bold text-gray-900">Critical Stock Warning</h3>
              </div>
              
              {data.lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">All inventory levels are healthy.</p>
              ) : (
                <div className="space-y-4">
                  {data.lowStockProducts.map((product: any) => (
                    <div key={product._id} className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg border border-red-100">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                      </div>
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        {product.stock} left
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: ABC ANALYSIS 
          ========================================= */}
      {activeView === 'abc' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-fadeIn min-h-600px">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={20}/> Product Performance Classification
              </h3>
              <p className="text-sm text-gray-500 mt-1">Identify which products drive the most revenue vs. dead stock.</p>
            </div>
            
            {!abcLoading && abcData && (
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold">
                  A-Grade: {abcData.summary.A}
                </div>
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-bold">
                  B-Grade: {abcData.summary.B}
                </div>
                <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold">
                  C-Grade: {abcData.summary.C}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {abcLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Product</th>
                    <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Grade</th>
                    <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Revenue</th>
                    <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Stock</th>
                    <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {abcData?.items.map((item) => {
                    let actionBadge = null;
                    if (item.grade === 'A' && item.currentStock < 15) {
                      actionBadge = <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200">🚨 REORDER</span>;
                    } else if (item.grade === 'C' && item.currentStock > 30) {
                      actionBadge = <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold border border-yellow-200">💸 LIQUIDATE</span>;
                    } else {
                      actionBadge = <span className="text-gray-400 text-xs font-medium">--</span>;
                    }

                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                        </td>
                        <td className="p-4">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm border shadow-sm
                            ${item.grade === 'A' ? 'bg-green-100 text-green-700 border-green-200' : 
                              item.grade === 'B' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                              'bg-gray-100 text-gray-600 border-gray-200'}`}
                          >
                            {item.grade}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-900 text-right">
                          ₱{item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          <div className="text-[10px] text-gray-400 font-sans mt-0.5">Top {item.cumulativePercentage.toFixed(1)}%</div>
                        </td>
                        <td className="p-4 text-center font-bold text-gray-700">
                          {item.currentStock}
                        </td>
                        <td className="p-4 text-right">
                          {actionBadge}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {abcData?.items.length === 0 && (
                    <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No sales data available for this period.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};