import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ArrowRight, Calendar, Edit3, FileCode, FileText, Globe, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { Button } from '../../components/ui/Button';
import { AssignmentForm } from './AssignmentForm';
import type { Assignment, AssignmentMutation, Status } from '../../services/assignmentsService';
import { useAssignmentsStore } from '../../stores/assignmentsStore';
import { useToastStore } from '../../stores/useToastStore';
import api from '../../services/api';
import { FileExplorer } from '../../components/shared/FileExplorer';
import { NotesEditor } from '../../components/shared/NotesEditor';
import { cn } from '../../lib/utils';

interface AssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

type Tab = 'Details' | 'Notes' | 'Files' | 'Documents';

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Details');
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { updateAssignment, deleteAssignment, updateStatus, fetchAssignments } = useAssignmentsStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (!isOpen) return;

    api.get('/calendar/status').then(({ data }) => setIsCalendarConnected(data.connected));
    setActiveTab('Details');
    setIsEditing(false);
  }, [isOpen]);

  if (!assignment) return null;

  const handleUpdate = async (data: AssignmentMutation) => {
    try {
      await updateAssignment(assignment.id, data);
      addToast('Trabalho atualizado!', 'success');
      setIsEditing(false);
    } catch {
      addToast('Erro ao atualizar', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tens a certeza que queres apagar este trabalho?')) return;

    try {
      await deleteAssignment(assignment.id);
      addToast('Trabalho removido', 'success');
      onClose();
    } catch {
      addToast('Erro ao apagar', 'error');
    }
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);

    try {
      if (assignment.gcalEventId) {
        await api.delete(`/assignments/${assignment.id}/calendar`);
        addToast('Removido do Google Calendar', 'info');
      } else {
        await api.post(`/assignments/${assignment.id}/calendar`);
        addToast('Sincronizado com Google Calendar', 'success');
      }

      await fetchAssignments();
    } catch {
      addToast('Erro na sincronizacao', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const nextStatusMap: Record<Status, Status> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'DONE',
    DONE: 'PENDING',
  };

  const handleStatusToggle = async () => {
    const nextStatus = nextStatusMap[assignment.status];
    await updateStatus(assignment.id, nextStatus);
    addToast(`Status: ${nextStatus}`, 'info');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Trabalho' : assignment.title}
    >
      {!isEditing && (
        <div className="mb-6 flex overflow-x-auto border-b border-border -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-none">
          {(['Details', 'Notes', 'Files', 'Documents'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab === 'Details' && 'Detalhes'}
              {tab === 'Notes' && 'Notas'}
              {tab === 'Files' && 'Ficheiros'}
              {tab === 'Documents' && 'Docs'}
            </button>
          ))}
        </div>
      )}

      {isEditing ? (
        <AssignmentForm
          initialData={assignment}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="space-y-8">
          {activeTab === 'Details' && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant={assignment.status} type="status">{assignment.status}</Badge>
                <Badge variant={assignment.priority} type="priority">{assignment.priority}</Badge>
                <Badge style={{ backgroundColor: `${assignment.subject.color}20`, color: assignment.subject.color }}>
                  {assignment.subject.name}
                </Badge>
                {assignment.gcalEventId && (
                  <Badge className="border border-orange-500/20 bg-orange-500/10 text-orange-500">
                    <Globe size={12} className="mr-1" /> Google Calendar
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 shrink-0 text-text-muted" size={18} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Prazo de Entrega</p>
                    {assignment.deadline ? (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-text-secondary">
                          {format(new Date(assignment.deadline), "eeee, d 'de' MMMM 'as' HH:mm", { locale: pt })}
                        </span>
                        <DeadlineBadge date={assignment.deadline} />
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted">Sem prazo definido</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="mt-1 shrink-0 text-text-muted" size={18} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Descricao</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary break-words">
                      {assignment.description || 'Nenhuma descricao adicionada.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    className="flex-1 justify-between"
                    onClick={handleStatusToggle}
                    rightIcon={<ArrowRight size={18} />}
                  >
                    Mudar para {nextStatusMap[assignment.status]}
                  </Button>

                  {isCalendarConnected && assignment.deadline && (
                    <Button
                      variant="secondary"
                      className={cn('px-3', assignment.gcalEventId && 'border-orange-500/50 text-orange-500')}
                      onClick={handleSyncCalendar}
                      isLoading={isSyncing}
                    >
                      <Globe size={18} />
                    </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    leftIcon={<Edit3 size={18} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    className="px-3"
                    onClick={handleDelete}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Files' && <FileExplorer assignmentId={assignment.id} />}
          {activeTab === 'Notes' && <NotesEditor assignmentId={assignment.id} />}

          {activeTab === 'Documents' && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
              <FileCode size={48} className="mb-4 opacity-20" />
              <p>Modulo de Documentos em breve.</p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};
