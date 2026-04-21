import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, FileCode } from 'lucide-react';
import { documentsService, type Document, type DocType } from '../../services/documentsService';
import { RichTextEditor } from './RichTextEditor';
import { LaTeXEditor } from './LaTeXEditor';
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { downloadBlob, sanitizeFileName, buildDocxHtmlDocument } from './exportUtils';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';

const AUTOSAVE_DELAY = 1500;

const DocumentEditor: React.FC<{ docId: string }> = ({ docId }) => {
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    documentsService.getDocuments()
      .then(({ data }) => {
        const found = data.find((d) => d.id === docId);
        if (!found) navigate('/editor');
        else setDoc(found);
      })
      .catch(() => navigate('/editor'))
      .finally(() => setIsLoading(false));
  }, [docId, navigate]);

  const handleSave = useCallback((content: string) => {
    pendingContentRef.current = content;
    setDoc((prev) => prev ? { ...prev, content } : prev);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (!pendingContentRef.current) return;
      setIsSaving(true);
      try {
        await documentsService.updateDocument(docId, { content: pendingContentRef.current });
        pendingContentRef.current = null;
      } finally {
        setIsSaving(false);
      }
    }, AUTOSAVE_DELAY);
  }, [docId]);

  const handleDelete = async () => {
    if (!window.confirm('Apagar este documento?')) return;
    await documentsService.deleteDocument(docId);
    navigate('/editor');
  };

  const handleExportDocx = async () => {
    if (!doc) return;
    setIsExporting(true);
    try {
      const html = buildDocxHtmlDocument(doc.title, doc.content);
      const blob = new Blob([html], { type: 'application/msword' });
      downloadBlob(blob, `${sanitizeFileName(doc.title)}.doc`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <SkeletonLoader height={48} />
        <SkeletonLoader height={600} />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {doc.type === 'RICH_TEXT' ? (
        <RichTextEditor
          content={doc.content}
          onSave={handleSave}
          isSaving={isSaving}
          title={doc.title}
          onBack={() => navigate('/editor')}
          onDelete={handleDelete}
          onExport={handleExportDocx}
          isExporting={isExporting}
        />
      ) : (
        <LaTeXEditor
          content={doc.content}
          onSave={handleSave}
          isSaving={isSaving}
          title={doc.title}
          onBack={() => navigate('/editor')}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

const CreateDocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, type: DocType) => void;
  isCreating: boolean;
}> = ({ isOpen, onClose, onCreate, isCreating }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocType>('RICH_TEXT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), type);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Documento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título"
          placeholder="Nome do documento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Select
          label="Tipo"
          value={type}
          onChange={(val) => setType(val as DocType)}
          options={[
            { label: 'Texto Rico', value: 'RICH_TEXT' },
            { label: 'LaTeX', value: 'LATEX' },
          ]}
        />
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" className="w-full sm:flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:flex-1" isLoading={isCreating} disabled={!title.trim()}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await documentsService.getDocuments();
      setDocs(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchDocs(); }, [fetchDocs]);

  const handleCreate = async (title: string, type: DocType) => {
    setIsCreating(true);
    try {
      const { data } = await documentsService.createDocument({ title, type });
      navigate(`/editor/${data.id}`);
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Editor</h1>
          <p className="text-text-secondary mt-1">Cria e edita documentos em texto rico ou LaTeX.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={20} />} className="w-full sm:w-auto">
          Novo Documento
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonLoader key={i} height={120} />)}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          title="Nenhum documento"
          description="Cria o teu primeiro documento de texto rico ou LaTeX."
          action={<Button onClick={() => setIsModalOpen(true)}>Novo Documento</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => navigate(`/editor/${doc.id}`)}
              className="premium-card text-left rounded-xl p-5 hover:border-accent-blue/50 transition-all group space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                {doc.type === 'LATEX' ? (
                  <FileCode size={22} className="text-accent-blue shrink-0 mt-0.5" />
                ) : (
                  <FileText size={22} className="text-text-muted shrink-0 mt-0.5" />
                )}
                <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
                  {doc.type === 'LATEX' ? 'LaTeX' : 'Rich Text'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary group-hover:text-accent-blue transition-colors truncate">
                  {doc.title}
                </h3>
                {doc.assignment && (
                  <p className="text-xs text-text-muted mt-0.5 truncate">{doc.assignment.title}</p>
                )}
              </div>
              <p className="text-xs text-text-muted">
                {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true, locale: pt })}
              </p>
            </button>
          ))}
        </div>
      )}

      <CreateDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        isCreating={isCreating}
      />
    </div>
  );
};

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  return id ? <DocumentEditor docId={id} /> : <DocumentList />;
};
