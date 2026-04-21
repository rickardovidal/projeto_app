import { Router, Response } from 'express';
import { Priority } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

const todoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
});

router.use(requireAuth);

// GET /api/todos -> Lista todos os TODOs do user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { completed: 'asc' },
        { deadline: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar tarefas' });
  }
});

// POST /api/todos -> Cria TODO
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = todoSchema.parse(req.body);
    const todo = await prisma.todo.create({
      data: {
        ...data,
        userId: req.user.id
      }
    });
    res.status(201).json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
});

// PUT /api/todos/:id -> Edita TODO
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = todoSchema.parse(req.body);
    const id = req.params.id as string;

    const existing = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const todo = await prisma.todo.update({
      where: { id },
      data
    });

    res.json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.issues });
    res.status(500).json({ error: 'Erro ao editar tarefa' });
  }
});

// PATCH /api/todos/:id/toggle -> Toggle completed
router.patch('/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const todo = await prisma.todo.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada' });

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { 
        completed: !todo.completed,
        status: !todo.completed ? 'DONE' : 'PENDING'
      }
    });

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

// DELETE /api/todos/:id -> Apaga TODO
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await prisma.todo.deleteMany({
      where: { id, userId: req.user.id }
    });

    if (result.count === 0) return res.status(404).json({ error: 'Tarefa não encontrada' });

    res.json({ message: 'Tarefa apagada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar tarefa' });
  }
});

export default router;
