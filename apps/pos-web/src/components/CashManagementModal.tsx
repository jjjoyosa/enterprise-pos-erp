import React, { useState } from 'react';
import { X, ArrowDownToLine, ArrowUpFromLine, Wallet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';

interface CashManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashManagementModal: React.FC<CashManagementModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  
  const [type, setType] = useState<'PAY_IN' | 'PAY_OUT'>('PAY_IN');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [successData, setSuccessData] = useState<{ type: string, amount: number } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    
    setAmount('');
    setReason('');
    setType('PAY_IN');
    setLocalError(null);
    setSuccessData(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!amount || Number(amount) <= 0) {
      setLocalError('Please enter a valid amount.');
      return;
    }
    if (!reason.trim()) {
      setLocalError('Please provide a reason for this cash movement.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      type,
      amount: Number(amount),
      reason
    };

    api.post('/shifts/cash-movement', payload)
      .then(() => {
        
        queryClient.invalidateQueries({ queryKey: ['current-shift'] });
        
        
        setIsSubmitting(false);
        setSuccessData({ type: payload.type, amount: payload.amount });
      })
      .catch((error: any) => {
        console.error(error);
        setIsSubmitting(false);
        setLocalError(error.response?.data?.error || "Failed to record cash movement. Please try again.");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cash Management</h2>
              <p className="text-xs text-gray-500 font-medium">Record Pay Ins and Pay Outs</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* --- VIEW 1: SUCCESS SCREEN --- */}
        {successData ? (
          <div className="p-8 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className={`p-4 rounded-full mb-4 ${successData.type === 'PAY_IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-8 text-sm">
              {successData.type === 'PAY_IN' ? 'Pay In' : 'Pay Out'} of <span className="font-bold font-mono">₱{successData.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> has been recorded and your drawer expected cash has been updated.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl text-white font-bold bg-gray-900 hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* --- VIEW 2: INPUT FORM --- */
          <>
            {/* Local Validation Error */}
            {localError && (
              <div className="p-4 text-sm font-bold flex items-center gap-2 bg-red-50 text-red-700 border-b border-red-100">
                <AlertCircle size={18} />
                {localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Type Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('PAY_IN')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    type === 'PAY_IN' ? 'bg-white text-green-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ArrowDownToLine size={16} /> Pay In (Add)
                </button>
                <button
                  type="button"
                  onClick={() => setType('PAY_OUT')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    type === 'PAY_OUT' ? 'bg-white text-red-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ArrowUpFromLine size={16} /> Pay Out (Drop)
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₱)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    required
                  />
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason / Remark</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={type === 'PAY_IN' ? "e.g., Morning change fund" : "e.g., Water delivery, Supplier payment"}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-colors ${
                  type === 'PAY_IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSubmitting ? 'Recording...' : `Confirm ${type === 'PAY_IN' ? 'Pay In' : 'Pay Out'}`}
              </button>

            </form>
          </>
        )}
      </div>
    </div>
  );
};