import React, { useEffect, useState } from 'react';
import { useTodosStore } from '../../stores/todosStore';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import type { Priority } from '../../services/assignmentsService';
import { Plus, Trash2, CheckCircle, Circle, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { pt } from 'date-fns/locale';
import { cn } from '../../lib/utils';

type Filter = 'ALL' | 'PENDING' | 'DONE';

export const TodosPage: React.FC = () => {
  const { todos, isLoading, fetchTodos, addTodo, toggleTodo, deleteTodo } = useTodosStore();
  const { addToast } = useToastStore();
  
  const [filter, setFilter] = useState<Filter>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    deadline: null as Date | null,
    priority: 'MEDIUM' as Priority,
  });

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTodo({
        ...newTodo,
        deadline: newTodo.deadline?.toISOString(),
      });
      addToast('Tarefa adicionada!', 'success');
      setIsModalOpen(false);
      setNewTodo({ title: '', description: '', deadline: null, priority: 'MEDIUM' });
    } catch (error) {
      addToast('Erro ao adicionar tarefa', 'error');
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'DONE') return t.completed;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">TODOs</h1>
          <p className="text-text-secondary mt-1">Tarefas independentes e rápidas.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={20} />} className="w-full sm:w-auto">
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 p-1 bg-bg-secondary border border-border rounded-lg w-full sm:w-fit">
        {(['ALL', 'PENDING', 'DONE'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none',
              filter === f 
                ? 'bg-bg-tertiary text-accent-blue shadow-sm' 
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            {f === 'ALL' && 'Todas'}
            {f === 'PENDING' && 'Pendentes'}
            {f === 'DONE' && 'Concluídas'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height={60} />)}
        </div>
      ) : filteredTodos.length === 0 ? (
        <EmptyState
          title="Sem tarefas"
          description={filter === 'DONE' ? 'Ainda não concluíste nenhuma tarefa.' : 'Não tens tarefas pendentes para esta vista.'}
          action={filter !== 'DONE' ? <Button onClick={() => setIsModalOpen(true)}>Criar Tarefa</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                'group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-secondary border border-border rounded-xl transition-all hover:border-accent-blue/30 gap-3',
                todo.completed && 'opacity-60 bg-bg-primary/50'
              )}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {todo.completed ? (
                    <CheckCircle className="text-success" size={24} />
                  ) : (
                    <Circle className="text-text-muted hover:text-accent-blue" size={24} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className={cn(
                    'font-medium text-text-primary truncate transition-all',
                    todo.completed && 'line-through text-text-muted'
                  )}>
                    {todo.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {todo.deadline && <DeadlineBadge date={todo.deadline} />}
                    <Badge variant={todo.priority} type="priority">{todo.priority}</Badge>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="self-end sm:self-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Tarefa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Tarefa"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd}>Adicionar Tarefa</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="O que precisas de fazer?"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            placeholder="Ex: Comprar caderno A4"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Prioridade"
              value={newTodo.priority}
              onChange={(val) => setNewTodo({ ...newTodo, priority: val as Priority })}
              options={[
                { label: 'Baixa', value: 'LOW' },
                { label: 'Média', value: 'MEDIUM' },
                { label: 'Alta', value: 'HIGH' },
              ]}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Calendar size={14} /> Prazo
              </label>
              <DatePicker
                selected={newTodo.deadline}
                onChange={(date: Date | null) => setNewTodo({ ...newTodo, deadline: date })}
                className="flex h-10 w-full rounded-md border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                wrapperClassName="w-full"
                dateFormat="dd/MM/yyyy HH:mm"
                showTimeSelect
                locale={pt}
                portalId="studyflow-datepicker-portal"
                popperClassName="studyflow-datepicker-popper"
                popperPlacement="bottom-start"
                placeholderText="Sem prazo"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
