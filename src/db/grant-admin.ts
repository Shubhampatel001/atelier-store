// Grants or revokes admin access by user ID.
//   npm run admin:grant -- <user-id>
//   npm run admin:grant -- <user-id> --revoke
//
// By ID, never by email: there is no email verification, so an email address
// doesn't prove who owns an account. Find the ID of a signed-in account in
// the `user` table and check the printed name and email before trusting it.

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

async function main() {
  const [userId, flag] = process.argv.slice(2);
  if (!userId || (flag && flag !== "--revoke")) {
    console.error("Usage: npm run admin:grant -- <user-id> [--revoke]");
    process.exit(1);
  }

  const role = flag === "--revoke" ? "user" : "admin";
  const [updated] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, userId))
    .returning({ name: user.name, email: user.email, role: user.role });

  if (!updated) {
    console.error(`No user with ID ${userId}.`);
    process.exit(1);
  }
  console.log(
    `${updated.name} <${updated.email}> is now ${updated.role === "admin" ? "an admin" : "a customer"}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
