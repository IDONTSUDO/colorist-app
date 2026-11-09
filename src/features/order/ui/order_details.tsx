import { observer } from "mobx-react-lite";
import React from "react";
import { PAINT_CONSISTENCY_OPTIONS } from "../../orders/paint_consistency";
import type { OrderStore } from "../order_store";
import { ClientForm } from "./client";
import { OrderForm } from "./order_form";

// Вкладка «Заказ»: карточки «Автомобиль и краска», «Клиент», «Производство»

const STATUSES: { value: string; color: string; bg: string }[] = [
  { value: "Начат", color: "#4f46e5", bg: "#eef2ff" },
  { value: "На паузе", color: "#b45309", bg: "#fef3c7" },
  { value: "Готов", color: "#15803d", bg: "#dcfce7" },
];

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#4a5568",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const Card: React.FC<{
  title: string;
  hint?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, hint, children, style }) => (
  <section
    style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: 24,
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
      minWidth: 0,
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        marginBottom: 20,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: "#1a202c",
        }}
      >
        {title}
      </h3>
      {hint ? (
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{hint}</span>
      ) : (
        <></>
      )}
    </div>
    {children}
  </section>
);

// группа кнопок-переключателей (как сегменты)
const Segmented: React.FC<{
  options: { value: string; color?: string; bg?: string }[];
  value?: string | null;
  onChange: (value: string) => void;
}> = ({ options, value, onChange }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {options.map((o) => {
      const active = value === o.value;
      const color = o.color ?? "#4f46e5";
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            flex: "1 1 0",
            minWidth: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            border: "1px solid",
            borderColor: active ? color : "#cbd5e1",
            backgroundColor: active ? (o.bg ?? color) : "#ffffff",
            color: active ? (o.bg ? color : "#ffffff") : "#4a5568",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {o.bg ? (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                opacity: active ? 1 : 0.5,
              }}
            />
          ) : (
            <></>
          )}
          {o.value}
        </button>
      );
    })}
  </div>
);

export const OrderDetails: React.FC<{ store: OrderStore }> = observer(
  ({ store }) => {
    const vm = store.viewModel;
    return (
      <div style={{ maxWidth: 1280 }}>
        <div
          style={{
            display: "flex",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          <Card title="Автомобиль и краска">
            <OrderForm orderViewModel={vm} bare />
          </Card>
          <Card title="Клиент">
            <ClientForm orderViewModel={store.client} bare />
          </Card>
          <Card title="Производство" style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={labelStyle}>Статус</label>
                <Segmented
                  options={STATUSES}
                  value={vm.statusOrder}
                  onChange={(value) => store.updateOrderStatus(value)}
                />
                {vm.readyAt ? (
                  <div style={{ fontSize: 13, color: "#15803d" }}>
                    Готов {new Date(vm.readyAt).toLocaleString()}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={labelStyle}>
                  Тип краски{" "}
                  <span
                    style={{
                      textTransform: "none",
                      fontWeight: 400,
                      color: "#94a3b8",
                      letterSpacing: 0,
                    }}
                  >
                    необязательно
                  </span>
                </label>
                <Segmented
                  options={PAINT_CONSISTENCY_OPTIONS.map((value) => ({
                    value,
                  }))}
                  value={vm.paintConsistency}
                  onChange={(value) => {
                    // повторное нажатие снимает выбор — поле необязательное
                    store.updateForm({
                      paintConsistency:
                        vm.paintConsistency === value ? null : value,
                    });
                    store.updateOrder();
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <button
            type="button"
            onClick={() => store.resetOrderModalShow()}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid #fecaca",
              backgroundColor: "#ffffff",
              color: "#dc2626",
              cursor: "pointer",
            }}
          >
            Сбросить заказ
          </button>
        </div>
      </div>
    );
  },
);
