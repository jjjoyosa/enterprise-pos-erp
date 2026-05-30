import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface ManagerOverrideModalProps {
  onSuccess: (managerName: string) => void;
  onCancel: () => void;
  actionName: string; 
}

export const ManagerOverrideModal: React.FC<ManagerOverrideModalProps> = ({ onSuccess, onCancel, actionName }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/employees/verify-pin', { pinCode: pin });
      
      onSuccess(response.data.authorizedBy); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid PIN. Access Denied.');
      setPin(''); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100">
        
        <div className="bg-red-50 p-6 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <h3 className="text-xl font-black text-red-900 mb-1 tracking-tight">Manager Override</h3>
          <p className="text-red-700 text-sm font-medium">Authorization required to {actionName.toLowerCase()}.</p>
        </div>

        <form onSubmit={handleVerify} className="p-6 space-y-5 bg-white">
          <div>
            <input 
              type="password" 
              autoFocus
              placeholder="••••" 
              className={`w-full text-center tracking-[0.5em] font-mono text-3xl py-4 border-2 rounded-xl outline-none transition-all ${
                error ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
              }`}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
              maxLength={6}
              disabled={isLoading}
            />
            {error && <p className="text-red-600 text-xs font-bold text-center mt-3 animate-pulse">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onCancel} 
              disabled={isLoading}
              className="flex-1 py-3 text-gray-600 bg-gray-100 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || pin.length < 4} 
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl flex justify-center items-center transition-colors shadow-md shadow-red-600/20"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Authorize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};