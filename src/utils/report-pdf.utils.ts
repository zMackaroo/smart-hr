import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReportColumn, ReportData, ReportFilter } from '../types/report.types'
import {
  buildPdfFilename,
  formatPdfCellValue,
  formatPdfDateTime,
} from './pdf.utils'

interface ReportPdfContext {
  filterSummary?: string
}

function buildFilterSummary(
  filters: ReportFilter,
  departments: Array<{ id: string; name: string }>,
  employees: Array<{ id: string; name: string }>,
): string {
  const parts: string[] = []

  if (filters.departmentId) {
    const department = departments.find((item) => item.id === filters.departmentId)
    parts.push(`Department: ${department?.name ?? filters.departmentId}`)
  }

  if (filters.employeeId) {
    const employee = employees.find((item) => item.id === filters.employeeId)
    parts.push(`Employee: ${employee?.name ?? filters.employeeId}`)
  }

  if (filters.status) {
    parts.push(`Status: ${filters.status.replace('_', ' ')}`)
  }

  if (filters.month && filters.year) {
    parts.push(`Period: ${filters.month}/${filters.year}`)
  } else if (filters.year) {
    parts.push(`Year: ${filters.year}`)
  }

  if (filters.dateFrom || filters.dateTo) {
    parts.push(
      `Date range: ${filters.dateFrom ?? '…'} to ${filters.dateTo ?? '…'}`,
    )
  }

  return parts.length > 0 ? parts.join(' · ') : 'All records'
}

function formatReportRows(
  columns: ReportColumn[],
  rows: ReportData['rows'],
): string[][] {
  return rows.map((row) =>
    columns.map((column) => formatPdfCellValue(row[column.key])),
  )
}

function addPageNumbers(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text(`Page ${page} of ${pageCount}`, 196, 287, { align: 'right' })
  }
}

export function generateReportPdf(
  report: ReportData,
  context?: ReportPdfContext,
): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(report.title, 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(`Generated ${formatPdfDateTime(report.generatedAt)}`, 14, 23)
  doc.text(context?.filterSummary ?? 'All records', 14, 29)
  doc.text(`${report.totalRows} record${report.totalRows === 1 ? '' : 's'}`, 14, 35)

  autoTable(doc, {
    startY: 42,
    head: [report.columns.map((column) => column.label)],
    body: formatReportRows(report.columns, report.rows),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    margin: { left: 14, right: 14, bottom: 16 },
    columnStyles: Object.fromEntries(
      report.columns.map((column, index) => [
        index,
        {
          halign:
            column.align === 'right' ? 'right' : column.align === 'center' ? 'center' : 'left',
        },
      ]),
    ),
  })

  addPageNumbers(doc)

  return doc.output('blob')
}

export function getReportPdfFilename(type: ReportData['type']): string {
  return buildPdfFilename(`${type}-report`)
}

export function buildReportFilterSummary(
  filters: ReportFilter,
  departments: Array<{ id: string; name: string }>,
  employees: Array<{ id: string; name: string }>,
): string {
  return buildFilterSummary(filters, departments, employees)
}
