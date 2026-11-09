import React from "react";

// Тип краски в заказе (необязательно): готовая к нанесению или густая
export const PAINT_CONSISTENCY_OPTIONS = ["Готовая", "Густая"] as const;

export const PaintConsistencyPicker: React.FC<{
  value?: string | null;
  onChange: (value: string | null) => void;
}> = ({ value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568" }}>
      Тип краски (необязательно)
    </label>
    <div style={{ display: "flex", gap: 8 }}>
      {PAINT_CONSISTENCY_OPTIONS.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            title={active ? "нажмите ещё раз, чтобы снять выбор" : undefined}
            // повторное нажатие снимает выбор — поле необязательное
            onClick={() => onChange(active ? null : option)}
            style={{
              flex: 1,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 6,
              border: "1px solid",
              borderColor: active ? "#4f46e5" : "#cbd5e1",
              backgroundColor: active ? "#4f46e5" : "#ffffff",
              color: active ? "#ffffff" : "#4a5568",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);
