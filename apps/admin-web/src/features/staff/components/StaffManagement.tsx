import React, { useState } from 'react';
import { useStaff, useCreateStaff } from '../api/useStaff';
import { Users, Plus, Shield, Loader2 } from 'lucide-react';

export const StaffManagement = () => {
  const { data: staff = [], isLoading } = useStaff();
  const { mutate: createStaff, isPending } = useCreateStaff();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'CASHIER' | 'MANAGER' | 'ADMIN';
    pinCode: string;
  }>({ 
    name: '', 
    email: '', 
    role: 'CASHIER', 
    pinCode: '' 
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaff(formData, {
      onSuccess: () => {
        setIsFormOpen(false);
        setFormData({ name: '', email: '', role: 'CASHIER', pinCode: '' });
      }
    });
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage POS access, roles, and secure PINs.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">New Employee Details</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">System Role</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}
              >
                <option value="CASHIER">POS Cashier</option>
                <option value="MANAGER">Store Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">POS PIN Code (4-6 digits)</label>
              <input 
                type="password" required minLength={4} maxLength={6} pattern="\d*"
                placeholder="e.g. 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})}
              />
            </div>
            <div className="col-span-2 mt-2">
              <button disabled={isPending} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center">
                {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Save Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4 pl-6">Employee Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading staff...</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400">No staff members found.</td></tr>
            ) : (
              staff.map((emp) => (
                <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors text-sm">
                  <td className="p-4 pl-6 font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Users size={16} /></div>
                    {emp.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border flex w-max items-center gap-1 ${
                      emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      emp.role === 'MANAGER' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {emp.role === 'ADMIN' && <Shield size={12} />}
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{emp.email}</td>
                  <td className="p-4">
                    <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-md text-xs font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};