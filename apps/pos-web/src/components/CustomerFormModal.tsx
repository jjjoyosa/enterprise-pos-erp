import React, { useState, useEffect } from 'react';
import { X, Save, User, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; 
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
      });
    } else {
      setFormData({ firstName: '', lastName: '', phone: '', email: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await api.put(`/customers/${initialData._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-slideUp">
        
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              {isEditing ? 'Edit Customer Profile' : 'Register New Customer'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">First Name *</label>
                <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Last Name *</label>
                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Phone Number *</label>
              <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Email Address (Optional)</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="mt-8">
            <button disabled={isLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-base font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-colors">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> {isEditing ? 'Save Changes' : 'Register Customer'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};