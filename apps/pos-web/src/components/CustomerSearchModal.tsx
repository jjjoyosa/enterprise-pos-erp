import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { Search, X, Trophy, Phone, User, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { CustomerFormModal } from './CustomerFormModal';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
  lifetimeValue?: number;
}

export const CustomerSearchModal = ({ isOpen, onClose, onSelect }: any) => {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchCustomers();
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers(); 
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const openEditForm = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(query.toLowerCase()) || 
    c.lastName.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: '85vh' }}>
          
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">Assign Customer</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={openCreateForm} className="flex items-center gap-1.5 text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                <UserPlus size={16} /> New
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100 shrink-0 shadow-sm z-10 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Search by name or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 bg-gray-50">
            {filteredCustomers.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                 <User size={32} className="mb-2 opacity-50" />
                 <span className="text-sm font-medium">No customers found</span>
               </div>
            ) : (
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <div 
                    key={c._id} 
                    onClick={() => { onSelect(c); onClose(); }}
                    className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50 rounded-xl cursor-pointer transition-all group text-left border border-transparent hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200 text-gray-600 group-hover:text-blue-700 rounded-full flex items-center justify-center font-bold text-sm transition-colors border border-gray-200 group-hover:border-blue-300 uppercase">
                        {c.firstName.charAt(0)}{c.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 group-hover:text-blue-800 transition-colors">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-gray-400" /> 
                          {c.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Action Buttons: Hidden by default, appear on hover */}
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 mr-2">
                        <button onClick={(e) => openEditForm(e, c)} className="p-1.5 bg-white shadow-sm border border-gray-200 rounded text-blue-500 hover:bg-blue-50 transition-colors" title="Edit Customer">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(e, c._id)} className="p-1.5 bg-white shadow-sm border border-gray-200 rounded text-red-500 hover:bg-red-50 transition-colors" title="Delete Customer">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-end bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <Trophy size={12} /> {c.loyaltyPoints || 0} pts
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 font-medium">
                          LTV: ₱{(c.lifetimeValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerFormModal 
        isOpen={isFormOpen}
        initialData={editingCustomer}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCustomers}
      />
    </>
  );
};