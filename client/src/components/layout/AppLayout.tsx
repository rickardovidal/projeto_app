import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuthStore } from '../../stores/authStore';
import { ToastContainer } from '../ui/Toast';
import { SkeletonLoader } from '../ui/SkeletonLoader';

export const AppLayout: React.FC = () => {
  const { user, isLoading, initialized } = useAuthStore();
  const { pathname } = useLocation();
  const isFullHeight = pathname.startsWith('/editor');

  if (!initialized || isLoading) {
    return (
      <div className="relative flex min-h-[100dvh] bg-bg-primary overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-32 h-80 w-80 rounded-full bg-accent-blue/20 blur-3xl" />
          <div className="absolute -top-20 right-[-90px] h-72 w-72 rounded-full bg-success/10 blur-3xl" />
        </div>
        <SkeletonLoader variant="rectangle" className="hidden md:block w-64 h-[100dvh]" />
        <div className="relative z-10 flex-1 p-8">
          <SkeletonLoader variant="text" className="w-1/4 h-8 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative flex min-h-[100dvh] max-h-[100dvh] bg-bg-primary text-text-primary overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-28 h-80 w-80 rounded-full bg-accent-blue/20 blur-3xl" />
        <div className="absolute -top-20 right-[-110px] h-72 w-72 rounded-full bg-success/10 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[25%] h-96 w-96 rounded-full bg-accent-blue/10 blur-3xl" />
      </div>
      <Sidebar />
      <div className="relative z-10 flex flex-col flex-1 min-w-0 min-h-0">
        <MobileNav />
        {isFullHeight ? (
          <main className="flex-1 min-h-0 overflow-hidden">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-6 md:pb-8">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};
