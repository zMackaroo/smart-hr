import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Shield,
  Ticket,
  UserPlus,
  Users,
  UserSearch,
  Wallet,
} from 'lucide-react'
import type { UserRole } from '../types/auth.types'

export interface NavItemConfig {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export interface NavSectionConfig {
  label: string
  items: NavItemConfig[]
}

export const NAV_SECTIONS: NavSectionConfig[] = [
  {
    label: 'MAIN',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
    ],
  },
  {
    label: 'HR',
    items: [
      { label: 'Employees', href: '/employees', icon: Users, roles: ['super_admin', 'hr_admin'] },
      {
        label: 'Departments',
        href: '/departments',
        icon: Building2,
        roles: ['super_admin', 'hr_admin'],
      },
      {
        label: 'Designations',
        href: '/designations',
        icon: Briefcase,
        roles: ['super_admin', 'hr_admin'],
      },
      {
        label: 'Attendance',
        href: '/attendance',
        icon: Clock,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
      {
        label: 'Leaves',
        href: '/leaves',
        icon: CalendarDays,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
    ],
  },
  {
    label: 'PAYROLL',
    items: [
      {
        label: 'Employee Salary',
        href: '/payroll/salary',
        icon: Wallet,
        roles: ['super_admin', 'hr_admin'],
      },
      {
        label: 'Payslip',
        href: '/payroll/payslip',
        icon: Receipt,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
      {
        label: 'Expenses',
        href: '/payroll/expenses',
        icon: CreditCard,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
      {
        label: 'Provident Fund',
        href: '/payroll/provident',
        icon: PiggyBank,
        roles: ['super_admin', 'hr_admin'],
      },
    ],
  },
  {
    label: 'RECRUITMENT',
    items: [
      { label: 'Jobs', href: '/recruitment/jobs', icon: Briefcase, roles: ['super_admin', 'hr_admin'] },
      {
        label: 'Candidates',
        href: '/recruitment/candidates',
        icon: UserSearch,
        roles: ['super_admin', 'hr_admin'],
      },
      {
        label: 'Referrals',
        href: '/recruitment/referrals',
        icon: UserPlus,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
    ],
  },
  {
    label: 'SUPPORT',
    items: [
      {
        label: 'Tickets',
        href: '/tickets',
        icon: Ticket,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      {
        label: 'All Reports',
        href: '/reports',
        icon: BarChart3,
        roles: ['super_admin', 'hr_admin'],
      },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      {
        label: 'Company Settings',
        href: '/settings',
        icon: Settings,
        roles: ['super_admin'],
      },
      {
        label: 'Roles & Permissions',
        href: '/settings',
        icon: Shield,
        roles: ['super_admin'],
      },
      {
        label: 'Users',
        href: '/settings',
        icon: Users,
        roles: ['super_admin'],
      },
    ],
  },
]

export function getNavSectionsForRole(role: UserRole): NavSectionConfig[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0)
}
