import { NextResponse } from "next/server"
import { auth } from "@/auth"

const PUBLIC_ROUTES = [/^\/login/, /^\/forgot-password/, /^\/reset-password/]

const roleRules: [pattern: RegExp, roles: string[]][] = [
  [/^\/produtos/, ["ADMIN", "MANAGER"]],
  [/^\/estoque/, ["ADMIN", "MANAGER"]],
  [/^\/dashboard/, ["ADMIN", "MANAGER"]],
  [/^\/vendas/, ["ADMIN", "MANAGER", "CASHIER"]],
  [/^\/pdv/, ["ADMIN", "MANAGER", "CASHIER", "WAITER"]],
  [/^\/receitas/, ["ADMIN", "MANAGER"]],
  [/^\/doses/, ["ADMIN", "MANAGER"]],
  [/^\/fiado/, ["ADMIN", "MANAGER", "CASHIER"]],
  [/^\/configuracoes/, ["ADMIN"]],
]

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth

  if (PUBLIC_ROUTES.some((re) => re.test(nextUrl.pathname))) {
    return NextResponse.next()
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const rule = roleRules.find(([pattern]) => pattern.test(nextUrl.pathname))
  if (rule) {
    const [, allowedRoles] = rule
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL("/pdv", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
}
