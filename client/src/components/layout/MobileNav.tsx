import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Menu, X, Settings, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';
import { useAuthStore } from '../../stores/authStore';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      <header className="md:hidden h-14 border-b border-border bg-bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-bg-secondary/85 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-tertiary text-text-primary"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <span className="text-base font-semibold text-accent-blue">StudyFlow</span>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue text-xs font-bold text-white">
          {user?.name?.[0] || 'U'}
        </div>
      </header>

      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

        <aside
          className={cn(
            'absolute inset-y-0 left-0 w-[86%] max-w-xs border-r border-border bg-bg-secondary shadow-2xl transition-transform duration-200 flex flex-col',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-14 px-4 border-b border-border flex items-center justify-between">
            <span className="text-lg font-semibold text-accent-blue">Menu</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border p-3 space-y-2">
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              )}
            >
              <Settings size={20} />
              <span className="font-medium">Definições</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-text-secondary hover:bg-danger/10 hover:text-danger transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Terminar sessão</span>
            </button>

            <div className="pt-1 px-3">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Utilizador'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};
