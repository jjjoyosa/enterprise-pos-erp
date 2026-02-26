import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Activity, Lock, Loader2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && pinCode) {
      login(email, pinCode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
        
        <div className="bg-blue-600 p-8 text-center flex flex-col items-center">
          <div className="bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-sm">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise ERP</h1>
          <p className="text-blue-100 text-sm mt-2">Executive Dashboard Login</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm font-medium">
              <Lock size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Admin Email</label>
              <input 
                type="email" 
                required
                placeholder="admin@enterprise.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Secure PIN</label>
              <input 
                type="password" 
                required
                placeholder="••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm font-mono tracking-widest"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoading || !email || !pinCode}
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center mt-2 shadow-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate System'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};