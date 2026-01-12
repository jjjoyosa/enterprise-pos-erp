import React from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Package, AlertTriangle, Activity, DollarSign 
} from 'lucide-react';

function App() {
  const { data: metrics, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Error loading dashboard metrics. Ensure the API is running.
      </div>
    );
  }

  
  const chartData = metrics.weeklyRevenue.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    Revenue: item.total
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise ERP</h1>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          Executive View
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="bg-green-100 p-4 rounded-xl text-green-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today's Gross Sales</p>
              <h2 className="text-3xl font-black text-gray-900">
                ₱{metrics.todayGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today's Transactions</p>
              <h2 className="text-3xl font-black text-gray-900">
                {metrics.todayCount} <span className="text-base font-normal text-gray-400">orders</span>
              </h2>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="bg-amber-100 p-4 rounded-xl text-amber-600">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Low Stock Items</p>
              <h2 className="text-3xl font-black text-gray-900">
                {metrics.lowStockItems.length} <span className="text-base font-normal text-gray-400">alerts</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Chart & Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" /> 7-Day Revenue Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `₱${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, 'Revenue']}                  />
                  <Line 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-0 shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              <h3 className="text-lg font-bold text-gray-800">Restock Required</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {metrics.lowStockItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                  <Package size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">Inventory levels are healthy.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.lowStockItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-sm text-center min-w-[3.5rem]">
                        <span className="block text-xs font-bold text-red-600">{item.currentStock}</span>
                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Left</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;