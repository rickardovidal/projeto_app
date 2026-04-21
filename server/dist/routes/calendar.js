import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { calendarService } from '../services/calendar.js';
import { encrypt } from '../lib/crypto.js';
const router = Router();
const prisma = new PrismaClient();
router.use(requireAuth);
// GET /api/calendar/auth -> Inicia OAuth
router.get('/auth', async (req, res) => {
    const url = calendarService.getAuthUrl();
    res.json({ url });
});
// GET /api/calendar/callback -> Callback OAuth
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await calendarService.getTokens(code);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { gcalToken: encrypt(JSON.stringify(tokens)) }
        });
        res.send('<script>window.close()</script>'); // Fecha popup
    }
    catch (error) {
        res.status(500).json({ error: 'Erro no callback do Google' });
    }
});
// GET /api/calendar/status
router.get('/status', async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ connected: !!user?.gcalToken });
});
// DELETE /api/calendar/disconnect
router.delete('/disconnect', async (req, res) => {
    await prisma.user.update({
        where: { id: req.user.id },
        data: { gcalToken: null }
    });
    res.json({ message: 'Desconectado' });
});
export default router;
