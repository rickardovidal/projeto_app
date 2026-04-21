import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Plus, 
  Trash2, 
  Loader2,
  Check,
  StickyNote
} from 'lucide-react';
import api from '../../services/api';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '../../lib/utils';

interface Note {
  id: string;
  content: string;
  updatedAt: string;
}

interface NoteItemProps {
  note: Note;
  onDelete: (id: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date(note.updatedAt));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToastStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-blue underline cursor-pointer',
        },
      }),
      Placeholder.configure({ placeholder: 'Começa a escrever...' }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await api.put(`/notes/${note.id}`, { content: editor.getHTML() });
          setLastSaved(new Date());
        } catch (error) {
          addToast('Erro ao guardar nota', 'error');
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-bg-tertiary/30 border border-border rounded-xl p-4 space-y-3 group transition-all hover:border-accent-blue/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-2 gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn('p-1.5 rounded hover:bg-bg-tertiary', editor.isActive('bold') && 'text-accent-blue bg-bg-tertiary')}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn('p-1.5 rounded hover:bg-bg-tertiary', editor.isActive('italic') && 'text-accent-blue bg-bg-tertiary')}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn('p-1.5 rounded hover:bg-bg-tertiary', editor.isActive('underline') && 'text-accent-blue bg-bg-tertiary')}
          >
            <UnderlineIcon size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn('p-1.5 rounded hover:bg-bg-tertiary', editor.isActive('bulletList') && 'text-accent-blue bg-bg-tertiary')}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn('p-1.5 rounded hover:bg-bg-tertiary', editor.isActive('orderedList') && 'text-accent-blue bg-bg-tertiary')}
          >
            <ListOrdered size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-muted">
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} className="text-success" />}
            {isSaving ? 'A guardar...' : `Editado ${formatDistanceToNow(lastSaved, { addSuffix: true, locale: pt })}`}
          </div>
          <button 
            type="button"
            onClick={() => onDelete(note.id)}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <EditorContent editor={editor} className="prose prose-invert prose-sm max-w-none min-h-[60px] focus:outline-none" />
    </div>
  );
};

export const NotesEditor: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetchNotes = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const { data } = await api.get(`/assignments/${assignmentId}/notes`);
      setNotes(data);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      addToast('Erro ao carregar notas', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, addToast]);

  useEffect(() => {
    void fetchNotes(true);
  }, [fetchNotes]);

  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState === 'hidden') return;
      void fetchNotes();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchNotes();
      }
    };

    window.addEventListener('focus', handleResume);
    window.addEventListener('pageshow', handleResume);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('pageshow', handleResume);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotes]);

  const addNote = async () => {
    try {
      const { data } = await api.post(`/assignments/${assignmentId}/notes`, { content: '' });
      setNotes((currentNotes) => [data, ...currentNotes]);
    } catch {
      addToast('Erro ao criar nota', 'error');
    }
  };

  const deleteNote = async (id: string) => {
    if (!window.confirm('Apagar esta nota?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
      addToast('Nota apagada', 'success');
    } catch {
      addToast('Erro ao apagar nota', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-primary">Notas Rápidas</h4>
        <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={addNote} className="w-full sm:w-auto">
          Nova Nota
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-accent-blue" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-2xl">
            <StickyNote size={40} className="text-text-muted mb-3 opacity-20" />
            <p className="text-sm text-text-muted">Sem notas ainda.</p>
            <Button variant="ghost" size="sm" className="mt-4" onClick={addNote}>Criar nota</Button>
          </div>
        ) : (
          notes.map(note => <NoteItem key={note.id} note={note} onDelete={deleteNote} />)
        )}
      </div>
    </div>
  );
};
