import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { sendPushNotification } from './webpush.js';
import { sendEmailNotification } from './resend.js';
import { subMinutes } from 'date-fns';

export const initNotificationCron = () => {
  // Executa a cada hora no minuto 0
  cron.schedule('0 * * * *', async () => {
    console.log('Running notification check...');
    const now = new Date();

    try {
      // 1. Procurar trabalhos pendentes que têm notificação agendada e não foram notificados
      const assignments = await prisma.assignment.findMany({
        where: {
          status: { not: 'DONE' },
          notifiedAt: null,
          notifyBefore: { not: null },
          deadline: { not: null }
        },
        include: {
          subject: {
            include: { user: true }
          }
        }
      });

      for (const assignment of assignments) {
        if (!assignment.deadline || !assignment.notifyBefore) continue;

        // notifyBefore está em dias (conforme o UI: "dias antes do prazo")
        // Converter para minutos para subMinutes
        const notifyThreshold = subMinutes(new Date(assignment.deadline), assignment.notifyBefore * 60 * 24);

        if (now >= notifyThreshold) {
          const user = assignment.subject.user;
          let pushSent = false;

          // Enviar Push
          if (user.pushToken) {
            pushSent = await sendPushNotification(JSON.parse(user.pushToken), {
              title: `Prazo Próximo: ${assignment.title}`,
              body: `A entrega de ${assignment.subject.name} é daqui a pouco!`,
              icon: '/icon-192.png',
              data: { url: `/assignments` }
            });
          }

          // Fallback Email se push falhar ou não existir
          if (!pushSent && user.email) {
            await sendEmailNotification(
              user.email,
              `Lembrete: ${assignment.title}`,
              `<p>Olá ${user.name || ''},</p><p>O teu trabalho <strong>${assignment.title}</strong> tem entrega marcada para breve.</p>`
            );
          }

          // Marcar como notificado
          await prisma.assignment.update({
            where: { id: assignment.id },
            data: { notifiedAt: now }
          });
        }
      }
    } catch (error) {
      console.error('Error in notification cron:', error);
    }
  });
};
