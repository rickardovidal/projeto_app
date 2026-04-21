import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import assignmentRoutes from './routes/assignments.js';
import todoRoutes from './routes/todos.js';
import dashboardRoutes from './routes/dashboard.js';
import fileRoutes from './routes/files.js';
import noteRoutes from './routes/notes.js';
import documentRoutes from './routes/documents.js';
import notificationRoutes from './routes/notifications.js';
import calendarRoutes from './routes/calendar.js';
import { initNotificationCron } from './services/notificationCron.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const HOST = '0.0.0.0';
const requestLoggingEnabled = process.env.REQUEST_LOGGING !== 'false';
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
] as const;
const missingRequiredEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!requestLoggingEnabled) {
    next();
    return;
  }

  const startedAt = Date.now();
  const origin = req.headers.origin ?? '-';
  const userAgent = req.headers['user-agent'] ?? '-';

  console.log(`[REQ] ${req.method} ${req.originalUrl} origin=${origin} ua="${userAgent}"`);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(`[RES] ${req.method} ${req.originalUrl} status=${res.statusCode} duration=${durationMs}ms`);
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', fileRoutes);
app.use('/api', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/documents', documentRoutes);
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error && err.message.startsWith('CORS blocked for origin:')) {
    console.warn(`[CORS] ${err.message}`);
    res.status(403).json({ error: err.message });
    return;
  }

  console.error(`[ERR] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'StudyFlow API is running',
    uptimeSeconds: Math.round(process.uptime()),
    requestLoggingEnabled,
  });
});

initNotificationCron();

app.listen(PORT, HOST, () => {
  console.log(`Server is running on ${HOST}:${PORT}`);
  console.log(`[BOOT] Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '(any origin)'}`);
  console.log(`[BOOT] REQUEST_LOGGING=${requestLoggingEnabled}`);
  if (missingRequiredEnvVars.length > 0) {
    console.warn(`[BOOT] Missing required env vars: ${missingRequiredEnvVars.join(', ')}`);
  }
});
