import { useState, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Loader2, Calendar, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');

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
    <div className="animate-fadeIn">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm text-gray-500">Live operational overview.</p>
        </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Gross Revenue</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {/* ADDED || 0 FALLBACK HERE */}
              ₱{(data.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Net Profit</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {/* ADDED || 0 FALLBACK HERE */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
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
  );
};