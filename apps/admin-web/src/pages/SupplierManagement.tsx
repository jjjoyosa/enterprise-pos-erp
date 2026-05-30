import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/useSuppliers';
import { Plus, Truck, Building2, Phone, Mail, Loader2, X, Edit, Trash2, AlertCircle, Clock } from 'lucide-react';

export const SupplierManagement = () => {
  const { data: suppliers, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', contactPerson: '', email: '', phone: '', tin: '', paymentTerms: 'CASH', leadTimeDays: 3, currency: 'PHP'
  });

  const openCreateForm = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', tin: '', paymentTerms: 'CASH', leadTimeDays: 3, currency: 'PHP' });
    setIsModalOpen(true);
  };

  const openEditForm = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({ 
      name: supplier.name, 
      contactPerson: supplier.contactPerson || '', 
      email: supplier.email || '', 
      phone: supplier.phone || '', 
      tin: supplier.tin || '', 
      paymentTerms: supplier.paymentTerms || 'CASH',
      leadTimeDays: supplier.leadTimeDays || 3,
      currency: supplier.currency || 'PHP'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      await updateMutation.mutateAsync({ id: editingSupplier._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (supplierToDelete) {
      await deleteMutation.mutateAsync(supplierToDelete._id);
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Premium Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-blue-600" /> Supplier Directory
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage vendor profiles, contact information, and payment terms.</p>
        </div>
        
        <button 
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} /> Add New Supplier
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Archive Supplier?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove <strong>{supplierToDelete.name}</strong>? They will be hidden from new purchase orders.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSupplierToDelete(null)} className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="flex-1 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex justify-center items-center">
                {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Supplier Details</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Contact Info</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">TIN</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Operations</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Payment Terms</th>
                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center text-blue-600">
                      <Loader2 className="animate-spin mb-2" size={24} />
                      <span className="text-gray-500 text-sm font-medium">Loading suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                    No suppliers found. Click "Add New Supplier" to get started.
                  </td>
                </tr>
              ) : (
                suppliers?.map((supplier: any) => (
                  <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block text-base">{supplier.name}</span>
                        <span className="text-xs text-gray-500">{supplier.contactPerson || 'No point of contact'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {supplier.phone && <div className="flex items-center gap-2 text-gray-600 text-xs"><Phone size={12}/> {supplier.phone}</div>}
                        {supplier.email && <div className="flex items-center gap-2 text-gray-600 text-xs"><Mail size={12}/> {supplier.email}</div>}
                        {!supplier.phone && !supplier.email && <span className="text-gray-400 italic text-xs">Unspecified</span>}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">{supplier.tin || 'N/A'}</td>
                    <td className="p-4">
                       <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-100 w-fit px-2 py-1 rounded border border-gray-200">
                         <Clock size={12} className="text-gray-500"/> 
                         {supplier.leadTimeDays || 3} Days
                       </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="w-fit px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200">
                          {supplier.paymentTerms.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">
                          CURRENCY: {supplier.currency || 'PHP'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditForm(supplier)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setSupplierToDelete(supplier)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Archive Supplier"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Modal for adding/editing suppliers */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[500px] overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-blue-600" size={20} /> {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name *</label>
                <input required placeholder="e.g. Acme Distributors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Person</label>
                  <input placeholder="e.g. Jane Doe" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">TIN</label>
                  <input placeholder="000-000-000-000" value={formData.tin} onChange={e => setFormData({...formData, tin: e.target.value})} className="w-full font-mono text-sm border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" placeholder="contact@acme.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input placeholder="+63 900 000 0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Lead Time (Days) *</label>
                  <input type="number" min="0" required value={formData.leadTimeDays} onChange={e => setFormData({...formData, leadTimeDays: Number(e.target.value)})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Currency</label>
                  <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white">
                    <option value="PHP">PHP (₱)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Terms</label>
                <select value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all bg-white">
                  <option value="CASH">Cash on Delivery (CASH)</option>
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days</option>
                  <option value="NET_60">Net 60 Days</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
                  {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (editingSupplier ? 'Update Supplier' : 'Save Supplier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};