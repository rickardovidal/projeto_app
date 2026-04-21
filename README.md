# 🎓 StudyFlow

**StudyFlow** é um gestor académico moderno e inteligente desenhado para ajudar os estudantes universitários a organizar disciplinas, trabalhos, notas e ficheiros de forma eficiente e centralizada.

A aplicação conta com um design limpo e _dark-mode first_, sendo completamente responsiva (Mobile e Desktop).

---

## ✨ Funcionalidades Principais

1. **Dashboard Consolidado:** Uma visão geral do dia académico, incluindo trabalhos atrasados, tarefas para hoje, próximos 7 dias e o progresso em cada disciplina.
2. **Gestão de Disciplinas e Trabalhos:** CRUD completo para gerir cadeiras e as respetivas entregas. Filtros inteligentes por disciplina, estado e prioridade.
3. **Editor de Documentos e Notas:**
   - **Rich Text (Word-like):** Baseado em TipTap, com auto-save, formatação completa e suporte a imagens e blocos de código.
   - **LaTeX (Científico):** Editor Monaco com sintaxe LaTeX, side-by-side preview via KaTeX e templates académicos (Relatórios, IEEE, etc.).
4. **Gestor de Ficheiros (R2):** Sistema de armazenamento integrado no perfil de cada trabalho para anexar PDFs, slides ou imagens (drag & drop suportado).
5. **Integração Google Calendar:** Sincronização bidirecional e automática de prazos com a tua conta do Google.
6. **Notificações Push e Email:** Lembretes em tempo real para não perderes os teus prazos, suportado via Web Push API e Resend.

---

## 🏗️ Arquitetura e Stack Tecnológica

### Frontend (`/client`)
- **Framework:** React 18 + Vite
- **Linguagem:** TypeScript
- **Estado:** Zustand
- **Estilização:** Tailwind CSS v3 (Custom Design System CSS Variables)
- **Rotas:** React Router v6
- **Comunicação API:** Axios
- **Editores:** TipTap v2 (Rich Text), Monaco Editor + KaTeX (LaTeX)

### Backend (`/server`)
- **Runtime:** Node.js + Express
- **Linguagem:** TypeScript
- **Base de Dados:** PostgreSQL hospedado no Supabase
- **ORM:** Prisma
- **Autenticação:** Supabase Auth + JWT via Header
- **Armazenamento:** Cloudflare R2 (via AWS SDK S3)
- **Agendamento:** Node-Cron (Para notificações push)
- **Validação:** Zod

---

## 🚀 Como Correr o Projeto Localmente

### 1. Pré-requisitos
- Node.js (v18 ou superior)
- Conta no Supabase (para Base de Dados e Autenticação)
- Conta no Cloudflare (para R2)
- Credenciais OAuth do Google Cloud Console (Calendar API)
- Chaves VAPID (para Web Push) e conta no Resend (Emails)

### 2. Instalação e Configuração

Na raiz do repositório:
```bash
npm install
```
Isto irá instalar as dependências de orquestração na raiz. Depois, instala as dependências em cada subdiretório:
```bash
cd client && npm install
cd ../server && npm install
```

### 3. Variáveis de Ambiente (`.env`)

#### No Backend (`server/.env`):
Cria uma cópia do `server/.env.example` com o nome `.env` e preenche:
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
JWT_SECRET=uma_chave_secreta_aleatoria_com_32_caracteres

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=studyflow-files

# Web Push (gera via npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:o_teu_email@domain.com

# Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# Resend
RESEND_API_KEY=...
```

#### No Frontend (`client/.env`):
Cria uma cópia do `client/.env.example` com o nome `.env` e preenche:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://[ref].supabase.co
VITE_SUPABASE_ANON_KEY=ey...
VITE_GOOGLE_CLIENT_ID=...
VITE_VAPID_PUBLIC_KEY=...
```

### 4. Base de Dados (Prisma)
Aplica o schema do Prisma à tua base de dados PostgreSQL:
```bash
cd server
npx prisma db push
npx prisma generate
```

### 5. Arranque da Aplicação
Na **raiz** do projeto, corre o seguinte comando para iniciar o Frontend (Vite) e o Backend (tsx) em simultâneo:
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## ☁️ Deploy Rápido (GitHub + Render + Vercel)

### 1) Preparar repositório no GitHub
```bash
git add .
git commit -m "chore: prepare deployment"
git push origin main
```

### 2) Deploy do Backend no Render
Este projeto já inclui `render.yaml` na raiz.

1. No Render, clica **New +** → **Blueprint**.
2. Liga o repositório GitHub.
3. O serviço `studyflow-api` será criado usando:
   - `rootDir: server`
   - `buildCommand: npm ci && npx prisma generate && npx prisma db push && npm run build`
   - `startCommand: npm run start`
4. Define as variáveis de ambiente (mínimo):
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGIN` (URL do Vercel, ex: `https://studyflow.vercel.app`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (ex: `https://<render-app>.onrender.com/api/calendar/callback`)
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`
   - `RESEND_API_KEY`

### 3) Deploy do Frontend no Vercel
Este projeto já inclui `client/vercel.json` (fallback SPA para React Router).

1. No Vercel, **Add New Project** e importa o mesmo repositório.
2. Em **Root Directory**, escolhe `client`.
3. Variáveis de ambiente no Vercel:
   - `VITE_API_URL=https://<render-app>.onrender.com/api`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_GOOGLE_CLIENT_ID=...`
   - `VITE_VAPID_PUBLIC_KEY=...`
4. Faz deploy.

### 4) Ajustes finais para evitar erros
1. Em **Supabase Auth**, adiciona:
   - **Site URL** = URL do Vercel
   - **Redirect URLs** = URL do Vercel
2. Em **Google Cloud OAuth**, adiciona:
   - **Authorized redirect URI** = `https://<render-app>.onrender.com/api/calendar/callback`
3. No Render, confirma `CORS_ORIGIN` exatamente igual ao domínio final do Vercel.
4. Testa:
   - `GET https://<render-app>.onrender.com/api/health`
   - Login
   - CRUD básico (subjects/assignments/todos)

---

## 🛡️ Segurança e Boas Práticas
- Nenhuma variável sensível ou *secret* é exposta ao lado do cliente.
- O sistema valida estritamente a posse do documento/trabalho no backend (`where: { userId: req.user.id }`), prevenindo acessos indevidos (IDOR).
- Todos os payloads de POST/PUT/PATCH são validados com `Zod`.
- O Token do Google Calendar é encriptado de forma simétrica (`aes-256-cbc`) na Base de Dados e desencriptado apenas *in-memory* durante a sincronização.
- O *Service Worker* garante o tratamento correto das notificações Push mesmo com a aplicação fechada.

## 👥 Fluxo de Desenvolvimento
- Qualquer alteração ao schema da Base de Dados deve ser feita em `server/prisma/schema.prisma` e seguida de `npx prisma db push` e `npx prisma generate`.
- Todos os componentes UI residem em `client/src/components/ui/` e devem ser reutilizados em vez de criar elementos novos com classes estáticas idênticas.

---
**Feito com ☕ e 🎓 para organizar o caos académico.**
