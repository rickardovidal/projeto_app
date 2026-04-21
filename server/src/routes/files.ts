import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { r2Service } from '../services/r2.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(requireAuth);

// --- FOLDERS ---

// GET /api/assignments/:id/folders -> Lista árvore de pastas
router.get('/assignments/:assignmentId/folders', async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const folders = await prisma.folder.findMany({
      where: { assignmentId },
      include: { files: true }
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pastas' });
  }
});

// POST /api/assignments/:id/folders -> Cria pasta
router.post('/assignments/:assignmentId/folders', async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const assignmentId = req.params.assignmentId as string;
    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
        assignmentId
      }
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pasta' });
  }
});

// DELETE /api/folders/:id -> Apaga pasta e ficheiros recursivamente
router.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    // 1. Encontrar todos os ficheiros dentro da pasta (e subpastas se necessário, mas aqui vamos focar no primeiro nível para simplicidade)
    const files = await prisma.file.findMany({ where: { folderId: id } });
    
    // 2. Apagar do R2
    for (const file of files) {
      await r2Service.deleteFile(file.r2Key);
    }

    // 3. Apagar da BD (cascade apagará a pasta)
    await prisma.folder.delete({ where: { id } });
    
    res.json({ message: 'Pasta apagada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar pasta' });
  }
});

// --- FILES ---

// POST /api/folders/:id/files -> Upload de ficheiro
router.post('/folders/:folderId/files', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });

    const folderId = req.params.folderId as string;
    const key = `${req.user.id}/${uuidv4()}-${req.file.originalname}`;
    
    // Upload para R2
    await r2Service.uploadFile(key, req.file.buffer, req.file.mimetype);

    // Guardar na BD
    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        r2Key: key,
        r2Url: '', // Será gerado signed URL no GET
        mimeType: req.file.mimetype,
        size: req.file.size,
        folderId
      }
    });

    res.status(201).json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro no upload' });
  }
});

// GET /api/files/:id/url -> Gera signed URL temporário
router.get('/files/:id/url', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ error: 'Ficheiro não encontrado' });

    const url = await r2Service.getSignedUrl(file.r2Key);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar URL' });
  }
});

// DELETE /api/files/:id -> Apaga ficheiro
router.delete('/files/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ error: 'Ficheiro não encontrado' });

    await r2Service.deleteFile(file.r2Key);
    await prisma.file.delete({ where: { id } });

    res.json({ message: 'Ficheiro apagado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar ficheiro' });
  }
});

export default router;
