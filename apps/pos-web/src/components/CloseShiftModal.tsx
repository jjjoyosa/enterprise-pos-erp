import React, { useState } from 'react';
import { useCloseShift } from '../hooks/useShift';
import { LogOut, Loader2, FileText, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface CloseShiftModalProps {
  onClose: () => void;
}

export const CloseShiftModal: React.FC<CloseShiftModalProps> = ({ onClose }) => {
  const [endingCash, setEndingCash] = useState<string>('');
  const { mutate: closeShift, isPending, isSuccess, data } = useCloseShift();
  const queryClient = useQueryClient();

  const handleLockTerminal = () => {
    onClose(); 
    queryClient.invalidateQueries({ queryKey: ['current-shift'] }); 
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!endingCash || Number(endingCash) < 0) return;
    
    closeShift(Number(endingCash));
  };

  
  if (isSuccess && data?.summary) {
    const { summary } = data;
    const isShort = summary.variance < 0;
    const isBalanced = summary.variance === 0;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
          <div className="bg-gray-900 text-white p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-blue-400 mb-2" />
            <h2 className="text-xl font-bold">Shift Z-Reading</h2>
            <p className="text-sm text-gray-400">Register Closed Successfully</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Starting Cash (Float):</span>
              <span className="font-mono">₱{summary.startingCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Cash Sales:</span>
              <span className="font-mono">₱{summary.cashSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* --- NEW ROWS FOR CASH MANAGEMENT --- */}
            {(summary.totalPayIns || 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Total Pay Ins:</span>
                <span className="font-mono">+₱{summary.totalPayIns.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {(summary.totalPayOuts || 0) > 0 && (
              <div className="flex justify-between text-sm text-red-500 font-medium">
                <span>Total Pay Outs:</span>
                <span className="font-mono">-₱{summary.totalPayOuts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {/* ------------------------------------ */}

            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
              <span>Expected in Drawer:</span>
              <span className="font-mono text-blue-600">₱{summary.expectedCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 pb-3 border-b border-gray-100">
              <span>Actual Counted Cash:</span>
              <span className="font-mono">₱{summary.actualEndingCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Variance Alert Box */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <AlertCircle size={24} className="shrink-0" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  {isBalanced ? 'Perfectly Balanced' : isShort ? 'Drawer is Short' : 'Drawer is Over'}
                </div>
                <div className="text-xl font-black font-mono">
                  ₱{Math.abs(summary.variance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={handleLockTerminal}
              className="w-full bg-gray-900 hover:bg-black text-white text-lg font-bold py-4 rounded-xl transition-colors"
            >
              Lock Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <LogOut className="text-red-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Close Shift</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2">&times;</button>
        </div>
        
        <p className="text-gray-500 mb-6 text-sm">
          Count the physical cash in your drawer and enter the total below to close the register and generate your Z-Reading.
        </p>

        <form onSubmit={handleCloseShift} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Counted Cash (₱)</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-red-500 outline-none transition-colors font-mono"
              value={endingCash}
              onChange={(e) => setEndingCash(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isPending || !endingCash}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-lg font-bold py-4 rounded-xl flex justify-center items-center transition-colors"
          >
            {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Finalize & Close Register'}
          </button>
        </form>
      </div>
    </div>
  );
};