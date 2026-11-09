import React from "react";
import { observer } from "mobx-react-lite";
import { themeStore } from "../../store/theme_store";

const Sun = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const Moon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// Переключатель светлой/тёмной темы
export const ThemeToggle: React.FC = observer(() => {
  const [isHover, setIsHover] = React.useState(false);
  const isDark = themeStore.isDark;
  return (
    <div
      role="button"
      title={isDark ? "Светлая тема" : "Тёмная тема"}
      onClick={themeStore.toggle}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 12px",
        borderRadius: 6,
        cursor: "pointer",
        userSelect: "none",
        fontFamily: "system-ui",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--tx-oklch-37-2-0-044-257-287)",
        background: isHover ? "var(--bg-f8fafc)" : "var(--bg-fff)",
        border: `1px solid ${isHover ? "var(--bd-cbd5e1)" : "var(--bd-e2e8f1)"}`,
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      {isDark ? <Sun /> : <Moon />}
      {isDark ? "Светлая" : "Тёмная"}
    </div>
  );
});
