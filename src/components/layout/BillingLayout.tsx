import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BillingSidebar } from './BillingSidebar';

export const BillingLayout: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="border-b">
        <Header />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r overflow-y-auto hidden md:block">
          <BillingSidebar />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}; 