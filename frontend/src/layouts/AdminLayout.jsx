import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';

export const AdminLayout = () => {
  return (
    <div className="Dashboard-Layout">
      <div
        className="Sidebar-Backdrop"
        onClick={() => document.querySelector('.Dashboard-Layout')?.classList.remove('Sidebar-Open')}
      />
      <Sidebar role="ADMIN" />
      <div className="Dashboard-Main">
        <Outlet />
      </div>
    </div>
  );
};
