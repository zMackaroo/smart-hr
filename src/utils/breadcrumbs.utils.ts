export interface BreadcrumbItem {
  label: string
  href?: string
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  designations: 'Designations',
  attendance: 'Attendance',
  leaves: 'Leaves',
  payroll: 'Payroll',
  salary: 'Employee Salary',
  payslip: 'Payslip',
  expenses: 'Expenses',
  provident: 'Provident Fund',
  recruitment: 'Recruitment',
  jobs: 'Jobs',
  candidates: 'Candidates',
  referrals: 'Referrals',
  tickets: 'Tickets',
  reports: 'All Reports',
  settings: 'Settings',
}

const SECTION_PREFIX: Record<string, string> = {
  employees: 'HR',
  departments: 'HR',
  designations: 'HR',
  attendance: 'HR',
  leaves: 'HR',
  salary: 'Payroll',
  payslip: 'Payroll',
  expenses: 'Payroll',
  provident: 'Payroll',
  jobs: 'Recruitment',
  candidates: 'Recruitment',
  referrals: 'Recruitment',
}

function formatSegment(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (pathname === '/dashboard') {
    return [{ label: 'Dashboard' }]
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return [{ label: 'Dashboard', href: '/dashboard' }]
  }

  const breadcrumbs: BreadcrumbItem[] = []
  const firstSegment = segments[0]
  const section = SECTION_PREFIX[firstSegment] ?? SECTION_PREFIX[segments[1] ?? '']

  if (section) {
    breadcrumbs.push({ label: section })
  }

  let path = ''
  segments.forEach((segment, index) => {
    path += `/${segment}`
    const isLast = index === segments.length - 1
    const isDetailId =
      index > 0 &&
      /^[a-zA-Z0-9-]+$/.test(segment) &&
      (segments[index - 1] === 'employees' || segments[index - 1] === 'tickets')

    if (isDetailId) {
      breadcrumbs.push({
        label: segments[index - 1] === 'employees' ? 'Employee Detail' : 'Ticket Detail',
      })
      return
    }

    const label = formatSegment(segment)
    if (label === section) return

    breadcrumbs.push({
      label,
      href: isLast ? undefined : path,
    })
  })

  return breadcrumbs
}
