import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ColorPicker } from '../../components/ui/ColorPicker';
import type { Subject } from '../../services/subjectsService';
import { useSubjectsStore } from '../../stores/subjectsStore';
import { useToastStore } from '../../stores/useToastStore';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: Subject;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, subject }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addSubject, updateSubject } = useSubjectsStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setColor(subject.color);
      setIcon(subject.icon || '');
    } else {
      setName('');
      setColor('#3B82F6');
      setIcon('');
    }
  }, [subject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (subject) {
        await updateSubject(subject.id, { name, color, icon });
        addToast('Disciplina atualizada!', 'success');
      } else {
        await addSubject({ name, color, icon });
        addToast('Disciplina criada!', 'success');
      }
      onClose();
    } catch (error) {
      addToast('Erro ao gravar disciplina', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject ? 'Editar Disciplina' : 'Nova Disciplina'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {subject ? 'Guardar Alterações' : 'Criar Disciplina'}
          </Button>
        </>
      }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-16">
              <Input
                label="Ícone"
                value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🎓"
                className="text-center text-xl"
              />
            </div>
            <div className="flex-1">
            <Input
              label="Nome da Disciplina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matemática A"
              required
            />
          </div>
        </div>

        <ColorPicker
          label="Cor de Destaque"
          value={color}
          onChange={setColor}
        />
      </form>
    </Modal>
  );
};
