import React, { useEffect, useState } from 'react';
import { useAssignmentsStore } from '../../stores/assignmentsStore';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Modal } from '../../components/ui/Modal';
import { AssignmentDrawer } from './AssignmentDrawer';
import { AssignmentForm } from './AssignmentForm';
import type { Assignment, AssignmentMutation, Status, Priority } from '../../services/assignmentsService';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { assignments, isLoading, filters, fetchAssignments, setFilters, addAssignment, updateStatus } = useAssignmentsStore();
  const { subjects, fetchSubjects } = useSubjectsStore();
  const { addToast } = useToastStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, [fetchAssignments, fetchSubjects]);

  const selectedAssignment = assignments.find(({ id }) => id === selectedAssignmentId) ?? null;

  const handleStatusToggle = async (e: React.MouseEvent, assignment: Assignment) => {
    e.stopPropagation();
    const nextStatusMap: Record<Status, Status> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'PENDING',
    };
    await updateStatus(assignment.id, nextStatusMap[assignment.status]);
    addToast('Status atualizado!', 'info');
  };

  const handleCreate = async (data: AssignmentMutation) => {
    try {
      await addAssignment(data);
      addToast('Trabalho criado!', 'success');
      setIsFormOpen(false);
    } catch {
      addToast('Erro ao criar trabalho', 'error');
    }
  };

  const statusIcons: Record<Status, React.ReactNode> = {
    PENDING: <Circle size={18} className="text-text-muted" />,
    IN_PROGRESS: <Clock size={18} className="text-warning" />,
    DONE: <CheckCircle2 size={18} className="text-success" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Trabalhos</h1>
          <p className="text-text-secondary mt-1">Organiza as tuas entregas e prazos.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} leftIcon={<Plus size={20} />} className="w-full sm:w-auto">
          Novo Trabalho
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="premium-card rounded-xl p-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end">
        <div className="w-full sm:flex-1 sm:min-w-[200px]">
          <Input
            placeholder="Procurar por título..."
            leftIcon={<Search size={18} />}
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            placeholder="Disciplina"
            value={filters.subjectId || ''}
            onChange={(val) => setFilters({ subjectId: val || undefined })}
            options={[
              { label: 'Todas', value: '' },
              ...subjects.map(s => ({ label: s.name, value: s.id }))
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            placeholder="Status"
            value={filters.status || ''}
            onChange={(val) => setFilters({ status: (val as Status) || undefined })}
            options={[
              { label: 'Todos', value: '' },
              { label: 'Pendente', value: 'PENDING' },
              { label: 'Em Curso', value: 'IN_PROGRESS' },
              { label: 'Concluído', value: 'DONE' },
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            placeholder="Prioridade"
            value={filters.priority || ''}
            onChange={(val) => setFilters({ priority: (val as Priority) || undefined })}
            options={[
              { label: 'Todas', value: '' },
              { label: 'Baixa', value: 'LOW' },
              { label: 'Média', value: 'MEDIUM' },
              { label: 'Alta', value: 'HIGH' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height={80} />)}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Sem trabalhos encontrados"
          description="Ajusta os filtros ou cria um novo trabalho para começar."
          action={<Button onClick={() => setIsFormOpen(true)}>Novo Trabalho</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => setSelectedAssignmentId(assignment.id)}
              className="premium-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-accent-blue/40 cursor-pointer group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button 
                  onClick={(e) => handleStatusToggle(e, assignment)}
                  className="shrink-0 p-1 hover:scale-110 transition-transform"
                >
                  {statusIcons[assignment.status]}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${assignment.status === 'DONE' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {assignment.title}
                    </h3>
                    <Badge style={{ backgroundColor: assignment.subject.color + '20', color: assignment.subject.color }}>
                      {assignment.subject.name}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {assignment.deadline && <DeadlineBadge date={assignment.deadline} />}
                    <Badge variant={assignment.priority} type="priority">{assignment.priority}</Badge>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 text-text-muted">
                <Filter size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer de Detalhes */}
      <AssignmentDrawer
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignmentId(null)}
        assignment={selectedAssignment}
      />

      {/* Modal de Criação */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo Trabalho"
      >
        <AssignmentForm
          onSubmit={handleCreate}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};
