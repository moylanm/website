'user server'

import NextAuth, { type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { compare } from 'bcryptjs';
import type { User } from '@/lib/definitions';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string
      email: string
    } & DefaultSession['user']
  }

  interface JWT {
    email: string
    name: string
  }
}

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql`
      SELECT name, password_hash
      FROM users
      WHERE email=${email}
    `;

    if (!user.rows[0]) return undefined;

    const passwordHash = Buffer.from(user.rows[0].password_hash).toString();

    return {
      ...user.rows[0],
      email,
      passwordHash,
    } as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        const parsedCredentials = z.object({
          email: z.string().email(),
          password: z.string().min(6)
        }).safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null;

          const passwordsMatch = await compare(password, user.passwordHash);

          if (passwordsMatch) {
            return {
              email: user.email,
              name: user.name
            };
          }
        }

        return null;
      }
    })
  ]
});
