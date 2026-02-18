import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[600px]">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading real-time analytics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 min-h-[600px]">
        <AlertCircle className="mb-4" size={32} />
        <p>Failed to load dashboard data. Is the API running?</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-sm text-gray-500">Live operational overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Revenue</p>
            <h2 className="text-3xl font-bold text-gray-900">
              ₱{data.todaysRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <ShoppingBag size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Orders Today</p>
            <h2 className="text-3xl font-bold text-gray-900">{data.orderCount} Transactions</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Selling Products (Lifetime)</h3>
          <div className="h-[300px] w-full">
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
              {/* Filter removed: Relies on the backend returning clean data */}
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