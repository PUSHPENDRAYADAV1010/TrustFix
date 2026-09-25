import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';

export const AdminLayout = () => {
  return (
    <div className="dashboard-layout">
      <div
        className="sidebar-backdrop"
        onClick={() => document.querySelector('.dashboard-layout')?.classList.remove('sidebar-open')}
      />
      <Sidebar role="ADMIN" />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};
