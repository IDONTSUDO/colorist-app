import * as React from "react";

export enum CoreInputType {
  small = "small",
  default = "default",
  big = "big",
}

export type SelectOption = {
  label: string;
  value: string;
};

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
  label = "Выбирите",
  options,
  value,
  onChange,
  placeholder,
  type,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const isSmall = type !== undefined && type === CoreInputType.small;

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
        { position: "relative", fontFamily: "system-ui" },

        style,
      )}
    >
      {/* Trigger */}
      <div
        onClick={() => setIsOpen((v) => !v)}
        style={{
          backgroundColor: "#F5F5F5",
          height: isSmall ? 40 : 58,
          // borderRadius: "4px 4px 0 0",
          // borderBottom: "1.5px solid #000",
          border: "1px solid",
          padding: "0 10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: isSmall ? 8 : 11,
            color: "#666",
            marginBottom: 2,
          }}
        >
          {label}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: isSmall ? 12 : 16,
              color: selected ? "#000" : "#999",
            }}
          >
            {selected ? selected.label : (placeholder ?? "Выберите")}
          </span>
          <span
            style={{
              fontSize: 18,
              color: "#000",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.18s",
              lineHeight: 1,
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            width: "max-content",
            right: 0,
            background: "#fff",
            border: "1px solid #000",
            borderRadius: "0 0 4px 4px",
            zIndex: 10,
          }}
        >
          {options.map((opt, i) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange?.(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: "12px 10px",
                fontSize: 15,
                // width: "max-content",
                fontFamily: "system-ui",
                cursor: "pointer",
                width: "100%",
                color: opt.value === value ? "#fff" : "#000",
                background: opt.value === value ? "#000" : "transparent",
                borderBottom:
                  i < options.length - 1 ? "0.5px solid #e0e0e0" : "none",
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#F5F5F5";
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value)
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
