import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';

export const CustomerLayout = () => {
  return (
    <div className="dashboard-layout">
      <div
        className="sidebar-backdrop"
        onClick={() => document.querySelector('.dashboard-layout')?.classList.remove('sidebar-open')}
      />
      <Sidebar role="CUSTOMER" />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};
