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
import { EmployeeSalaryPage } from '../pages/Payroll/EmployeeSalaryPage'
import { ExpensesPage } from '../pages/Payroll/ExpensesPage'
import { PayslipPage } from '../pages/Payroll/PayslipPage'
import { ProvidentFundPage } from '../pages/Payroll/ProvidentFundPage'
import { CandidatesPage } from '../pages/Recruitment/CandidatesPage'
import { JobsPage } from '../pages/Recruitment/JobsPage'
import { ReferralsPage } from '../pages/Recruitment/ReferralsPage'
import { ReportsPage } from '../pages/Reports/ReportsPage'
import { SettingsPage } from '../pages/Settings/SettingsPage'
import { TicketDetailPage } from '../pages/Tickets/TicketDetailPage'
import { TicketsPage } from '../pages/Tickets/TicketsPage'
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
            <RegisterPage />
          </PublicAuthRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/2fa" element={<TwoFactorPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/designations" element={<DesignationsPage />} />
          </Route>
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leaves" element={<LeavesPage />} />
          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route path="/payroll/salary" element={<EmployeeSalaryPage />} />
            <Route path="/payroll/provident" element={<ProvidentFundPage />} />
          </Route>
          <Route path="/payroll/payslip" element={<PayslipPage />} />
          <Route path="/payroll/expenses" element={<ExpensesPage />} />
          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route path="/recruitment/jobs" element={<JobsPage />} />
            <Route path="/recruitment/candidates" element={<CandidatesPage />} />
          </Route>
          <Route path="/recruitment/referrals" element={<ReferralsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route element={<RoleGuard roles={['super_admin', 'hr_admin']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route element={<RoleGuard roles={['super_admin']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
