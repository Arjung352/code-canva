export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify that the request actually came from Clerk
    const evt = await verifyWebhook(req);

    const { type, data } = evt;

    console.log(`Received Clerk webhook: ${type}`);

    switch (type) {
      case "user.created": {
        const {
          id,
          username,
          first_name,
          last_name,
          image_url,
          profile_image_url,
          email_addresses,
        } = data;

        console.log("Clerk User ID:", id);
        console.log("Email addresses:", email_addresses);

        const email = data.email_addresses[0].email_address;

        if (!email) {
          console.error("No email found for Clerk user:", {
            clerkUserId: id,
            emailAddresses: email_addresses,
          });

          return new Response("User has no email address", {
            status: 400,
          });
        }
        // Generate username
        const finalUsername =
          username?.trim() ||
          `${first_name || ""}${last_name || ""}`.toLowerCase().trim() ||
          email.split("@")[0];

        console.log("Creating user:", {
          id,
          username: finalUsername,
          email,
          avatarUrl: image_url || profile_image_url || null,
        });

        const user = await prisma.user.upsert({
          where: {
            id,
          },
          update: {
            username: finalUsername,
            email,
            avatarUrl: image_url || profile_image_url || null,
          },
          create: {
            id,
            username: finalUsername,
            email,
            avatarUrl: image_url || profile_image_url || null,
          },
        });

        console.log("User synced:", user.id);

        break;
      }

      // ==========================================
      // USER UPDATED
      // ==========================================
      case "user.updated": {
        const {
          id,
          username,
          first_name,
          last_name,
          image_url,
          profile_image_url,
          email_addresses,
          primary_email_address_id,
        } = data;

        const primaryEmail = email_addresses?.find(
          (email) => email.id === primary_email_address_id,
        );

        if (!primaryEmail) {
          console.error(`Primary email not found for Clerk user: ${id}`);

          return new Response("Primary email not found", {
            status: 400,
          });
        }

        const email = primaryEmail.email_address;

        const finalUsername =
          username?.trim() ||
          `${first_name || ""}${last_name || ""}`.toLowerCase().trim() ||
          email.split("@")[0];

        const user = await prisma.user.update({
          where: {
            id,
          },
          data: {
            username: finalUsername,
            email,
            avatarUrl: image_url || profile_image_url || null,
          },
        });

        console.log("User updated successfully:", user.id);

        break;
      }

      // ==========================================
      // USER DELETED
      // ==========================================
      case "user.deleted": {
        const { id } = data;

        await prisma.user.delete({
          where: {
            id,
          },
        });

        console.log(`User deleted successfully: ${id}`);

        break;
      }

      // ==========================================
      // OTHER EVENTS
      // ==========================================
      default: {
        console.log(`Unhandled Clerk event: ${type}`);
      }
    }

    return new Response("Webhook received", {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return new Response("Webhook processing failed", {
      status: 500,
    });
  }
}
