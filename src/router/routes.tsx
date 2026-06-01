import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { useAuthStore } from '../store/authStore'
import { EmailVerificationPage } from '../pages/Auth/EmailVerificationPage'
import { ForgotPasswordPage } from '../pages/Auth/ForgotPasswordPage'
import { LoginPage } from '../pages/Auth/LoginPage'
import { RegisterPage } from '../pages/Auth/RegisterPage'
import { ResetPasswordPage } from '../pages/Auth/ResetPasswordPage'
import { TwoFactorPage } from '../pages/Auth/TwoFactorPage'
import { AttendancePage } from '../pages/Attendance/AttendancePage'
import { DashboardPage } from '../pages/Dashboard/DashboardPage'
import { DepartmentsPage } from '../pages/Departments/DepartmentsPage'
import { DesignationsPage } from '../pages/Designations/DesignationsPage'
import { EmployeeDetailPage } from '../pages/Employees/EmployeeDetailPage'
import { EmployeesPage } from '../pages/Employees/EmployeesPage'
import { LeavesPage } from '../pages/Leaves/LeavesPage'
import { NotFoundPage } from '../pages/NotFound/NotFoundPage'
import { OrgChartPage } from '../pages/OrgChart/OrgChartPage'
import { EmployeeSalaryPage } from '../pages/Payroll/EmployeeSalaryPage'
import { BankAccountsPage } from '../pages/Payroll/BankAccountsPage'
import { ExpensesPage } from '../pages/Payroll/ExpensesPage'
import { PayslipPage } from '../pages/Payroll/PayslipPage'
import { ProvidentFundPage } from '../pages/Payroll/ProvidentFundPage'
import { CandidatesPage } from '../pages/Recruitment/CandidatesPage'
import { JobsPage } from '../pages/Recruitment/JobsPage'
import { ReferralsPage } from '../pages/Recruitment/ReferralsPage'
import { ReportsPage } from '../pages/Reports/ReportsPage'
import { CompanySettingsPage } from '../pages/Settings/CompanySettingsPage'
import { CompaniesPage } from '../pages/Settings/CompaniesPage'
import { RolesPermissionsPage } from '../pages/Settings/RolesPermissionsPage'
import { SettingsPage } from '../pages/Settings/SettingsPage'
import { UsersPage } from '../pages/Settings/UsersPage'
import { TicketDetailPage } from '../pages/Tickets/TicketDetailPage'
import { TicketsPage } from '../pages/Tickets/TicketsPage'
import { ProjectsPage } from '../pages/Projects/ProjectsPage'
import { ProjectDetailPage } from '../pages/Projects/ProjectDetailPage'
import { TasksPage } from '../pages/Projects/TasksPage'
import { PermissionGuard } from './PermissionGuard'
import { PlatformOnlyRoute } from './PlatformOnlyRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicAuthRoute } from './PublicAuthRoute'
import { RoleGuard } from './RoleGuard'

function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <PlatformOnlyRoute>
              <RegisterPage />
            </PlatformOnlyRoute>
          </PublicAuthRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/2fa" element={<TwoFactorPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route element={<PermissionGuard module="dashboard" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route element={<PermissionGuard module="employees" />}>
              <Route path="/employees" element={<EmployeesPage />} />
            </Route>
            <Route element={<PermissionGuard module="departments" />}>
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/designations" element={<DesignationsPage />} />
            </Route>
          </Route>

          <Route element={<PermissionGuard module="employees" />}>
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/org-chart" element={<OrgChartPage />} />
          </Route>

          <Route element={<PermissionGuard module="attendance" />}>
            <Route path="/attendance" element={<AttendancePage />} />
          </Route>

          <Route element={<PermissionGuard module="leaves" />}>
            <Route path="/leaves" element={<LeavesPage />} />
          </Route>

          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route element={<PermissionGuard module="payroll" />}>
              <Route path="/payroll/salary" element={<EmployeeSalaryPage />} />
              <Route path="/payroll/provident" element={<ProvidentFundPage />} />
            </Route>
          </Route>

          <Route element={<PermissionGuard module="payroll" />}>
            <Route path="/payroll/payslip" element={<PayslipPage />} />
          </Route>

          <Route element={<PermissionGuard module="expenses" />}>
            <Route path="/payroll/expenses" element={<ExpensesPage />} />
          </Route>

          <Route element={<PermissionGuard module="bank_accounts" />}>
            <Route path="/payroll/bank-accounts" element={<BankAccountsPage />} />
          </Route>

          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route element={<PermissionGuard module="recruitment" />}>
              <Route path="/recruitment/jobs" element={<JobsPage />} />
              <Route path="/recruitment/candidates" element={<CandidatesPage />} />
            </Route>
          </Route>

          <Route element={<PermissionGuard module="recruitment" />}>
            <Route path="/recruitment/referrals" element={<ReferralsPage />} />
          </Route>

          <Route element={<PermissionGuard module="tickets" />}>
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Route>

          <Route element={<PermissionGuard module="projects" />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>

          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route element={<PermissionGuard module="reports" />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          <Route element={<RoleGuard roles={['super_admin']} />}>
            <Route element={<PermissionGuard module="settings" />}>
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/settings/companies"
                element={
                  <PlatformOnlyRoute redirectTo="/settings/companies">
                    <CompaniesPage />
                  </PlatformOnlyRoute>
                }
              />
              <Route path="/settings/company" element={<CompanySettingsPage />} />
              <Route path="/settings/roles" element={<RolesPermissionsPage />} />
              <Route path="/settings/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
