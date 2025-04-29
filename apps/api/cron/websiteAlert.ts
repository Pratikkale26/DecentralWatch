import cron from 'node-cron';
import { prismaClient } from 'db/client';
import { sendEmail } from "../lib/email"; // email helper

export const scheduleWebsiteAlert = () => {
    cron.schedule('*/2 * * * *', async () => {
        console.log('[CRON] Checking for unsent notifications...');
      
        try {
          const notifications = await prismaClient.notification.findMany({
            where: { sent: false },
            take: 10, // limit to avoid spikes
          });
      
          for (const notif of notifications) {
            if (!notif.userId) continue;
      
            const user = await prismaClient.user.findUnique({
              where: { id: notif.userId },
              select: { email: true },
            });
      
            if (!user) continue;
      
            try {
              await sendEmail({
                to: user.email,
                subject: '🔔 New Notification',
                text: notif.message,
              });
      
              await prismaClient.notification.update({
                where: { id: notif.id },
                data: { sent: true },
              });
      
              console.log(`[CRON] Sent and updated notif ${notif.id}`);
            } catch (err) {
              console.error(`[CRON] Failed to send notif ${notif.id}:`, err);
            }
          }
        } catch (err) {
          console.error('[CRON] Error fetching notifications:', err);
        }
      });
          
}
