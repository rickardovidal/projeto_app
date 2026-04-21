import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

const router = Router();

router.use(requireAuth);

router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekEnd = endOfDay(addDays(now, 7));

    // 1. Trabalhos e TODOs para HOJE
    const [todayAssignments, todayTodos] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          subject: { userId },
          deadline: { gte: todayStart, lte: todayEnd },
          status: { not: 'DONE' }
        },
        include: { subject: true }
      }),
      prisma.todo.findMany({
        where: {
          userId,
          deadline: { gte: todayStart, lte: todayEnd },
          completed: false
        }
      })
    ]);

    // 2. Trabalhos para ESTA SEMANA (próximos 7 dias)
    const weekAssignments = await prisma.assignment.findMany({
      where: {
        subject: { userId },
        deadline: { gt: todayEnd, lte: weekEnd },
        status: { not: 'DONE' }
      },
      include: { subject: true },
      orderBy: { deadline: 'asc' }
    });

    // 3. Estatísticas por Disciplina (Trabalhos Pendentes vs Total)
    const subjects = await prisma.subject.findMany({
      where: { userId },
      include: {
        assignments: {
          select: { status: true }
        }
      }
    });

    const subjectStats = subjects.map(s => {
      const total = s.assignments.length;
      const done = s.assignments.filter(a => a.status === 'DONE').length;
      const pending = total - done;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        icon: s.icon,
        pending,
        total,
        progress
      };
    });

    // 4. Estatísticas Rápidas
    const [pendingCount, overdueCount, completedThisWeek] = await Promise.all([
      prisma.assignment.count({
        where: { subject: { userId }, status: { not: 'DONE' } }
      }),
      prisma.assignment.count({
        where: { 
          subject: { userId }, 
          status: { not: 'DONE' },
          deadline: { lt: todayStart }
        }
      }),
      prisma.assignment.count({
        where: {
          subject: { userId },
          status: 'DONE',
          updatedAt: { gte: startOfWeek(now), lte: endOfWeek(now) }
        }
      })
    ]);

    res.json({
      today: { assignments: todayAssignments, todos: todayTodos },
      weekAssignments,
      subjectStats,
      stats: {
        pending: pendingCount,
        overdue: overdueCount,
        completedThisWeek
      }
    });
  } catch (error) {
    console.error('ERRO NO DASHBOARD:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar dashboard', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
