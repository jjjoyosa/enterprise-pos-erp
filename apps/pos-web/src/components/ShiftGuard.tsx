import React, { useState } from 'react';
import { useOpenShift } from '../hooks/useShift';
import { Lock, Loader2 } from 'lucide-react';

export const ShiftGuard: React.FC = () => {
  const [startingCash, setStartingCash] = useState<string>('');
  const { mutate: openShift, isPending, isError } = useOpenShift();

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingCash || Number(startingCash) < 0) return;
    
    openShift(Number(startingCash));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center animate-fadeIn">
        <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-blue-600" size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Locked</h2>
        <p className="text-gray-500 mb-8 text-sm">
          You must declare your starting cash (float) to open a new shift and begin processing sales.
        </p>

        {isError && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
            Failed to open shift. Please try again.
          </div>
        )}

        <form onSubmit={handleOpenShift} className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Starting Cash (₱)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-600 outline-none transition-colors font-mono"
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isPending || !startingCash}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-lg font-bold py-4 rounded-xl flex justify-center items-center transition-colors"
          >
            {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Open Register'}
          </button>
        </form>
      </div>
    </div>
  );
};