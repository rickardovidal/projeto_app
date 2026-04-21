import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { buildLatexPreviewDocument } from './latexPreview';
import { downloadBlob, sanitizeFileName } from './exportUtils';
import {
  Split, Eye, Code2, FileDown, Loader2, Save, ChevronRight, ArrowLeft, Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface LaTeXEditorProps {
  content: string;
  onSave: (content: string) => void;
  isSaving: boolean;
  title?: string;
  onBack?: () => void;
  onDelete?: () => void;
}

type ViewMode = 'split' | 'editor' | 'preview';

/* ── LaTeX snippets for Monaco completions ── */
const LATEX_SNIPPETS = [
  { label: '\\begin{...}...\\end{...}', insert: '\\begin{${1:environment}}\n\t$0\n\\end{${1:environment}}' },
  { label: '\\section{...}',            insert: '\\section{${1:Título}}$0' },
  { label: '\\subsection{...}',         insert: '\\subsection{${1:Subtítulo}}$0' },
  { label: '\\frac{}{...}',             insert: '\\frac{${1:num}}{${2:den}}$0' },
  { label: '\\sqrt{...}',               insert: '\\sqrt{${1:x}}$0' },
  { label: '$$...$$',                   insert: '$$\n${1:f(x) = x^2}\n$$\n$0' },
  { label: '$...$',                     insert: '$${1:x}$$0' },
  { label: '\\textbf{...}',             insert: '\\textbf{${1:texto}}$0' },
  { label: '\\textit{...}',             insert: '\\textit{${1:texto}}$0' },
  { label: 'itemize env',               insert: '\\begin{itemize}\n\t\\item ${1:Item}\n\\end{itemize}\n$0' },
  { label: 'enumerate env',             insert: '\\begin{enumerate}\n\t\\item ${1:Item}\n\\end{enumerate}\n$0' },
  { label: 'equation env',              insert: '\\begin{equation}\n\t${1:f(x) = x^2}\n\\end{equation}\n$0' },
  { label: 'tabular env',               insert: '\\begin{tabular}{|${1:c|c|c|}}\n\t\\hline\n\t${2:A} & ${3:B} & ${4:C} \\\\\\\\\n\t\\hline\n\\end{tabular}\n$0' },
];

const DEFAULT_CONTENT = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath, amssymb}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{Título do Documento}
\\author{Autor}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introdução}

Escreve aqui o teu texto. Podes usar \\textbf{negrito}, \\textit{itálico}
e fórmulas matemáticas em linha como $E = mc^2$.

\\section{Desenvolvimento}

Para equações em destaque usa blocos de equação:

\\begin{equation}
  \\int_{0}^{\\infty} e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}

\\subsection{Listas}

\\begin{itemize}
  \\item Primeiro item
  \\item Segundo item
\\end{itemize}

\\end{document}
`;

function setupMonacoLatex(monaco: Monaco) {
  monaco.languages.register({ id: 'latex' });
  monaco.languages.setMonarchTokensProvider('latex', {
    defaultToken: '',
    tokenizer: {
      root: [
        [/\\[a-zA-Z@]+\*?/, 'keyword'],
        [/%.*$/, 'comment'],
        [/\$\$[\s\S]*?\$\$/, 'string'],
        [/\$[^$\n]+?\$/, 'string'],
        [/\{|\}/, 'delimiter.curly'],
        [/\[|\]/, 'delimiter.square'],
        [/[0-9]+/, 'number'],
      ],
    },
  });

  monaco.languages.registerCompletionItemProvider('latex', {
    triggerCharacters: ['\\'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn - 1,
        endColumn: position.column,
      };
      return {
        suggestions: LATEX_SNIPPETS.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: s.insert,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });
}

export const LaTeXEditor: React.FC<LaTeXEditorProps> = ({ content, onSave, isSaving, title, onBack, onDelete }) => {
  const initialValue = content?.trim() ? content : DEFAULT_CONTENT;
  const [value, setValue] = useState(initialValue);
  const [viewMode, setViewMode] = useState<ViewMode>(() => (window.innerWidth < 1024 ? 'editor' : 'split'));
  const [previewSrc, setPreviewSrc] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lineCount, setLineCount] = useState(0);
  const [cursorLine, setCursorLine] = useState(1);

  const documentTitle = value.match(/\\title\{([^}]*)\}/)?.[1] ?? 'Documento';

  const buildPreview = useCallback((src: string) => {
    try {
      const html = buildLatexPreviewDocument(src, documentTitle);
      setPreviewSrc(html);
    } catch {/* ignore */}
  }, [documentTitle]);

  // Initial preview
  useEffect(() => { buildPreview(initialValue); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && viewMode === 'split') {
        setViewMode('editor');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const handleChange = (v: string | undefined) => {
    const next = v ?? '';
    setValue(next);
    setLineCount(next.split('\n').length);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(next);
      buildPreview(next);
    }, 700);
  };

  const handleExportTex = () => {
    downloadBlob(new Blob([value], { type: 'text/plain;charset=utf-8' }), `${sanitizeFileName(documentTitle)}.tex`);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const blob = new Blob([previewSrc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    win.location.href = url;
    setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
  };

  const ViewBtn = ({ mode, icon, label }: { mode: ViewMode; icon: React.ReactNode; label: string }) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all',
        viewMode === mode
          ? 'bg-accent-blue text-white shadow-sm'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
      )}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-secondary">
      {/* Doc header: back / title / delete */}
      {(onBack || title) && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-primary/60 shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-md hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          {title && <span className="flex-1 text-sm font-semibold text-text-primary truncate">{title}</span>}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
              title="Apagar documento"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 py-2 border-b border-border bg-bg-secondary shrink-0 gap-3">
        {/* View mode */}
        <div className="flex items-center gap-1 bg-bg-primary/60 rounded-lg p-1 overflow-x-auto w-full lg:w-auto">
          <ViewBtn mode="editor" icon={<Code2 size={13} />} label="Editor" />
          <ViewBtn mode="split"  icon={<Split size={13} />}  label="Dividir" />
          <ViewBtn mode="preview" icon={<Eye size={13} />}   label="Preview" />
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-text-muted bg-bg-primary/50 px-3 py-1 rounded-md border border-border/50">
          <span>Ln {cursorLine}</span>
          <span>·</span>
          <span>{lineCount} linhas</span>
          <span>·</span>
          <span>{value.length} chars</span>
        </div>

        {/* Save + actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            {isSaving
              ? <><Loader2 size={12} className="animate-spin" /> <span className="hidden sm:inline">A guardar...</span></>
              : <><Save size={12} className="text-success" /> <span className="hidden sm:inline">Sincronizado</span></>
            }
          </span>
          <div className="w-px h-4 bg-border" />
          <button
            type="button"
            onClick={handleExportTex}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
          >
            <FileDown size={13} /> .tex
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
          >
            <FileDown size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={cn('flex-1 flex min-h-0 overflow-hidden', viewMode === 'split' ? 'flex-col lg:flex-row' : 'flex-row')}>
        {/* Monaco Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={cn('h-full flex flex-col min-h-0', viewMode === 'split' ? 'w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border flex-1' : 'w-full')}>
            {/* Editor label */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-bg-primary/60 border-b border-border text-xs text-text-muted shrink-0">
              <Code2 size={11} /> main.tex
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="latex"
                theme="vs-dark"
                value={value}
                onChange={handleChange}
                beforeMount={setupMonacoLatex}
                onMount={(editor) => {
                  setLineCount(editor.getModel()?.getLineCount() ?? 0);
                  editor.onDidChangeCursorPosition((e) => {
                    setCursorLine(e.position.lineNumber);
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13.5,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 16, bottom: 16 },
                  tabSize: 2,
                  insertSpaces: true,
                  folding: true,
                  glyphMargin: false,
                  lineDecorationsWidth: 4,
                  renderLineHighlight: 'line',
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                }}
              />
            </div>
          </div>
        )}

        {/* Preview pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={cn('h-full flex flex-col min-h-0', viewMode === 'split' ? 'w-full lg:w-1/2 flex-1' : 'w-full')}>
            {/* Preview label */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-bg-primary/60 border-b border-border text-xs text-text-muted shrink-0">
              <Eye size={11} /> Pré-visualização
              {viewMode === 'split' && (
                <span className="ml-auto hidden sm:flex items-center gap-1 text-text-muted/60">
                  <ChevronRight size={11} /> clica em PDF para exportar
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0 bg-[#e8e9eb] overflow-hidden">
              {previewSrc ? (
                <iframe
                  ref={iframeRef}
                  key={previewSrc.length}
                  srcDoc={previewSrc}
                  className="w-full h-full border-none"
                  title="LaTeX Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={28} className="animate-spin text-text-muted opacity-40" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1 border-t border-border bg-bg-primary/40 text-[11px] text-text-muted">
        <span>{documentTitle}</span>
        <span className="hidden sm:inline">UTF-8 · LaTeX</span>
      </div>
    </div>
  );
};
