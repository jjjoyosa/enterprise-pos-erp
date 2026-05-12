import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const CustomerSearchModal = ({ isOpen, onClose, onSelect }: any) => {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchCustomers = async () => {
        const { data } = await api.get('/customers');
        setCustomers(data);
      };
      fetchCustomers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Attach Customer</h2>
        <input 
          className="w-full border p-2 mb-4"
          placeholder="Search by name or phone..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-60 overflow-y-auto">
          {customers
            .filter(c => c.firstName.includes(query) || c.phone.includes(query))
            .map(c => (
              <div 
                key={c._id} 
                className="p-2 border-b cursor-pointer hover:bg-gray-100"
                onClick={() => { onSelect(c); onClose(); }}
              >
                {c.firstName} {c.lastName} - {c.phone}
              </div>
            ))}
        </div>
        <button onClick={onClose} className="mt-4 text-red-500">Close</button>
      </div>
    </div>
  );
};