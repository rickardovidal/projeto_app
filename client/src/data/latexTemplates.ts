export interface LaTeXTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const LATEX_TEMPLATES: LaTeXTemplate[] = [
  {
    id: 'academic-report',
    name: 'Relatório Académico',
    description: 'Template estruturado com capa, índice e secções padrão.',
    content: `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[portuguese]{babel}
\\usepackage{geometry}
\\geometry{margin=2.5cm}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Título do Relatório}
\\author{Nome do Autor}
\\date{\\today}

\\begin{document}
\\maketitle
\\tableofcontents

\\section{Introdução}
O objetivo deste relatório é...

\\section{Desenvolvimento}
\\subsection{Metodologia}
Os passos seguidos foram...

\\section{Conclusão}
Em conclusão, os resultados demonstram que...

\\end{document}`
  },
  {
    id: 'ieee-article',
    name: 'Artigo Científico (IEEE)',
    description: 'Formato de conferência IEEE com duas colunas.',
    content: `\\documentclass[conference]{IEEEtran}
\\usepackage[utf8]{inputenc}

\\title{Título do Artigo}
\\author{\\IEEEauthorblockN{Nome do Autor}\\\\ \\IEEEauthorblockA{Universidade\\\\Email}}

\\begin{document}
\\maketitle

\\begin{abstract}
Este resumo descreve as principais contribuições do artigo...
\\end{abstract}

\\section{Introduction}
Modern challenges require...

\\section{Related Work}
Previous studies have shown...

\\section{Methodology}
Our approach consists of...

\\section{Results}
The experimental evaluation...

\\section{Conclusion}
Future work will focus on...

\\end{document}`
  },
  {
    id: 'exercise-resolution',
    name: 'Resolução de Exercícios',
    description: 'Limpo e direto para entrega de fichas de trabalho.',
    content: `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}

\\title{Resolução da Ficha \#1}
\\author{Nome do Aluno}
\\date{}

\\begin{document}
\\maketitle

\\paragraph{Exercício 1}
Dada a equação $x^2 + y^2 = z^2$, calcule...

\\paragraph{Resolução:}
\\begin{equation}
  E = mc^2
\\end{equation}

\\end{document}`
  },
  {
    id: 'blank-doc',
    name: 'Documento em Branco',
    description: 'Template minimalista para começar do zero.',
    content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\begin{document}
Escreve aqui o teu conteúdo...
\\end{document}`
  }
];
