import { useReducer } from "react"

type BaseCartLine = {
  key: string
  quantity: number
  note: string
  discount: number
}

export type ProductCartLine = BaseCartLine & {
  kind: "product"
  productId: string
  name: string
  unitPrice: number
  stock: number
}

export type DoseMode = "DOSE" | "HALF_BOTTLE" | "FULL_BOTTLE"

export type DoseCartLine = BaseCartLine & {
  kind: "dose"
  productId: string
  productName: string
  doseSizeId?: string
  mode: DoseMode
  volumeMl: number
  unitPrice: number
  label: string // e.g. "50ml", "Meia garrafa", "Garrafa inteira"
}

export type RecipeCartLine = BaseCartLine & {
  kind: "recipe"
  recipeId: string
  name: string
  unitPrice: number
}

export type CartLine = ProductCartLine | DoseCartLine | RecipeCartLine

type CartState = {
  lines: CartLine[]
  saleDiscount: number
  saleSurcharge: number
}

type CartAction =
  | { type: "ADD_PRODUCT"; product: { id: string; name: string; salePrice: number; stock: number } }
  | {
      type: "ADD_DOSE"
      dose: {
        productId: string
        productName: string
        doseSizeId?: string
        mode: DoseMode
        volumeMl: number
        unitPrice: number
        label: string
      }
    }
  | { type: "ADD_RECIPE"; recipe: { id: string; name: string; salePrice: number } }
  | { type: "SET_QTY"; key: string; quantity: number }
  | { type: "SET_NOTE"; key: string; note: string }
  | { type: "SET_DISCOUNT"; key: string; discount: number }
  | { type: "REMOVE_LINE"; key: string }
  | { type: "SET_SALE_DISCOUNT"; discount: number }
  | { type: "SET_SALE_SURCHARGE"; surcharge: number }
  | { type: "CLEAR" }

const initialState: CartState = { lines: [], saleDiscount: 0, saleSurcharge: 0 }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_PRODUCT": {
      const key = action.product.id
      const existing = state.lines.find((l) => l.key === key)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + 1 } : l
          ),
        }
      }
      const line: ProductCartLine = {
        kind: "product",
        key,
        productId: action.product.id,
        name: action.product.name,
        unitPrice: action.product.salePrice,
        stock: action.product.stock,
        quantity: 1,
        note: "",
        discount: 0,
      }
      return { ...state, lines: [...state.lines, line] }
    }
    case "ADD_DOSE": {
      const key = `dose:${action.dose.productId}:${action.dose.mode}:${action.dose.doseSizeId ?? ""}`
      const existing = state.lines.find((l) => l.key === key)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + 1 } : l
          ),
        }
      }
      const line: DoseCartLine = {
        kind: "dose",
        key,
        productId: action.dose.productId,
        productName: action.dose.productName,
        doseSizeId: action.dose.doseSizeId,
        mode: action.dose.mode,
        volumeMl: action.dose.volumeMl,
        unitPrice: action.dose.unitPrice,
        label: action.dose.label,
        quantity: 1,
        note: "",
        discount: 0,
      }
      return { ...state, lines: [...state.lines, line] }
    }
    case "ADD_RECIPE": {
      const key = `recipe:${action.recipe.id}`
      const existing = state.lines.find((l) => l.key === key)
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + 1 } : l
          ),
        }
      }
      const line: RecipeCartLine = {
        kind: "recipe",
        key,
        recipeId: action.recipe.id,
        name: action.recipe.name,
        unitPrice: action.recipe.salePrice,
        quantity: 1,
        note: "",
        discount: 0,
      }
      return { ...state, lines: [...state.lines, line] }
    }
    case "SET_QTY":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, quantity: Math.max(1, action.quantity) } : l
        ),
      }
    case "SET_NOTE":
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === action.key ? { ...l, note: action.note } : l)),
      }
    case "SET_DISCOUNT":
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, discount: Math.max(0, action.discount) } : l
        ),
      }
    case "REMOVE_LINE":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) }
    case "SET_SALE_DISCOUNT":
      return { ...state, saleDiscount: Math.max(0, action.discount) }
    case "SET_SALE_SURCHARGE":
      return { ...state, saleSurcharge: Math.max(0, action.surcharge) }
    case "CLEAR":
      return initialState
    default:
      return state
  }
}

export function useCart() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const subtotal = state.lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity - l.discount,
    0
  )
  const total = Math.max(0, subtotal - state.saleDiscount + state.saleSurcharge)

  return { state, dispatch, subtotal, total }
}
