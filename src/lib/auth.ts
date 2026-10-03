import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";

export const auth = betterAuth({
  appName: "Atelier",
  database: drizzleAdapter(db, { provider: "pg" }),
  // No email provider yet, so no verification or password reset emails.
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // `input: false`: sign-up and update-user requests can't set it. Grant
      // admin by user ID with `npm run admin:grant` (src/db/grant-admin.ts).
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  // nextCookies must be the last plugin.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
