import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { sql } from "@vercel/postgres";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import email from "next-auth/providers/email";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const result = await sql<User>`
        SELECT id, name, email, password FROM users WHERE email = ${email}
    `;
    return result.rows?.[0];
  } catch (e) {
    console.error("Failed to fetch user:", e);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return { ...user, password: undefined };
          }
        }

        return null;
      },
    }),
  ],
});
