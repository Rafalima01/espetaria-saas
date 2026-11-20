import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  GlassWater,
  Martini,
  HandCoins,
  UserCog,
  Landmark,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  roles: string[]
  group: string
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER"],
    group: "Visão geral",
  },
  {
    title: "PDV",
    href: "/pdv",
    icon: ShoppingCart,
    roles: ["ADMIN", "MANAGER", "CASHIER", "WAITER"],
    group: "Operação",
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: Receipt,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    group: "Operação",
  },
  {
    title: "Fiado",
    href: "/fiado",
    icon: HandCoins,
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    group: "Operação",
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Package,
    roles: ["ADMIN", "MANAGER"],
    group: "Catálogo",
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Boxes,
    roles: ["ADMIN", "MANAGER"],
    group: "Catálogo",
  },
  {
    title: "Doses",
    href: "/doses",
    icon: GlassWater,
    roles: ["ADMIN", "MANAGER"],
    group: "Catálogo",
  },
  {
    title: "Receitas",
    href: "/receitas",
    icon: Martini,
    roles: ["ADMIN", "MANAGER"],
    group: "Catálogo",
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: Landmark,
    roles: ["ADMIN", "MANAGER"],
    group: "Gestão",
  },
  {
    title: "Usuários",
    href: "/configuracoes/usuarios",
    icon: UserCog,
    roles: ["ADMIN"],
    group: "Configurações",
  },
]

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  CASHIER: "Caixa",
  WAITER: "Garçom",
}
