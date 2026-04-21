import { Router } from 'express';
import { Priority, Status } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { calendarService } from '../services/calendar.js';
const router = Router();
const assignmentSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional().nullable(),
    subjectId: z.string().uuid(),
    deadline: z.string().datetime().optional().nullable(),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    status: z.nativeEnum(Status).default(Status.PENDING),
    notifyBefore: z.number().int().min(0).optional().nullable(),
});
router.use(requireAuth);
// GET /api/assignments -> Lista todos com filtros e ordenação
router.get('/', async (req, res) => {
    try {
        const { subjectId, status, priority, search, sortBy = 'deadline', order = 'asc' } = req.query;
        const where = {
            subject: { userId: req.user.id },
        };
        if (subjectId)
            where.subjectId = subjectId;
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                subject: true,
            },
            orderBy: {
                [sortBy]: order,
            },
        });
        res.json(assignments);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao procurar trabalhos' });
    }
});
// POST /api/assignments
router.post('/', async (req, res) => {
    try {
        const { addToCalendar, ...restBody } = req.body;
        const data = assignmentSchema.parse(restBody);
        const subject = await prisma.subject.findFirst({
            where: { id: data.subjectId, userId: req.user.id }
        });
        if (!subject)
            return res.status(403).json({ error: 'Disciplina inválida' });
        let assignment = await prisma.assignment.create({
            data,
            include: { subject: true }
        });
        if (addToCalendar && assignment.deadline) {
            try {
                const gcalEventId = await calendarService.createEvent(req.user.id, assignment);
                assignment = await prisma.assignment.update({
                    where: { id: assignment.id },
                    data: { gcalEventId },
                    include: { subject: true }
                });
            }
            catch (e) {
                console.error('GCal Error no POST:', e);
            }
        }
        res.status(201).json(assignment);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.issues });
        res.status(500).json({ error: 'Erro ao criar trabalho' });
    }
});
// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
    try {
        const data = assignmentSchema.parse(req.body);
        const id = req.params.id;
        const assignmentBefore = await prisma.assignment.findFirst({
            where: { id, subject: { userId: req.user.id } }
        });
        if (!assignmentBefore)
            return res.status(404).json({ error: 'Trabalho não encontrado' });
        const assignment = await prisma.assignment.update({
            where: { id, subject: { userId: req.user.id } },
            data,
            include: { subject: true }
        });
        if (assignment.gcalEventId && assignment.deadline) {
            try {
                await calendarService.updateEvent(req.user.id, assignment.gcalEventId, assignment);
            }
            catch (e) {
                console.error('GCal Error no PUT:', e);
            }
        }
        res.json(assignment);
    }
    catch (error) {
        if (error instanceof z.ZodError)
            return res.status(400).json({ error: error.issues });
        res.status(500).json({ error: 'Erro ao editar trabalho' });
    }
});
// PATCH /api/assignments/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = z.object({ status: z.nativeEnum(Status) }).parse(req.body);
        const id = req.params.id;
        const assignment = await prisma.assignment.updateMany({
            where: { id, subject: { userId: req.user.id } },
            data: { status }
        });
        if (assignment.count === 0)
            return res.status(404).json({ error: 'Trabalho não encontrado' });
        res.json({ id, status });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
});
// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const assignment = await prisma.assignment.findFirst({
            where: { id, subject: { userId: req.user.id } }
        });
        if (assignment?.gcalEventId) {
            try {
                await calendarService.deleteEvent(req.user.id, assignment.gcalEventId);
            }
            catch (e) {
                console.error('GCal Error no DELETE:', e);
            }
        }
        const result = await prisma.assignment.deleteMany({
            where: { id, subject: { userId: req.user.id } }
        });
        if (result.count === 0)
            return res.status(404).json({ error: 'Trabalho não encontrado' });
        res.json({ message: 'Trabalho apagado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao apagar trabalho' });
    }
});
// POST /api/assignments/:id/calendar -> Cria evento manualmente
router.post('/:id/calendar', async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.assignment.findFirst({
        where: { id, subject: { userId: req.user.id } },
        include: { subject: true }
    });
    if (!assignment || !assignment.deadline)
        return res.status(400).json({ error: 'Inválido ou sem prazo' });
    try {
        const gcalEventId = await calendarService.createEvent(req.user.id, assignment);
        const updated = await prisma.assignment.update({
            where: { id },
            data: { gcalEventId },
            include: { subject: true }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao sincronizar com Google' });
    }
});
// DELETE /api/assignments/:id/calendar -> Remove evento manualmente
router.delete('/:id/calendar', async (req, res) => {
    const id = req.params.id;
    const assignment = await prisma.assignment.findFirst({
        where: { id, subject: { userId: req.user.id } }
    });
    if (assignment?.gcalEventId) {
        try {
            await calendarService.deleteEvent(req.user.id, assignment.gcalEventId);
            const updated = await prisma.assignment.update({
                where: { id },
                data: { gcalEventId: null },
                include: { subject: true }
            });
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao remover do Google' });
        }
    }
    else {
        res.json({ message: 'Sem evento sincronizado' });
    }
});
export default router;
