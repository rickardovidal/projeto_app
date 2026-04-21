import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendPushNotification } from '../services/webpush.js';
const router = Router();
router.use(requireAuth);
// POST /api/notifications/subscribe -> Regista push subscription
router.post('/subscribe', async (req, res) => {
    try {
        const { subscription } = req.body;
        await prisma.user.update({
            where: { id: req.user.id },
            data: { pushToken: JSON.stringify(subscription) }
        });
        res.json({ message: 'Subscrito com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao subscrever notificações' });
    }
});
// DELETE /api/notifications/unsubscribe -> Remove subscription
router.delete('/unsubscribe', async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { pushToken: null }
        });
        res.json({ message: 'Cancelado com sucesso' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao cancelar subscrição' });
    }
});
// POST /api/notifications/test -> Envia notificação de teste
router.post('/test', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user?.pushToken)
            return res.status(400).json({ error: 'Push não configurado' });
        const subscription = JSON.parse(user.pushToken);
        const success = await sendPushNotification(subscription, {
            title: 'Teste StudyFlow',
            body: 'As notificações push estão a funcionar corretamente! 🚀',
            icon: '/icon-192.png'
        });
        if (success)
            res.json({ message: 'Notificação enviada' });
        else
            res.status(500).json({ error: 'Falha ao enviar push' });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro no teste' });
    }
});
export default router;
