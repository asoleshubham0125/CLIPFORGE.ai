import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../configs/prisma.js";
import * as Sentry from "@sentry/node";

const getPrimaryEmail = (data: any): string | null => {
  if (!Array.isArray(data?.email_addresses)) return null;

  const primaryById = data.email_addresses.find(
    (email: any) => email?.id === data?.primary_email_address_id,
  );

  return (
    primaryById?.email_address ?? data.email_addresses[0]?.email_address ?? null
  );
};

const getFullName = (data: any): string => {
  const fullName = [data?.first_name, data?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || "Unknown User";
};

const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt: any = await verifyWebhook(req);
    // Get data from request
    const { data, type } = evt;
    
    // Log to file for debugging
    import("fs").then(fs => {
      fs.appendFileSync(
        "webhook_logs.txt", 
        `\n\n=== WEBHOOK: ${type} ===\n${JSON.stringify(data, null, 2)}`
      );
    });
    
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Type:", type);
    console.log("========================");

    switch (type) {
      case "user.created": {
        const email = getPrimaryEmail(data);

        if (!email) {
          return res
            .status(400)
            .json({ message: "Missing user email in webhook payload" });
        }

        try {
          await prisma.user.upsert({
            where: { id: data.id },
            create: {
              id: data.id,
              email,
              name: getFullName(data),
              image: data?.image_url || "",
            },
            update: {
              email,
              name: getFullName(data),
              image: data?.image_url || "",
            },
          });
        } catch (dbError: any) {
          console.error("Database error in user.created:", dbError.message);
          Sentry.captureException(dbError);
          // Still respond with 200 to acknowledge receipt
          return res.json({ message: "Webhook received (database pending)" });
        }
        break;
      }

      case "user.updated": {
        const email = getPrimaryEmail(data);

        if (!email) {
          return res
            .status(400)
            .json({ message: "Missing user email in webhook payload" });
        }

        try {
          await prisma.user.upsert({
            where: {
              id: data.id,
            },
            create: {
              id: data.id,
              email,
              name: getFullName(data),
              image: data?.image_url || "",
            },
            update: {
              email,
              name: getFullName(data),
              image: data?.image_url || "",
            },
          });
        } catch (dbError: any) {
          console.error("Database error in user.updated:", dbError.message);
          Sentry.captureException(dbError);
          return res.json({ message: "Webhook received (database pending)" });
        }
        break;
      }

      case "user.deleted": {
        const clerkUserId = data?.id;

        if (!clerkUserId) {
          return res
            .status(400)
            .json({ message: "Missing user id in delete webhook payload" });
        }

        try {
          await prisma.user.deleteMany({
            where: {
              id: clerkUserId,
            },
          });
        } catch (dbError: any) {
          console.error("Database error in user.deleted:", dbError.message);
          Sentry.captureException(dbError);
          return res.json({ message: "Webhook received (database pending)" });
        }
        break;
      }

      case "paymentAttempt.updated": {
        console.log("paymentAttempt.updated payload:", JSON.stringify(data, null, 2));

        if (data.status === "paid") {
          const credits: Record<string, number> = { pro: 80, ultra: 300 };

          // Try multiple possible paths for user ID
          const clerkUserId =
            data?.payer?.user_id ||
            data?.payer_id ||
            data?.payer?.id;

          // Try multiple possible paths for plan slug
          const planSlug =
            data?.subscription_items?.[0]?.plan?.slug ||
            data?.items?.[0]?.plan?.slug ||
            data?.plan?.slug ||
            data?.subscription_items?.[0]?.slug ||
            data?.items?.[0]?.slug;

          console.log("Payment - userId:", clerkUserId, "planSlug:", planSlug, "status:", data.status);

          if (!clerkUserId) {
            console.error("paymentAttempt.updated: Could not find user ID in payload");
            return res.status(400).json({ message: "Missing user ID" });
          }

          if (!planSlug || !credits[planSlug]) {
            console.error("paymentAttempt.updated: Invalid plan slug:", planSlug);
            return res.status(400).json({ message: "Invalid plan: " + planSlug });
          }

          try {
            await prisma.user.update({
              where: { id: clerkUserId },
              data: {
                credits: { increment: credits[planSlug] },
              },
            });
            console.log(`Credits incremented by ${credits[planSlug]} for user ${clerkUserId}`);
          } catch (dbError: any) {
            console.error(
              "Database error in paymentAttempt.updated:",
              dbError.message,
            );
            Sentry.captureException(dbError);
            return res.json({ message: "Webhook received (database pending)" });
          }
        }
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        console.log(`${type} payload:`, JSON.stringify(data, null, 2));

        // Extract user ID from subscription data
        const subUserId =
          data?.payer_id ||
          data?.payer?.user_id ||
          data?.payer?.id ||
          data?.user_id;

        // Extract plan slug from subscription items
        const subPlanSlug =
          data?.items?.[0]?.plan?.slug ||
          data?.subscription_items?.[0]?.plan?.slug ||
          data?.plan?.slug;

        const subCredits: Record<string, number> = { pro: 80, ultra: 300 };

        console.log(`Subscription - userId: ${subUserId}, plan: ${subPlanSlug}, status: ${data?.status}`);

        if (subUserId && subPlanSlug && subCredits[subPlanSlug] && data?.status === "active") {
          try {
            await prisma.user.update({
              where: { id: subUserId },
              data: {
                credits: { increment: subCredits[subPlanSlug] },
              },
            });
            console.log(`Subscription credits incremented by ${subCredits[subPlanSlug]} for user ${subUserId}`);
          } catch (dbError: any) {
            console.error(`Database error in ${type}:`, dbError.message);
            Sentry.captureException(dbError);
            return res.json({ message: "Webhook received (database pending)" });
          }
        }
        break;
      }

      default:
        console.log("Unhandled webhook type:", type);
        break;
    }

    res.json({ message: "Webhook Recieved: " + type });
  } catch (error: any) {
    Sentry.captureException(error);
    console.error("Clerk webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default clerkWebhooks;
