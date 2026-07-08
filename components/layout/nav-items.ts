import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  GlassWater,
  HandCoins,
  UserCog,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  roles: string[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "PDV",
    href: "/pdv",
    icon: ShoppingCart,
    roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER"],
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: Receipt,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Package,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Boxes,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Doses",
    href: "/doses",
    icon: GlassWater,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Fiado",
    href: "/fiado",
    icon: HandCoins,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
  },
  {
    title: "Usuários",
    href: "/configuracoes/usuarios",
    icon: UserCog,
    roles: ["ADMIN"],
  },
]

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  CASHIER: "Caixa",
  WAITER: "Garçom",
}
