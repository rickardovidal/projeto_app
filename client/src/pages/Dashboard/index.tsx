import React, { useEffect } from 'react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Badge } from '../../components/ui/Badge';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { summary, isLoading, fetchSummary } = useDashboardStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (isLoading && !summary) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader height={100} />
          <SkeletonLoader height={100} />
          <SkeletonLoader height={100} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonLoader height={300} />
          <SkeletonLoader height={300} />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Pendentes', value: summary?.stats.pending || 0, icon: Clock, color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
    { label: 'Atrasados', value: summary?.stats.overdue || 0, icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Concluídos (Semana)', value: summary?.stats.completedThisWeek || 0, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  ];

  const hasTodayItems = (summary?.today.assignments.length || 0) + (summary?.today.todos.length || 0) > 0;

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Bem-vindo de volta!</h1>
        <p className="text-text-secondary mt-1">Aqui está o resumo do teu dia académico.</p>
      </header>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-bg-secondary border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className={cn('p-3 rounded-xl', stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Hoje e Esta Semana */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hoje */}
          <section className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-border flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-accent-blue" size={20} />
                <h2 className="text-xl font-bold text-text-primary">Para Hoje</h2>
              </div>
              <Badge variant="MEDIUM" type="priority">Prioritário</Badge>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              {!hasTodayItems ? (
                <div className="py-4 text-center">
                  <p className="text-text-muted">Nada planeado para hoje. Aproveita para adiantar trabalho!</p>
                </div>
              ) : (
                <>
                  {summary?.today.assignments.map(a => (
                    <Link key={a.id} to="/assignments" className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 bg-bg-tertiary/30 rounded-xl hover:bg-bg-tertiary transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.subject.color }} />
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">{a.title}</p>
                          <p className="text-xs text-text-muted">{a.subject.name}</p>
                        </div>
                      </div>
                      <DeadlineBadge date={a.deadline!} />
                    </Link>
                  ))}
                  {summary?.today.todos.map(t => (
                    <Link key={t.id} to="/todos" className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-4 bg-bg-tertiary/30 rounded-xl hover:bg-bg-tertiary transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-5 w-5 rounded border border-text-muted flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-transparent" />
                        </div>
                        <p className="font-medium text-text-primary group-hover:text-accent-blue transition-colors truncate">{t.title}</p>
                      </div>
                      <Badge variant={t.priority} type="priority">{t.priority}</Badge>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Próximos 7 dias */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-success" size={20} />
              <h2 className="text-xl font-bold text-text-primary">Próximos 7 dias</h2>
            </div>
            <div className="space-y-3">
              {summary?.weekAssignments.length === 0 ? (
                <p className="text-text-muted text-sm">Sem entregas agendadas para o resto da semana.</p>
              ) : (
                summary?.weekAssignments.map(a => (
                  <div key={a.id} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 bg-bg-secondary border border-border rounded-xl">
                    <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-bg-tertiary shrink-0">
                      <span className="text-[10px] uppercase font-bold text-text-muted">
                        {new Date(a.deadline!).toLocaleDateString('pt', { month: 'short' })}
                      </span>
                      <span className="text-sm font-bold text-text-primary">
                        {new Date(a.deadline!).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{a.title}</p>
                      <p className="text-xs text-text-muted">{a.subject.name}</p>
                    </div>
                    <Badge variant={a.priority} type="priority" className="shrink-0">{a.priority}</Badge>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Coluna Direita: Disciplinas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Disciplinas</h2>
            <Link to="/subjects" className="text-xs text-accent-blue hover:underline flex items-center">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {summary?.subjectStats.map(s => (
              <div key={s.id} className="bg-bg-secondary border border-border p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-xl bg-opacity-10"
                      style={{ backgroundColor: s.color + '20' }}
                    >
                      {s.icon || <BookOpen size={20} style={{ color: s.color }} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">{s.name}</h3>
                      <p className="text-xs text-text-muted">{s.pending} trabalhos pendentes</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{s.progress}%</span>
                </div>
                
                <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${s.progress}%`,
                      backgroundColor: s.color 
                    }}
                  />
                </div>
              </div>
            ))}
            {summary?.subjectStats.length === 0 && (
              <EmptyState 
                title="Sem disciplinas" 
                description="Adiciona disciplinas para veres o teu progresso aqui." 
                className="p-8"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
