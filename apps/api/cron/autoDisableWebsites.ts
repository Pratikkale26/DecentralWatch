import cron from "node-cron";
import { prismaClient } from "db/client";
import { sendEmail } from "../lib/email"; // email helper

export const scheduleWebsiteAutoDisable = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Checking expired websites...");

    const now = new Date();

    const websites = await prismaClient.website.findMany({
      where: {
        disabled: false,
        expiry: { lte: now }
      }
    });

    if (websites.length === 0) {
      console.log("[CRON] No websites expired at this time.");
      return;
    }

    const userWebsitesMap: Record<string, string[]> = {};

    for (const website of websites) {
      await prismaClient.website.update({
        where: { id: website.id },
        data: { disabled: true }
      });

      if (!userWebsitesMap[website.userId]) {
        userWebsitesMap[website.userId] = [];
      }
      userWebsitesMap[website.userId].push(website.url);
    }

    const users = await prismaClient.user.findMany({
      where: {
        id: { in: Object.keys(userWebsitesMap) }
      }
    });

    for (const user of users) {
      const urls = userWebsitesMap[user.id].join(", ");

      await prismaClient.notification.create({
        data: {
          userId: user.id,
          message: `Your website(s) ${urls} have been disabled due to expiry.`
        }
      });

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Your Website(s) Expired",
          text: `Hi ${user.name || ""},\n\nYour website(s) ${urls} have been disabled because they have expired.\n\nPlease renew to reactivate them.`
        });
      }
    }

    console.log(`[CRON] Disabled ${websites.length} websites`);
    console.log(`[CRON] Sent notifications to ${users.length} users`);
  });
};
