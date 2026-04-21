import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Strikethrough,
  Table as TableIcon, Image as ImageIcon,
  Link as LinkIcon, Code, Redo2, Undo2,
  Highlighter, Save, Loader2, Minus,
  ArrowLeft, Trash2, Download,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onSave: (content: string) => void;
  isSaving: boolean;
  title?: string;
  onBack?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-1.5 rounded-md transition-all duration-100 text-[#374151] hover:bg-gray-200 active:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed',
      active && 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1" />;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onSave, isSaving, title, onBack, onDelete, onExport, isExporting }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ allowBase64: true }),
      Underline,
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: 'Começa a escrever o teu documento...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onSave(editor.getHTML());
    },
  });

  if (!editor) return null;

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const charCount = editor.getText().length;

  const insertLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL:', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const insertImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const styleValue = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('blockquote')
    ? 'blockquote'
    : 'p';

  const handleStyleChange = (val: string) => {
    switch (val) {
      case 'h1': editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
      default: editor.chain().focus().setParagraph().run();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#f3f4f6' }}>
      {/* Toolbar — light Word-like ribbon */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }} className="shrink-0 shadow-sm">
        {/* Doc header: back / title / actions */}
        {(onBack || title) && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {title && <span className="flex-1 text-sm font-semibold text-gray-700 truncate">{title}</span>}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Exportar .doc"
              >
                {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                .doc
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                title="Apagar documento"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}

        {/* Row 1: Style & History */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-gray-100">
          {/* Undo / Redo */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Desfazer (Ctrl+Z)">
            <Undo2 size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Refazer (Ctrl+Y)">
            <Redo2 size={15} />
          </ToolbarButton>

          <Divider />

          {/* Style selector */}
          <select
            value={styleValue}
            onChange={(e) => handleStyleChange(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-200 rounded-md bg-white text-gray-700 hover:border-gray-400 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[130px]"
          >
            <option value="p">Parágrafo</option>
            <option value="h1">Título 1</option>
            <option value="h2">Título 2</option>
            <option value="h3">Título 3</option>
            <option value="blockquote">Citação</option>
          </select>

          <div className="flex-1" />

          {/* Save status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 px-2">
            {isSaving
              ? <><Loader2 size={12} className="animate-spin" /> A guardar...</>
              : <><Save size={12} className="text-green-500" /> Guardado</>
            }
          </div>
        </div>

        {/* Row 2: Formatting */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)">
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Riscado">
            <Strikethrough size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Realçar texto">
            <Highlighter size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código em linha">
            <Code size={15} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar esquerda">
            <AlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
            <AlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar direita">
            <AlignRight size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
            <AlignJustify size={15} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com marcadores">
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
            <ListOrdered size={15} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloco de código">
            <Code size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
            <Minus size={15} />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={insertLink} active={editor.isActive('link')} title="Inserir / editar link">
            <LinkIcon size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={insertImage} title="Inserir imagem">
            <ImageIcon size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={insertTable} active={editor.isActive('table')} title="Inserir tabela">
            <TableIcon size={15} />
          </ToolbarButton>

          {/* Table controls (contextual) */}
          {editor.isActive('table') && (
            <>
              <Divider />
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
              >
                + Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
              >
                + Linha
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100"
              >
                − Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100"
              >
                − Linha
              </button>
            </>
          )}
        </div>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 overflow-y-auto py-4 sm:py-10 px-2 sm:px-6" style={{ background: '#e8e9eb' }}>
        <div
          className="mx-auto bg-white shadow-[0_2px_12px_rgba(0,0,0,0.18)] rounded-sm"
          style={{
            minHeight: 'calc(100dvh - 220px)',
            width: 'min(210mm, 100%)',
            padding: 'clamp(12px, 3.5vw, 25mm) clamp(12px, 3.5vw, 22mm)',
          }}
        >
          <div className="rich-editor-page h-full">
            <EditorContent editor={editor} className="min-h-full" />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="shrink-0 flex items-center justify-between px-3 sm:px-6 py-1.5 text-xs"
        style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', color: '#6b7280' }}
      >
        <span>{wordCount} palavras · {charCount} caracteres</span>
        <span className="hidden sm:inline">Documento A4 · Guardado automaticamente</span>
      </div>
    </div>
  );
};
