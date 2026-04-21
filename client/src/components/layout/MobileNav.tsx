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
      <header className="md:hidden h-14 border-b border-border/70 bg-bg-secondary/88 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-secondary/78 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-bg-tertiary/80 text-text-primary"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <span className="text-base font-semibold text-text-primary tracking-tight">StudyFlow</span>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-[#3d6fe0] text-xs font-bold text-white shadow-[0_8px_20px_rgba(92,141,255,0.35)]">
          {user?.name?.[0] || 'U'}
        </div>
      </header>

      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsOpen(false)} />

        <aside
          className={cn(
            'premium-glass absolute inset-y-0 left-0 w-[86%] max-w-xs border-r border-border/70 shadow-[0_28px_60px_rgba(2,8,23,0.55)] transition-transform duration-200 flex flex-col',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="h-14 px-4 border-b border-border/70 flex items-center justify-between">
            <span className="text-lg font-semibold text-text-primary">Menu</span>
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
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all border border-transparent',
                  isActive
                    ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                    : 'text-text-secondary hover:bg-bg-tertiary/70 hover:border-border/70 hover:text-text-primary'
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border/70 p-3 space-y-2">
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all border border-transparent',
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30'
                  : 'text-text-secondary hover:bg-bg-tertiary/70 hover:border-border/70 hover:text-text-primary'
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
