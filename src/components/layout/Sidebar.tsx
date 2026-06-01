import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../utils/cn";
import logo from "../../assets/logo.svg";
import { NavItem } from "./NavItem";
import { UserAvatar } from "./UserAvatar";
import { useSidebarViewModel } from "./Sidebar.viewmodel";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sections, user, roleLabel } =
    useSidebarViewModel();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-white/10 bg-sidebar-bg transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/10",
          sidebarCollapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {sidebarCollapsed ? (
          <img src={logo} alt="SmartHR" className="h-8 w-8 rounded-md" />
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logo}
                alt=""
                className="h-8 w-8 shrink-0 rounded-md"
                aria-hidden="true"
              />
              <span className="truncate text-lg font-semibold text-sidebar-active">
                SmartHR
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-sidebar-text transition-colors hover:bg-white/10 hover:text-sidebar-active"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex justify-center border-b border-white/10 py-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-sidebar-text transition-colors hover:bg-white/10 hover:text-sidebar-active"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto bg-sidebar-bg px-2 py-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-4 last:mb-0">
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-sidebar-text opacity-80">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={`${section.label}-${item.label}`}>
                  <NavItem
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    collapsed={sidebarCollapsed}
                    end={item.end}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-t border-white/10",
            sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4",
          )}
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-active">
                {user.name}
              </p>
              <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-sidebar-text">
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
