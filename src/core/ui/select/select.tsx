import React from "react";

export enum CoreInputType {
  small = "small",
  default = "default",
  big = "big",
}

export type SelectOption = {
  label: string;
  value: string;
};

const colors = {
  border: "var(--bd-e2e8f1)",
  borderHover: "var(--bd-cbd5e1)",
  borderActive: "oklch(20.8% 0.042 265.755)",
  text: "var(--tx-oklch-37-2-0-044-257-287)",
  muted: "var(--tx-8fa1b9)",
  hover: "var(--bg-f8fafc)",
  selected: "var(--bg-f1f5f9)",
};

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      flexShrink: 0,
      color: colors.muted,
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.18s",
    }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Check: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const Select: React.FC<{
  style?: React.CSSProperties;
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: CoreInputType;
}> = ({
  style,
  label = "Выберите",
  options,
  value,
  onChange,
  placeholder,
  type,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHover, setIsHover] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const isSmall = type === CoreInputType.small;
  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      style={Object.assign(
        {
          position: "relative",
          fontFamily: "system-ui",
          height: isSmall ? 36 : 46,
          flexShrink: 0,
        },
        style,
      )}
    >
      <div
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: isSmall ? 100 : 160,
          paddingLeft: 14,
          paddingRight: 12,
          background: "var(--bg-fff)",
          borderRadius: 6,
          cursor: "pointer",
          userSelect: "none",
          border: `1px solid ${
            isOpen
              ? colors.borderActive
              : isHover
                ? colors.borderHover
                : colors.border
          }`,
          boxShadow: isOpen ? "0 0 0 3px rgba(15, 23, 42, 0.06)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {label ? (
            <span
              style={{
                fontSize: isSmall ? 9 : 11,
                lineHeight: 1.2,
                color: colors.muted,
              }}
            >
              {label}
            </span>
          ) : null}
          <span
            style={{
              fontSize: isSmall ? 13 : 15,
              fontWeight: 500,
              lineHeight: 1.3,
              color: selected ? colors.text : colors.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {selected ? selected.label : (placeholder ?? "Выбрать поле")}
          </span>
        </div>
        <Chevron open={isOpen} />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "100%",
            width: "max-content",
            maxHeight: 320,
            overflowY: "auto",
            boxSizing: "border-box",
            padding: 4,
            background: "var(--bg-fff)",
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            boxShadow:
              "0 10px 24px -6px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.06)",
            zIndex: 20,
          }}
        >
          {options.length === 0 ? (
            <div
              style={{
                padding: "10px 12px",
                fontSize: 14,
                color: colors.muted,
              }}
            >
              Нет вариантов
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange?.(opt.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background = "transparent";
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "9px 12px",
                    borderRadius: 5,
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                    color: colors.text,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    background: isSelected ? colors.selected : "transparent",
                  }}
                >
                  {opt.label}
                  {isSelected ? <Check /> : <span style={{ width: 16 }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
