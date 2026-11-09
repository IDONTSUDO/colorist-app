import React from "react";
import { observer } from "mobx-react-lite";
import { CrudFormLocalDbStore, CrudFormStore } from "../../store/base_store";

const colors = {
  border: "var(--bd-e2e8f1)",
  borderHover: "var(--bd-cbd5e1)",
  text: "var(--tx-oklch-37-2-0-044-257-287)",
  muted: "var(--tx-8fa1b9)",
  active: "oklch(20.8% 0.042 265.755)",
  hover: "var(--bg-f8fafc)",
};

// Номера страниц с многоточиями: 1 … 4 5 6 … 20
const getPages = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) pages.push("…");
  for (let p = from; p <= to; p++) pages.push(p);
  if (to < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

const PageButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
}> = ({ children, onClick, isActive = false, disabled = false, title }) => {
  const [isHover, setIsHover] = React.useState(false);
  const hover = isHover && !disabled && !isActive;
  return (
    <div
      title={title}
      onClick={() => {
        if (!disabled && !isActive) onClick?.();
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        minWidth: 34,
        height: 34,
        boxSizing: "border-box",
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        border: `1px solid ${
          isActive ? colors.active : hover ? colors.borderHover : colors.border
        }`,
        background: isActive ? colors.active : hover ? colors.hover : "var(--bg-fff)",
        color: isActive ? "#fff" : disabled ? colors.border : colors.text,
        fontFamily: "system-ui",
        fontSize: 14,
        fontWeight: isActive ? 600 : 500,
        cursor: disabled ? "default" : isActive ? "default" : "pointer",
        userSelect: "none",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      {children}
    </div>
  );
};

const Arrow: React.FC<{ dir: "left" | "right" }> = ({ dir }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
  </svg>
);

export const Pagination: React.FC<{
  store: CrudFormStore<any, any> | CrudFormLocalDbStore<any, any>;
}> = observer(({ store }) => {
  const total = store.page?.totalPages ?? 0;
  const current = store.page?.currentPage ?? 1;
  const totalCount = store.page?.totalCount;

  if (total === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        paddingTop: 10,
        fontFamily: "system-ui",
      }}
    >
      <div style={{ fontSize: 13, color: colors.muted }}>
        {totalCount !== undefined ? `Всего записей: ${totalCount}` : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PageButton
          title="Предыдущая"
          disabled={current <= 1}
          onClick={() => store.prevPage()}
        >
          <Arrow dir="left" />
        </PageButton>

        {getPages(current, total).map((p, i) =>
          p === "…" ? (
            <div
              key={`dots-${i}`}
              style={{ minWidth: 20, textAlign: "center", color: colors.muted }}
            >
              …
            </div>
          ) : (
            <PageButton
              key={p}
              isActive={p === current}
              onClick={() => store.selectPage(p)}
            >
              {p}
            </PageButton>
          ),
        )}

        <PageButton
          title="Следующая"
          disabled={current >= total}
          onClick={() => store.nextPage()}
        >
          <Arrow dir="right" />
        </PageButton>
      </div>

      <div style={{ fontSize: 13, color: colors.muted, textAlign: "right" }}>
        {`Страница ${current} из ${total}`}
      </div>
    </div>
  );
});
