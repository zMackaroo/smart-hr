import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getPrimaryBankAccountSync } from '../api/bank-accounts.api'
import { getCompanySettingsSnapshot } from '../api/company.api'
import { formatDepositAccount } from '../types/bank-account.types'
import type { Payslip } from '../types/payroll.types'
import {
  buildPdfFilename,
  formatPdfCurrency,
  formatPdfDate,
  formatPdfDateTime,
} from './pdf.utils'

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(30, 30, 30)
  doc.text(title, 14, y)
  return y + 6
}

function buildEarningsRows(payslip: Payslip): string[][] {
  const rows: string[][] = [['Base Salary', formatPdfCurrency(payslip.baseSalary)]]
  for (const earning of payslip.earnings) {
    rows.push([earning.label, formatPdfCurrency(earning.amount)])
  }
  return rows
}

function buildDeductionRows(payslip: Payslip): string[][] {
  if (payslip.deductions.length === 0) {
    return [['None', '—']]
  }
  return payslip.deductions.map((deduction) => [
    deduction.label,
    formatPdfCurrency(deduction.amount),
  ])
}

export function generatePayslipPdf(payslip: Payslip): Blob {
  const company = getCompanySettingsSnapshot()
  const depositAccount = formatDepositAccount(getPrimaryBankAccountSync(payslip.employee.id))
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(company.name, 14, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Payslip — ${payslip.payPeriod.label}`, 14, y)
  y += 6
  doc.text(`Generated ${formatPdfDateTime(payslip.generatedAt)}`, 14, y)
  y += 10

  doc.setDrawColor(220, 220, 220)
  doc.line(14, y, 196, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(30, 30, 30)
  doc.text(payslip.employee.name, 14, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(`Employee ID: ${payslip.employee.employeeId}`, 14, y)
  y += 5
  doc.text(`Department: ${payslip.employee.department}`, 14, y)
  y += 5
  doc.text(`Designation: ${payslip.employee.designation}`, 14, y)
  y += 5
  doc.text(`Deposit Account: ${depositAccount}`, 14, y)
  y += 10

  y = addSectionTitle(doc, 'Earnings', y)
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount']],
    body: buildEarningsRows(payslip),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20
  y += 8

  y = addSectionTitle(doc, 'Deductions', y)
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Amount']],
    body: buildDeductionRows(payslip),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20
  y += 10

  y = addSectionTitle(doc, 'Summary', y)
  const summaryRows: string[][] = [
    ['Gross Pay', formatPdfCurrency(payslip.grossPay)],
    ['Total Deductions', formatPdfCurrency(payslip.totalDeductions)],
    ['PF (Employee)', formatPdfCurrency(payslip.pfEmployeeContribution)],
    ['PF (Employer)', formatPdfCurrency(payslip.pfEmployerContribution)],
    ['Net Pay', formatPdfCurrency(payslip.netPay)],
  ]

  autoTable(doc, {
    startY: y,
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  })

  y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 20
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(`Status: ${payslip.status.replace('_', ' ')}`, 14, y)
  if (payslip.paymentDate) {
    y += 5
    doc.text(`Payment Date: ${formatPdfDate(payslip.paymentDate)}`, 14, y)
  }

  return doc.output('blob')
}

export function getPayslipPdfFilename(payslip: Payslip): string {
  return buildPdfFilename(`payslip-${payslip.employee.employeeId.toLowerCase()}`)
}
