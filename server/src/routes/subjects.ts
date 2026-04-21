import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const subjectSchema = z.object({
  name: z.string().min(2).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().optional(),
});

router.use(requireAuth);

// GET /api/subjects -> Lista todas as disciplinas do user com contagem de trabalhos
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar disciplinas' });
  }
});

// POST /api/subjects -> Cria disciplina
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = subjectSchema.parse(req.body);
    const subject = await prisma.subject.create({
      data: {
        ...data,
        userId: req.user.id
      }
    });
    res.status(201).json(subject);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Erro ao criar disciplina' });
  }
});

// PUT /api/subjects/:id -> Edita disciplina
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = subjectSchema.parse(req.body);
    const id = req.params.id as string;

    const existing = await prisma.subject.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ error: 'Disciplina não encontrada' });

    const subject = await prisma.subject.update({
      where: { id },
      data,
      include: { _count: { select: { assignments: true } } }
    });

    res.json(subject);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Erro ao editar disciplina' });
  }
});

// DELETE /api/subjects/:id -> Apaga disciplina (cascade via Prisma schema)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const result = await prisma.subject.deleteMany({
      where: { id: id as string, userId: req.user.id }
    });

    if (result.count === 0) return res.status(404).json({ error: 'Disciplina não encontrada' });

    res.json({ message: 'Disciplina apagada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar disciplina' });
  }
});

export default router;
