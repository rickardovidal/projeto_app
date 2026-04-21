import React, { useEffect, useState } from 'react';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Modal } from '../../components/ui/Modal';
import { SubjectModal } from './SubjectModal';
import type { Subject } from '../../services/subjectsService';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export const SubjectsPage: React.FC = () => {
  const { subjects, isLoading, fetchSubjects, deleteSubject } = useSubjectsStore();
  const { addToast } = useToastStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSubject(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubject(deleteId);
      addToast('Disciplina apagada!', 'success');
      setDeleteId(null);
    } catch (error) {
      addToast('Erro ao apagar disciplina', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Disciplinas</h1>
          <p className="text-text-secondary mt-1">Gere as tuas cadeiras e cadeiras de estudo.</p>
        </div>
        <Button onClick={handleCreate} leftIcon={<Plus size={20} />} className="w-full sm:w-auto">
          Nova Disciplina
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonLoader key={i} variant="card" />)}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          title="Sem disciplinas"
          description="Começa por adicionar a tua primeira disciplina para organizares os teus trabalhos."
          action={<Button onClick={handleCreate}>Adicionar Disciplina</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="group relative bg-bg-secondary border border-border rounded-2xl p-6 transition-all hover:border-accent-blue/50 hover:shadow-lg overflow-hidden"
            >
              <div 
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: subject.color }}
              />
              
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-inner bg-opacity-10"
                  style={{ backgroundColor: subject.color + '20' }}
                >
                  {subject.icon || <BookOpen size={24} style={{ color: subject.color }} />}
                </div>
                
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(subject)}
                    className="p-2 rounded-lg text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => setDeleteId(subject.id)}
                    className="p-2 rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-1 truncate">{subject.name}</h3>
              <p className="text-sm text-text-muted">
                {subject._count?.assignments || 0} {subject._count?.assignments === 1 ? 'trabalho' : 'trabalhos'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={selectedSubject}
      />

      {/* Modal Confirmação Delete */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Apagar Disciplina?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Confirmar e Apagar</Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Esta ação é irreversível. Todos os trabalhos, notas e ficheiros associados a esta disciplina serão removidos permanentemente.
        </p>
      </Modal>
    </div>
  );
};
