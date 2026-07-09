import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SetupForm } from "@/components/auth/setup-form"

// Must run per-request, never prerendered: the redirect below depends on live
// database state (whether a user already exists), not something computable at build time.
export const dynamic = "force-dynamic"

// First-run bootstrap: only reachable while the database has zero users.
// Once an admin exists, this route permanently redirects to /login.
export default async function SetupPage() {
  const userCount = await prisma.user.count()
  if (userCount > 0) redirect("/login")

  return <SetupForm />
}
