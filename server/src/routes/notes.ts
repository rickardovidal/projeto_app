import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const noteSchema = z.object({
  content: z.string(),
});

router.use(requireAuth);

// GET /api/assignments/:id/notes -> Lista notas de um trabalho
router.get('/assignments/:assignmentId/notes', async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    
    // Verify assignment ownership
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, subject: { userId: req.user.id } }
    });

    if (!assignment) return res.status(404).json({ error: 'Trabalho não encontrado' });

    const notes = await prisma.note.findMany({
      where: { assignmentId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar notas' });
  }
});

// POST /api/assignments/:id/notes -> Cria nota
router.post('/assignments/:assignmentId/notes', async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const { content } = noteSchema.parse(req.body);

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, subject: { userId: req.user.id } }
    });

    if (!assignment) return res.status(404).json({ error: 'Trabalho não encontrado' });

    const note = await prisma.note.create({
      data: {
        content,
        assignmentId
      }
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar nota' });
  }
});

// PUT /api/notes/:id -> Edita nota
router.put('/notes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { content } = noteSchema.parse(req.body);

    const note = await prisma.note.findFirst({
      where: { id, assignment: { subject: { userId: req.user.id } } }
    });

    if (!note) return res.status(404).json({ error: 'Nota não encontrada' });

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { content }
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar nota' });
  }
});

// DELETE /api/notes/:id -> Apaga nota
router.delete('/notes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const note = await prisma.note.findFirst({
      where: { id, assignment: { subject: { userId: req.user.id } } }
    });

    if (!note) return res.status(404).json({ error: 'Nota não encontrada' });

    await prisma.note.delete({ where: { id } });

    res.json({ message: 'Nota apagada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar nota' });
  }
});

export default router;
