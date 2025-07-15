import React from 'react';
import { Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4 text-brand-600">
          <Activity size={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Enterprise ERP Admin
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-600">
          Tailwind, Zustand, and React Query successfully initialized.
        </p>
      </div>
    </div>
  );
}

export default App;