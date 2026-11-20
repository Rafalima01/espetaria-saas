import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

import { prisma } from "@/lib/prisma"

const REVALIDATE_MS = 60 * 1000

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 12h cobre um turno de trabalho; depois disso é preciso entrar de novo.
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/login" },
  // Required outside Vercel (e.g. Railway) so NextAuth trusts the Host header
  // from the platform's reverse proxy when resolving callback URLs.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase()
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.active) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.checkedAt = Date.now()
        return token
      }

      // Revalida no banco a cada minuto: quem foi desativado, apagado ou teve o
      // perfil trocado perde o acesso (ou ganha o novo perfil) sem esperar o
      // fim da sessão. Devolver null encerra a sessão.
      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0
      if (Date.now() - checkedAt > REVALIDATE_MS) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { active: true, role: true },
        })
        if (!fresh || !fresh.active) return null
        token.role = fresh.role
        token.checkedAt = Date.now()
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
