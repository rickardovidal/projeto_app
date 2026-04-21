import React, { useState, useEffect } from 'react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useSubjectsStore } from '../../stores/subjectsStore';
import type { Assignment, AssignmentMutation, Priority } from '../../services/assignmentsService';
import api from '../../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bell, Calendar, Globe } from 'lucide-react';
import { pt } from 'date-fns/locale';

interface AssignmentFormProps {
  initialData?: Partial<Assignment>;
  onSubmit: (data: AssignmentMutation) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRIORITY_OPTIONS = [
  { label: 'Baixa', value: 'LOW' },
  { label: 'Média', value: 'MEDIUM' },
  { label: 'Alta', value: 'HIGH' },
];

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const subjects = useSubjectsStore((state) => state.subjects);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    subjectId: initialData?.subjectId || subjects[0]?.id || '',
    deadline: initialData?.deadline ? new Date(initialData.deadline) : null,
    priority: (initialData?.priority || 'MEDIUM') as Priority,
    notifyBefore: initialData?.notifyBefore || 1,
    useNotification: !!initialData?.notifyBefore,
    addToCalendar: false,
  });
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  useEffect(() => {
    api.get('/calendar/status').then(({ data }) => setIsCalendarConnected(data.connected)).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      deadline: formData.deadline?.toISOString(),
      notifyBefore: formData.useNotification ? formData.notifyBefore : null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Título do Trabalho"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Ex: Relatório de IA"
        required
      />

      <Textarea
        label="Descrição (opcional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Notas adicionais..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Disciplina"
          value={formData.subjectId}
          onChange={(val) => setFormData({ ...formData, subjectId: val })}
          options={subjects.map((s) => ({ label: s.name, value: s.id }))}
        />
        <Select
          label="Prioridade"
          value={formData.priority}
          onChange={(val) => setFormData({ ...formData, priority: val as Priority })}
          options={PRIORITY_OPTIONS}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-secondary">Prazo de Entrega</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted z-10" />
          <DatePicker
            selected={formData.deadline}
            onChange={(date: Date | null) => setFormData({ ...formData, deadline: date })}
            className="flex h-10 w-full rounded-md border border-border bg-bg-tertiary pl-10 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            wrapperClassName="w-full"
            dateFormat="dd/MM/yyyy HH:mm"
            showTimeSelect
            locale={pt}
            portalId="studyflow-datepicker-portal"
            popperClassName="studyflow-datepicker-popper"
            popperPlacement="bottom-start"
            placeholderText="Selecionar data e hora"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Notificar-me</span>
          </div>
          <input
            type="checkbox"
            checked={formData.useNotification}
            onChange={(e) => setFormData({ ...formData, useNotification: e.target.checked })}
            className="h-5 w-5 rounded border-border bg-bg-tertiary text-accent-blue focus:ring-accent-blue"
          />
        </div>

        {formData.useNotification && (
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="number"
              value={formData.notifyBefore}
              onChange={(e) => setFormData({ ...formData, notifyBefore: Number(e.target.value) })}
              className="w-20"
              min={0}
            />
            <span className="text-sm text-text-secondary">dias antes do prazo</span>
          </div>
        )}
      </div>

      {isCalendarConnected && formData.deadline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-orange-500" />
            <span className="text-sm font-medium text-text-primary">Sincronizar com Google Calendar</span>
          </div>
          <input
            type="checkbox"
            checked={formData.addToCalendar}
            onChange={(e) => setFormData({ ...formData, addToCalendar: e.target.checked })}
            className="h-5 w-5 rounded border-border bg-bg-tertiary text-orange-500 focus:ring-orange-500"
          />
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {initialData?.id ? 'Guardar Alterações' : 'Criar Trabalho'}
        </Button>
      </div>
    </form>
  );
};
