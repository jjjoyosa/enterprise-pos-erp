import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, Clock, User, ShieldCheck, Plus, Minus, Equal } from 'lucide-react';

interface ManagerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagerDashboardModal: React.FC<ManagerDashboardModalProps> = ({ isOpen, onClose }) => {
  const [shiftData, setShiftData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchLiveShift();
  }, [isOpen]);

  const fetchLiveShift = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('erp_token');
      const res = await fetch('http://localhost:5000/api/v1/shifts/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShiftData(data);
      }
    } catch (error) {
      console.error('Failed to fetch shift data', error);
    } finally {
      setIsLoading(false);
    }
  };

  
  const breakdown = useMemo(() => {
    if (!shiftData) return null;
    
    let payIns = 0;
    let payOuts = 0;

    if (shiftData.cashMovements && Array.isArray(shiftData.cashMovements)) {
      shiftData.cashMovements.forEach((m: any) => {
        if (m.type === 'PAY_IN') payIns += m.amount;
        if (m.type === 'PAY_OUT') payOuts += m.amount;
      });
    }

    
    
    const cashSales = shiftData.expectedCash - shiftData.startingCash - payIns + payOuts;

    return {
      starting: shiftData.startingCash || 0,
      cashSales: cashSales > 0 ? cashSales : 0,
      payIns,
      payOuts,
      expected: shiftData.expectedCash || 0
    };
  }, [shiftData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-xl text-blue-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Manager Dashboard</h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">Live Terminal Audit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-slate-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-slate-400 font-bold animate-pulse">
              Syncing with drawer...
            </div>
          ) : !shiftData || !breakdown ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-red-100 text-red-500 font-bold">
              No active shift found for this terminal.
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Expected Cash Banner */}
              <div className="bg-white py-6 px-8 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-500"/> Expected Drawer Cash
                  </p>
                  <p className="text-5xl font-black text-slate-900 mt-2 tracking-tight">
                    ₱{breakdown.expected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right flex flex-col gap-2">
                   <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                     <User size={14} className="text-blue-500"/>
                     <span className="text-xs font-bold text-slate-700">
                       {shiftData?.cashierId?.name || shiftData?.cashierId?.name || 'Active Cashier'}
                     </span>
                   </div>
                   <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
                     <Clock size={14} className="text-orange-500"/>
                     <span className="text-xs font-bold text-slate-700">{shiftData.totalTransactions} Transactions</span>
                   </div>
                </div>
              </div>

              {/* The Breakdown Audit Trail */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-slate-100/50 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">Mathematical Breakdown</h3>
                </div>
                <div className="p-6 space-y-4">
                  
                  {/* Starting Float */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium text-sm">Starting Float</span>
                    <span className="font-bold">₱{breakdown.starting.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Cash Sales */}
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium text-sm flex items-center gap-2">
                      <div className="bg-emerald-100 p-0.5 rounded text-emerald-600"><Plus size={12}/></div> Cash Sales
                    </span>
                    <span className="font-bold text-emerald-600">+ ₱{breakdown.cashSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Pay Ins */}
                  {breakdown.payIns > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <div className="bg-blue-100 p-0.5 rounded text-blue-600"><Plus size={12}/></div> Pay Ins (Cash Added)
                      </span>
                      <span className="font-bold text-blue-600">+ ₱{breakdown.payIns.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Pay Outs */}
                  {breakdown.payOuts > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <div className="bg-red-100 p-0.5 rounded text-red-600"><Minus size={12}/></div> Petty Cash (Pay Outs)
                      </span>
                      <span className="font-bold text-red-600">- ₱{breakdown.payOuts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Total Line */}
                  <div className="border-t border-slate-200 pt-4 mt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <div className="bg-slate-200 p-0.5 rounded text-slate-700"><Equal size={12}/></div> Total Expected
                    </span>
                    <span className="text-xl font-black text-slate-900">₱{breakdown.expected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};