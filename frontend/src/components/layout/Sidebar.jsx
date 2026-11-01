
import {
  MessageCircle,
  Users,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "users", label: "Users", icon: Users },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ activeSection, onSectionChange }) => {
  const { logout } = useAuth();

  const renderNavigationButton = (item, mobile = false) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <button
        key={item.id}
        type="button"
        title={item.label}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={() => onSectionChange(item.id)}
        className={`flex items-center justify-center transition-colors ${
          mobile
            ? `min-w-0 flex-1 flex-col gap-1 rounded-xl px-2 py-2 ${
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)]"
              }`
            : `h-11 w-11 rounded-xl ${
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              }`
        }`}
      >
        <Icon size={21} />
        {mobile && (
          <span className="text-xs font-medium">{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden min-h-0 w-16 shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--surface)] py-5 md:flex">
        <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
          <MessageCircle size={23} className="text-[var(--primary)]" />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-4">
          {navigationItems.map((item) =>
            renderNavigationButton(item)
          )}
        </nav>

        <button
          type="button"
          onClick={logout}
          title="Logout"
          aria-label="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--error)] transition-colors hover:bg-[var(--surface-hover)]"
        >
          <LogOut size={21} />
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="z-20 flex shrink-0 items-center justify-around border-t border-[var(--border)] bg-[var(--surface)] px-2 py-2 md:hidden">
        {navigationItems.map((item) =>
          renderNavigationButton(item, true)
        )}

        <button
          type="button"
          onClick={logout}
          title="Logout"
          aria-label="Logout"
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[var(--error)]"
        >
          <LogOut size={21} />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
