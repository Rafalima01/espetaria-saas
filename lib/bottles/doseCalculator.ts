export type DoseCalculatorInput = {
  volumeMl: number
  doseMl: number
  purchasePrice: number // cents
  salePrice: number // cents, per dose
}

export type DoseCalculatorResult = {
  dosesPossible: number
  costPerDose: number // cents
  profitPerDose: number // cents
  totalRevenue: number // cents, dosesPossible * salePrice
  totalCost: number // cents, purchase price of the bottle
  totalProfit: number // cents
  marginPercent: number // 0-100
}

export function calculateDoseEconomics(input: DoseCalculatorInput): DoseCalculatorResult {
  const { volumeMl, doseMl, purchasePrice, salePrice } = input
  if (doseMl <= 0 || volumeMl <= 0) {
    return {
      dosesPossible: 0,
      costPerDose: 0,
      profitPerDose: 0,
      totalRevenue: 0,
      totalCost: purchasePrice,
      totalProfit: -purchasePrice,
      marginPercent: 0,
    }
  }

  const dosesPossible = Math.floor(volumeMl / doseMl)
  const costPerDose = Math.round((purchasePrice / volumeMl) * doseMl)
  const profitPerDose = salePrice - costPerDose
  const totalRevenue = dosesPossible * salePrice
  const totalProfit = totalRevenue - purchasePrice
  const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return {
    dosesPossible,
    costPerDose,
    profitPerDose,
    totalRevenue,
    totalCost: purchasePrice,
    totalProfit,
    marginPercent,
  }
}
