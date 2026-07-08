import ExcelJS from "exceljs"

export type SheetSpec = {
  name: string
  headers: string[]
  rows: (string | number | Date)[][]
  currencyColumns?: number[] // 0-based column indices to format as BRL currency
}

/** Builds an .xlsx workbook buffer from one or more sheets. */
export async function buildWorkbook(sheets: SheetSpec[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name)
    worksheet.addRow(sheet.headers)
    worksheet.getRow(1).font = { bold: true }

    for (const row of sheet.rows) {
      worksheet.addRow(row)
    }

    for (const colIndex of sheet.currencyColumns ?? []) {
      const column = worksheet.getColumn(colIndex + 1)
      column.numFmt = '"R$"#,##0.00'
    }

    worksheet.columns.forEach((column) => {
      column.width = 22
    })
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}
