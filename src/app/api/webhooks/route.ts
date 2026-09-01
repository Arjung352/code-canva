export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { type, data } = evt;

    console.log(`Received Clerk webhook: ${type}`);
    console.log("Webhook payload:", data);

    switch (type) {
      // when new user is created in Clerk, create a new user in the database
      case "user.created": {
        const {
          id,
          username,
          first_name,
          last_name,
          image_url,
          profile_image_url,
          primary_email_address_id,
          email_addresses,
        } = data;

        // Find the user's primary email
        const primaryEmail = email_addresses.find(
          (email) => email.id === primary_email_address_id,
        );

        if (!primaryEmail) {
          console.error("No primary email found for Clerk user:", id);

          return new Response("Primary email not found", {
            status: 400,
          });
        }

        const email = primaryEmail.email_address;

        // Generate a fallback username if Clerk username is null
        const finalUsername =
          username ||
          `${first_name || ""}${last_name || ""}`.toLowerCase() ||
          email.split("@")[0];

        await prisma.user.create({
          data: {
            id,
            username: finalUsername,
            email,
            avatarUrl: image_url || profile_image_url || null,
          },
        });

        console.log(`User created in database: ${id}`);

        break;
      }

      // when the user is updated in Clerk, update the user in the database
      case "user.updated": {
        const {
          id,
          username,
          first_name,
          last_name,
          image_url,
          profile_image_url,
          primary_email_address_id,
          email_addresses,
        } = data;

        const primaryEmail = email_addresses.find(
          (email) => email.id === primary_email_address_id,
        );

        if (!primaryEmail) {
          console.error("No primary email found for user:", id);

          return new Response("Primary email not found", {
            status: 400,
          });
        }

        const email = primaryEmail.email_address;

        const finalUsername =
          username ||
          `${first_name || ""}${last_name || ""}`.toLowerCase() ||
          email.split("@")[0];

        await prisma.user.update({
          where: {
            id,
          },
          data: {
            username: finalUsername,
            email,
            avatarUrl: image_url || profile_image_url || null,
          },
        });

        console.log(`User updated in database: ${id}`);

        break;
      }

      // when the user is deleted in Clerk, delete the user from the database
      case "user.deleted": {
        const { id } = data;

        await prisma.user.delete({
          where: {
            id,
          },
        });

        console.log(`User deleted from database: ${id}`);

        break;
      }

      default:
        console.log(`Unhandled Clerk webhook event: ${type}`);
    }

    return new Response("Webhook received", {
      status: 200,
    });
  } catch (err) {
    console.error("Error processing Clerk webhook:", err);

    return new Response("Error processing webhook", {
      status: 400,
    });
  }
}
