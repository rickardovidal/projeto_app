import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Folder, 
  File as FileIcon, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  PlaySquare, 
  Plus, 
  Upload, 
  ChevronRight, 
  ChevronDown, 
  Trash2,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useToastStore } from '../../stores/useToastStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface FileData {
  id: string;
  name: string;
  mimeType: string;
}

interface FolderData {
  id: string;
  name: string;
  files: FileData[];
}

interface FetchFoldersOptions {
  showLoader?: boolean;
}

const getFileIcon = (mime: string) => {
  if (mime.includes('pdf')) return <FileText className="text-red-500" size={18} />;
  if (mime.includes('word') || mime.includes('document')) return <FileText className="text-blue-500" size={18} />;
  if (mime.includes('sheet') || mime.includes('excel')) return <FileSpreadsheet className="text-green-500" size={18} />;
  if (mime.includes('presentation')) return <PlaySquare className="text-orange-500" size={18} />;
  if (mime.includes('image')) return <ImageIcon className="text-purple-500" size={18} />;
  return <FileIcon className="text-text-muted" size={18} />;
};

const FolderItem: React.FC<{ 
  folder: FolderData; 
  onUpload: (folderId: string, file: File) => void;
  onDelete: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onDownload: (id: string) => void;
  uploadingFolderId: string | null;
}> = ({ folder, onUpload, onDelete, onDeleteFile, onDownload, uploadingFolderId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (files) => onUpload(folder.id, files[0]),
    noClick: true
  });

  return (
    <div className="space-y-1" {...getRootProps()}>
      <input {...getInputProps()} />
        <div className={cn(
          "flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary transition-colors group cursor-pointer",
          isDragActive && "bg-accent-blue/10 border-2 border-dashed border-accent-blue"
        )}>
          <div className="flex items-center gap-2 flex-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
            <Folder size={20} className="text-accent-blue fill-accent-blue/20" />
            <span className="text-sm font-medium text-text-primary truncate">{folder.name}</span>
            {uploadingFolderId === folder.id && <Loader2 size={14} className="animate-spin text-accent-blue ml-2" />}
          </div>
        
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={(e) => { e.stopPropagation(); open(); }} className="p-1.5 hover:bg-bg-secondary rounded text-text-muted hover:text-text-primary">
            <Upload size={14} />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(folder.id); }} className="p-1.5 hover:bg-danger/10 rounded text-text-muted hover:text-danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-1 border-l border-border pl-2">
          {folder.files.map(file => (
            <div key={file.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary/50 group">
              <div className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" onClick={() => onDownload(file.id)}>
                {getFileIcon(file.mimeType)}
                <span className="text-xs text-text-secondary truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => onDeleteFile(file.id)} className="p-1 hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {folder.files.length === 0 && <p className="text-[10px] text-text-muted py-2 px-2 italic">Pasta vazia.</p>}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<{ assignmentId: string }> = ({ assignmentId }) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [uploadingFolderId, setUploadingFolderId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const fetchFolders = useCallback(async ({ showLoader = false }: FetchFoldersOptions = {}) => {
    if (showLoader) {
      setIsInitialLoad(true);
    }

    try {
      const { data } = await api.get(`/assignments/${assignmentId}/folders`);
      setFolders(data);
    } catch {
      addToast('Erro ao carregar ficheiros', 'error');
    } finally {
      setIsInitialLoad(false);
    }
  }, [assignmentId, addToast]);

  useEffect(() => {
    void fetchFolders({ showLoader: true });
  }, [assignmentId, fetchFolders]);

  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState === 'hidden') return;
      void fetchFolders();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchFolders();
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
  }, [assignmentId, fetchFolders]);

  const createFolder = async () => {
    const name = window.prompt('Nome da pasta:');
    if (!name) return;
    try {
      await api.post(`/assignments/${assignmentId}/folders`, { name });
      void fetchFolders();
    } catch { addToast('Erro ao criar pasta', 'error'); }
  };

  const deleteFolder = async (id: string) => {
    if (!window.confirm('Apagar pasta?')) return;
    try {
      await api.delete(`/folders/${id}`);
      void fetchFolders();
    } catch { addToast('Erro ao apagar pasta', 'error'); }
  };

  const uploadFile = async (folderId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingFolderId(folderId);
    try {
      await api.post(`/folders/${folderId}/files`, formData);
      void fetchFolders();
      addToast('Ficheiro enviado', 'success');
    } catch { addToast('Erro no upload', 'error'); }
    finally { setUploadingFolderId(null); }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const { data } = await api.get(`/files/${fileId}/url`);
      const openedWindow = window.open(data.url, '_blank', 'noopener,noreferrer');

      if (!openedWindow) {
        const link = document.createElement('a');
        link.href = data.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      addToast('Erro ao abrir', 'error');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!window.confirm('Apagar ficheiro?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      void fetchFolders();
    } catch { addToast('Erro ao apagar', 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">Ficheiros</h4>
        <Button size="sm" variant="secondary" onClick={createFolder} leftIcon={<Plus size={14} />}>Nova pasta</Button>
      </div>

      <div className="bg-bg-primary/50 border border-border rounded-xl p-2 min-h-[150px]">
        {isInitialLoad ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-accent-blue" /></div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 opacity-30 text-xs text-text-muted">
            <Folder size={24} className="mb-2" /> <p>Sem pastas.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map(folder => (
              <FolderItem 
                key={folder.id} 
                folder={folder} 
                onUpload={uploadFile}
                onDelete={deleteFolder}
                onDeleteFile={deleteFile}
                onDownload={downloadFile}
                uploadingFolderId={uploadingFolderId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
