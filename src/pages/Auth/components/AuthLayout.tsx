import { BarChart3, ShieldCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import authIllustration from '../../../assets/auth-illustration.svg'
import logo from '../../../assets/logo.svg'

interface AuthLayoutProps {
  children: ReactNode
}

const highlights = [
  { icon: Users, text: 'Centralized employee records' },
  { icon: BarChart3, text: 'Real-time HR analytics' },
  { icon: ShieldCheck, text: 'Secure role-based access' },
]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[42%] flex-col overflow-hidden bg-navy lg:flex">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col p-10 xl:p-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-11 w-11 rounded-lg shadow-lg" aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight text-white">SmartHR</span>
          </div>

          <div className="my-auto py-10">
            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem]">
              Manage your workforce with confidence
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-sidebar-text">
              Streamline HR operations, attendance, payroll, and employee records in one
              unified platform.
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sidebar-text">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
                  </span>
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-auto">
            <img
              src={authIllustration}
              alt=""
              className="mx-auto w-full max-w-md opacity-95"
              aria-hidden="true"
            />
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-1 flex-col bg-base">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-6 py-4 lg:hidden">
          <img src={logo} alt="" className="h-9 w-9 rounded-lg" aria-hidden="true" />
          <span className="text-lg font-bold text-primary">SmartHR</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  )
}
