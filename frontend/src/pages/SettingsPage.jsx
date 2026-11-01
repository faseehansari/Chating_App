
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Check,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: "light",
      label: "Light Mode",
      description: "Use the light appearance.",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark Mode",
      description: "Use the dark appearance.",
      icon: Moon,
    },
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-3">
            <Settings
              size={25}
              className="text-[var(--primary)]"
            />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Settings
            </h1>
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            Customize your ChatApp experience.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Monitor
                size={21}
                className="text-[var(--primary)]"
              />

              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Appearance
              </h2>
            </div>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Choose how ChatApp looks on your device.
            </p>
          </div>

          <div className="space-y-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--border-focus)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)]">
                      <Icon
                        size={21}
                        className="text-[var(--primary)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        {option.label}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)]">
                    {isSelected && (
                      <Check
                        size={15}
                        className="text-[var(--primary)]"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-[var(--surface-hover)] p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Current theme:{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
