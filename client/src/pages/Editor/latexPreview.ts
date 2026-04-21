import katex from 'katex';
import katexStyles from 'katex/dist/katex.min.css?inline';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripComments = (value: string) =>
  value
    .split('\n')
    .map((line) => line.replace(/(^|[^\\])%.*/, '$1'))
    .join('\n');

const normalizeMathExpression = (value: string) =>
  value
    .replace(/\\,/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\\\/g, '\\')
    .trim();

const renderMath = (expression: string, displayMode: boolean) => {
  try {
    return katex.renderToString(normalizeMathExpression(expression), {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return `<span class="latex-error">${escapeHtml(expression)}</span>`;
  }
};

const renderListEnvironment = (input: string, ordered: boolean) => {
  const tag = ordered ? 'ol' : 'ul';

  return input.replace(
    ordered
      ? /\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g
      : /\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g,
    (_match, content: string) => {
      const items = content
        .split(/\\item/g)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => `<li>${item}</li>`)
        .join('');

      return `<${tag}>${items}</${tag}>`;
    },
  );
};

const wrapParagraphs = (input: string) => {
  const blocks = input
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (/^<\/?(h1|h2|h3|div|ul|ol|li|blockquote|pre|table|thead|tbody|tr|td|th)/.test(block)) {
        return block;
      }

      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    });

  return blocks.join('\n');
};

const extractCommandArgument = (source: string, command: string) => {
  const match = source.match(new RegExp(String.raw`\\${command}\{([^}]*)\}`));
  return match?.[1]?.trim() || '';
};

const extractDocumentBody = (source: string) => {
  const match = source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  return match?.[1]?.trim() || source.trim();
};

const buildTitleBlock = (source: string) => {
  const title = extractCommandArgument(source, 'title');
  const author = extractCommandArgument(source, 'author');
  const date = extractCommandArgument(source, 'date');

  if (!title && !author && !date) {
    return '';
  }

  return `
    <header class="latex-title-block">
      ${title ? `<h1>${title}</h1>` : ''}
      ${author ? `<p class="latex-meta">${author}</p>` : ''}
      ${date ? `<p class="latex-meta">${date}</p>` : ''}
    </header>
  `;
};

const injectMathTokens = (input: string) => {
  const mathTokens: string[] = [];
  let output = input;

  const createToken = (html: string) => {
    const token = `@@LATEX_MATH_${mathTokens.length}@@`;
    mathTokens.push(html);
    return token;
  };

  output = output.replace(/\\begin\{equation\*?\}([\s\S]*?)\\end\{equation\*?\}/g, (_match, expression: string) =>
    createToken(`<div class="latex-equation">${renderMath(expression, true)}</div>`),
  );

  output = output.replace(/\\\[((?:.|\n)*?)\\\]/g, (_match, expression: string) =>
    createToken(`<div class="latex-equation">${renderMath(expression, true)}</div>`),
  );

  output = output.replace(/\$\$([\s\S]*?)\$\$/g, (_match, expression: string) =>
    createToken(`<div class="latex-equation">${renderMath(expression, true)}</div>`),
  );

  output = output.replace(/\\\((.*?)\\\)/g, (_match, expression: string) =>
    createToken(renderMath(expression, false)),
  );

  output = output.replace(/(?<!\$)\$([^\n$]+?)\$(?!\$)/g, (_match, expression: string) =>
    createToken(renderMath(expression, false)),
  );

  return {
    output,
    restoreTokens: (value: string) =>
      mathTokens.reduce((current, html, index) => current.replaceAll(`@@LATEX_MATH_${index}@@`, html), value),
  };
};

const renderLatexToHtml = (source: string) => {
  const titleBlock = buildTitleBlock(source);
  const body = extractDocumentBody(stripComments(source));
  const { output, restoreTokens } = injectMathTokens(body);

  let html = escapeHtml(output)
    .replace(/\\maketitle/g, titleBlock)
    .replace(/\\tableofcontents/g, '<div class="latex-note">Indice automatico indisponivel no preview interativo.</div>')
    .replace(/\\section\*?\{([^}]*)\}/g, '<h2>$1</h2>')
    .replace(/\\subsection\*?\{([^}]*)\}/g, '<h3>$1</h3>')
    .replace(/\\subsubsection\*?\{([^}]*)\}/g, '<h4>$1</h4>')
    .replace(/\\paragraph\*?\{([^}]*)\}/g, '<h5>$1</h5>')
    .replace(/\\textbf\{([^{}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^{}]+)\}/g, '<em>$1</em>')
    .replace(/\\emph\{([^{}]+)\}/g, '<em>$1</em>')
    .replace(/\\underline\{([^{}]+)\}/g, '<span class="latex-underline">$1</span>')
    .replace(/\\href\{([^{}]+)\}\{([^{}]+)\}/g, '<a href="$1" target="_blank" rel="noreferrer">$2</a>')
    .replace(/\\url\{([^{}]+)\}/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\\begin\{abstract\}/g, '<section class="latex-abstract"><h3>Resumo</h3>')
    .replace(/\\end\{abstract\}/g, '</section>')
    .replace(/\\begin\{center\}/g, '<div class="latex-center">')
    .replace(/\\end\{center\}/g, '</div>')
    .replace(/\\begin\{quote\}/g, '<blockquote>')
    .replace(/\\end\{quote\}/g, '</blockquote>')
    .replace(/\\newpage/g, '<div class="latex-page-break"></div>')
    .replace(/\\(begin|end)\{[^}]+\}/g, '')
    .replace(/\\item/g, '\n\\item ')
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?/g, '');

  html = renderListEnvironment(html, false);
  html = renderListEnvironment(html, true);
  html = wrapParagraphs(html);
  html = restoreTokens(html);

  return html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*(<(h2|h3|h4|h5|div|ul|ol|blockquote|section))/g, '$1')
    .replace(/(<\/(h2|h3|h4|h5|div|ul|ol|blockquote|section)>)\s*<\/p>/g, '$1');
};

export const buildLatexPreviewDocument = (source: string, title: string) => {
  const bodyHtml = renderLatexToHtml(source);

  return `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      ${katexStyles}

      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #e5e7eb;
        color: #111827;
        font-family: "Georgia", serif;
      }

      .pdf-stage {
        min-height: 100vh;
        padding: 32px;
      }

      .pdf-page {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: #ffffff;
        color: #111827;
        padding: 22mm 18mm;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
      }

      h1, h2, h3, h4, h5 {
        font-family: "DM Sans", Arial, sans-serif;
        color: #0f172a;
        margin: 0 0 12px;
      }

      h1 {
        font-size: 30px;
      }

      h2 {
        font-size: 22px;
        margin-top: 28px;
      }

      h3 {
        font-size: 18px;
        margin-top: 20px;
      }

      p, li {
        font-size: 14px;
        line-height: 1.75;
      }

      p {
        margin: 0 0 12px;
      }

      ul, ol {
        margin: 0 0 16px 22px;
        padding: 0;
      }

      blockquote {
        margin: 18px 0;
        padding: 12px 18px;
        border-left: 4px solid #94a3b8;
        background: #f8fafc;
      }

      a {
        color: #2563eb;
      }

      .latex-title-block {
        margin-bottom: 28px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;
      }

      .latex-meta {
        margin: 6px 0 0;
        color: #475569;
      }

      .latex-note {
        margin: 18px 0;
        padding: 12px 16px;
        border-radius: 12px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 13px;
      }

      .latex-equation {
        margin: 18px 0;
        overflow-x: auto;
      }

      .latex-error {
        color: #dc2626;
        font-family: "DM Mono", monospace;
      }

      .latex-underline {
        text-decoration: underline;
      }

      .latex-center {
        text-align: center;
      }

      .latex-abstract {
        margin: 18px 0 24px;
        padding: 16px 18px;
        border-radius: 12px;
        background: #f8fafc;
      }

      .latex-page-break {
        break-after: page;
        height: 1px;
      }

      @page {
        size: A4;
        margin: 16mm;
      }

      @media print {
        body {
          background: #ffffff;
        }

        .pdf-stage {
          padding: 0;
        }

        .pdf-page {
          width: auto;
          min-height: auto;
          padding: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="pdf-stage">
      <article class="pdf-page">
        ${bodyHtml}
      </article>
    </main>
  </body>
</html>`;
};
