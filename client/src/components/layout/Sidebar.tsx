import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  CheckSquare, 
  FileEdit, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Disciplinas', icon: BookOpen, path: '/subjects' },
  { label: 'Trabalhos', icon: Briefcase, path: '/assignments' },
  { label: 'TODOs', icon: CheckSquare, path: '/todos' },
  { label: 'Editor', icon: FileEdit, path: '/editor' },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        'premium-glass hidden md:flex flex-col h-[100dvh] border-r border-border/70 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/70">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent-blue to-[#3d6fe0] text-white font-bold text-sm inline-flex items-center justify-center shadow-[0_8px_18px_rgba(92,141,255,0.4)]">
              SF
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">StudyFlow</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-bg-tertiary/80 border border-border/70 text-text-muted hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative border border-transparent',
              isActive 
                ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' 
                : 'text-text-secondary hover:bg-bg-tertiary/70 hover:text-text-primary hover:border-border/70'
            )}
          >
            <item.icon size={22} className={cn('shrink-0')} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            {isCollapsed && (
              <div className="absolute left-16 bg-bg-tertiary text-text-primary text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-border">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border/70">
        <NavLink 
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 border border-transparent text-text-secondary hover:bg-bg-tertiary/70 hover:border-border/70 hover:text-text-primary transition-colors',
            isActive && 'text-accent-blue'
          )}
        >
          <Settings size={22} />
          {!isCollapsed && <span className="font-medium">Definições</span>}
        </NavLink>

        <div className="premium-card flex items-center justify-between gap-3 px-3 py-2 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent-blue to-[#3d6fe0] flex items-center justify-center text-white shrink-0 font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'Utilizador'}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-danger transition-colors"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
