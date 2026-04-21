import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/verify -> Verifica JWT, cria user se não existir
router.post('/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id, email, user_metadata } = req.user;

    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        name: user_metadata?.full_name || user_metadata?.name || null,
        avatarUrl: user_metadata?.avatar_url || null,
      },
      create: {
        id: id,
        email: email,
        name: user_metadata?.full_name || user_metadata?.name || null,
        avatarUrl: user_metadata?.avatar_url || null,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me -> Dados do user autenticado
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
