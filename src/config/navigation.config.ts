import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  Clock,
  CreditCard,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  Network,
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
import type { PermissionModule } from '../types/permission.types'
import { getNavPermissionForHref } from './permission-nav.config'

export interface NavItemConfig {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
  /** When true, only active on exact path match (not child routes). */
  end?: boolean
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
        end: true,
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
      {
        label: 'Org Chart',
        href: '/org-chart',
        icon: Network,
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
        label: 'Bank Accounts',
        href: '/payroll/bank-accounts',
        icon: Landmark,
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
    label: 'PROJECTS',
    items: [
      {
        label: 'Projects',
        href: '/projects',
        icon: FolderKanban,
        roles: ['super_admin', 'hr_admin', 'employee'],
      },
      {
        label: 'Tasks',
        href: '/tasks',
        icon: CheckSquare,
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
        label: 'Companies',
        href: '/settings/companies',
        icon: Building2,
        roles: ['super_admin'],
      },
      {
        label: 'Company Settings',
        href: '/settings/company',
        icon: Settings,
        roles: ['super_admin'],
      },
      {
        label: 'Roles & Permissions',
        href: '/settings/roles',
        icon: Shield,
        roles: ['super_admin'],
      },
      {
        label: 'Users',
        href: '/settings/users',
        icon: Users,
        roles: ['super_admin'],
      },
    ],
  },
]

export function getNavSectionsForRole(
  role: UserRole,
  canView: (module: PermissionModule) => boolean = () => true,
): NavSectionConfig[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.roles.includes(role)) return false

      const permission = getNavPermissionForHref(item.href)
      if (!permission) return true

      if (role === 'super_admin') return true
      return canView(permission.module)
    }),
  })).filter((section) => section.items.length > 0)
}
