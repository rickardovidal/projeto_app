import { Router } from 'express';
import { DocType } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
const router = Router();
const documentSchema = z.object({
    title: z.string().min(1),
    type: z.nativeEnum(DocType),
    assignmentId: z.string().uuid().optional().nullable(),
    content: z.string().optional(),
});
router.use(requireAuth);
// GET /api/documents -> Lista documentos do user
router.get('/', async (req, res) => {
    try {
        const docs = await prisma.document.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            include: { assignment: true }
        });
        res.json(docs);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao carregar documentos' });
    }
});
// POST /api/documents -> Cria documento
router.post('/', async (req, res) => {
    try {
        const data = documentSchema.parse(req.body);
        const doc = await prisma.document.create({
            data: {
                ...data,
                content: data.content || '',
                userId: req.user.id
            }
        });
        res.status(201).json(doc);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao criar documento' });
    }
});
// PUT /api/documents/:id -> Atualiza conteúdo/título
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = documentSchema.partial().parse(req.body);
        await prisma.document.updateMany({
            where: { id, userId: req.user.id },
            data
        });
        res.json({ message: 'Guardado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao guardar' });
    }
});
// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
    try {
        await prisma.document.deleteMany({
            where: { id: req.params.id, userId: req.user.id }
        });
        res.json({ message: 'Apagado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao apagar' });
    }
});
// Export endpoints (Simulação básica - a conversão real pode ser pesada)
router.get('/:id/export/docx', async (req, res) => {
    // Em produção, usaríamos uma lib como 'docx' para gerar o ficheiro real no server
    // ou devolveríamos o HTML para o client gerar.
    res.status(501).json({ message: 'Exportação DOCX processada no cliente para performance.' });
});
export default router;
