import React, { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Lock, Loader2, Activity } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pinCode, setPassword] = useState('');
  const { mutate: login, isPending, isError, error } = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pinCode) return;
    login({ email, pinCode });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-2">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Activity size={40} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-gray-900 tracking-tight">
          Enterprise ERP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your secure terminal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {isError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl font-medium border border-red-100 flex items-start gap-3">
              <Lock size={18} className="shrink-0 mt-0.5" />
              <span>{(error as any)?.response?.data?.error || 'Authentication failed. Please check your credentials.'}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-600 outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-600 outline-none transition-colors font-mono"
                value={pinCode}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !email || !pinCode}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            >
              {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};