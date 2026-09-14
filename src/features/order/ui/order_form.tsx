import React, { useState } from "react";
import type { OrderViewModel } from "../../orders/orders_db_model";
import { observer } from "mobx-react-lite";

// Описываем интерфейс для состояния формы
interface OrderFormData {
  auto: string;
  color: string;
  paintCode: string;
  volume: string;
}

export const OrderForm: React.FC<{ orderViewModel: OrderViewModel }> = observer(
  ({ orderViewModel }) => {
    // Инициализируем состояние значениями по умолчанию (как на скриншоте)
    const [formData, setFormData] = useState<OrderFormData>({
      auto: orderViewModel.auto,
      color: orderViewModel.color,
      paintCode: orderViewModel.codePaint,
      volume: orderViewModel.theVolumeOfPainTheCustomerWant.toString(),
    });

    // Состояние фокуса для каждого поля, чтобы сделать красивую обводку
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Базовые стили для инпутов
    const getInputStyle = (fieldName: string): React.CSSProperties => ({
      width: "100%",
      padding: fieldName === "volume" ? "10px 36px 10px 12px" : "10px 12px",
      fontSize: "15px",
      border: "1px solid",
      borderColor: focusedField === fieldName ? "#4f46e5" : "#cbd5e1",
      borderRadius: "6px",
      backgroundColor: "#ffffff",
      color: "#1a202c",
      outline: "none",
      boxSizing: "border-box",
      boxShadow:
        focusedField === fieldName
          ? "0 0 0 3px rgba(79, 70, 229, 0.1)"
          : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
    });

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          backgroundColor: "#fafafa",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Поле: Авто */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Авто
          </label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              name="auto"
              value={formData.auto}
              onChange={handleChange}
              onFocus={() => setFocusedField("auto")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("auto")}
              placeholder="Марка, модель..."
            />
          </div>
        </div>

        {/* Поле: Цвет */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Цвет
          </label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              onFocus={() => setFocusedField("color")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("color")}
              placeholder="Код или название цвета..."
            />
          </div>
        </div>

        {/* Поле: Код краски */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Код краски
          </label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              name="paintCode"
              value={formData.paintCode}
              onChange={handleChange}
              onFocus={() => setFocusedField("paintCode")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("paintCode")}
              placeholder="Заводской код..."
            />
          </div>
        </div>

        {/* Поле: Объем краски для клиента */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#4a5568",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Объем краски для клиента
          </label>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="number"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
              onFocus={() => setFocusedField("volume")}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle("volume")}
              placeholder="0"
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                color: "#a0aec0",
                fontSize: "14px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              мл
            </span>
          </div>
        </div>
      </div>
    );
  },
);
