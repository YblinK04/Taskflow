import NextAuth, { NextAuthConfig, User, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { LoginSchema } from '@/lib/schemas';
import { JWT } from "next-auth/jwt";

declare module "next-auth" {

  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
  }

 
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {

  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
  }
}
    
export const authConfig: NextAuthConfig = {
 providers: [
    Credentials({
        name: 'Credentials',
        credentials: {
            email: {label: 'Email', type: 'email'},
            password: { label: 'Password', type: 'password'}
        },
        async authorize(credentials) {
            try {
                const validateFields = LoginSchema.safeParse(credentials);

                if (!validateFields.success){
                    return null
                }

                const {email, password} = validateFields.data;

                const user = await prisma.user.findUnique({
                    where: {email},
                });

                if (!user || !user.password) {
                    return null
                }

                const passwordMatch = await compare(password, user.password);

                if (!passwordMatch) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                } as User
            } catch (error) {
                console.error('Auth Error', error)
                return null
            }
        },
    }),
 ],
 callbacks: {
    async jwt({token, user}) {
        if (user) {
            token.id = user.id;
            token.role = user.role;
        }
        return token
    },
    async session({session, token}) {
        if (session.user) {
            session.user.id = token.id;
            session. user.role = token.role 
        }
        return session
   },
 },
 pages: {
    signIn: '/auth/login',
    error: '/auth/error'
 },
 session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
 },
 secret: process.env.NEXTAUTH_SECRET
};

export const {handlers, auth, signIn, signOut} = NextAuth(authConfig)