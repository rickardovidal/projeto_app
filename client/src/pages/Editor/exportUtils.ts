export const sanitizeFileName = (value: string) => {
  const normalized = value.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '-');
  return normalized || 'documento';
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printHtmlDocument = (html: string, title: string) =>
  new Promise<void>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');

    const cleanup = () => {
      window.setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };

    iframe.onload = () => {
      const printWindow = iframe.contentWindow;

      if (!printWindow) {
        cleanup();
        reject(new Error('Nao foi possivel abrir a janela de impressao.'));
        return;
      }

      printWindow.focus();
      printWindow.print();
      cleanup();
      resolve();
    };

    iframe.srcdoc = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    document.body.appendChild(iframe);
  });

export const buildDocxHtmlDocument = (title: string, bodyHtml: string) => `<!DOCTYPE html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: "Georgia", serif;
        color: #111827;
        line-height: 1.6;
        margin: 32px;
      }

      h1, h2, h3 {
        color: #111827;
        margin-top: 24px;
      }

      p {
        margin: 0 0 12px;
      }

      blockquote {
        border-left: 4px solid #94a3b8;
        margin: 16px 0;
        padding-left: 16px;
        color: #334155;
      }

      pre {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        white-space: pre-wrap;
      }

      table {
        border-collapse: collapse;
        margin: 16px 0;
        width: 100%;
      }

      th, td {
        border: 1px solid #cbd5e1;
        padding: 8px 12px;
        text-align: left;
      }

      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;
