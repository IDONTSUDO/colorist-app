import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderTabsStore } from "../order_tabs_store";
import { OrdersPath } from "../../orders/orders";

const OrderPath = "/order";

// Полоса вкладок открытых заказов над экраном заказа
export const OrderTabs = observer(({ activeId }: { activeId: number }) => {
  const navigate = useNavigate();
  const [dragId, setDragId] = useState<number | undefined>();
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  const go = (id: number) => navigate(OrderPath + "/" + id);

  const close = (id: number) => {
    const next = orderTabsStore.close(id);
    if (id !== activeId) return;
    if (next !== undefined) go(next);
    else navigate(OrdersPath);
  };

  const openByNumber = () => {
    const n = Number(value.trim());
    setAdding(false);
    setValue("");
    if (!Number.isInteger(n) || n <= 0) return;
    orderTabsStore.open(n, activeId);
    go(n);
  };

  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        padding: "0 20px",
        overflowX: "auto",
        overflowY: "hidden",
        boxSizing: "border-box",
      }}
    >
      {orderTabsStore.tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            draggable
            title={`Заказ №${tab.id}`}
            onDragStart={() => setDragId(tab.id)}
            onDragEnd={() => setDragId(undefined)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragId !== undefined) orderTabsStore.move(dragId, tab.id);
            }}
            onClick={() => !active && go(tab.id)}
            onAuxClick={(e) => {
              // средняя кнопка мыши закрывает вкладку, как в браузере
              if (e.button === 1) {
                e.preventDefault();
                close(tab.id);
              }
            }}
            onMouseDown={(e) => e.button === 1 && e.preventDefault()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 36,
              minWidth: 90,
              maxWidth: 220,
              padding: "0 8px 0 12px",
              borderRadius: "8px 8px 0 0",
              cursor: active ? "default" : "pointer",
              userSelect: "none",
              flexShrink: 0,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              backgroundColor: active ? "#ffffff" : "#e2e8f0",
              color: active ? "#1a202c" : "#4a5568",
              borderTop: active ? "2px solid #4f46e5" : "2px solid transparent",
              opacity: dragId === tab.id ? 0.5 : 1,
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              №{tab.id}
            </span>
            <span
              role="button"
              title="Закрыть вкладку"
              onClick={(e) => {
                e.stopPropagation();
                close(tab.id);
              }}
              style={{
                width: 18,
                height: 18,
                lineHeight: "18px",
                textAlign: "center",
                borderRadius: 4,
                fontSize: 14,
                color: "#718096",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#cbd5e1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              ×
            </span>
          </div>
        );
      })}
      {adding ? (
        <input
          autoFocus
          inputMode="numeric"
          placeholder="№ заказа"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") openByNumber();
            if (e.key === "Escape") {
              setAdding(false);
              setValue("");
            }
          }}
          onBlur={() => (value ? openByNumber() : setAdding(false))}
          style={{
            width: 100,
            height: 30,
            marginBottom: 3,
            padding: "0 8px",
            fontSize: 13,
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          role="button"
          title="Открыть заказ в новой вкладке"
          onClick={() => setAdding(true)}
          style={{
            width: 30,
            height: 30,
            marginBottom: 3,
            lineHeight: "30px",
            textAlign: "center",
            borderRadius: 6,
            fontSize: 18,
            color: "#4a5568",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          +
        </div>
      )}
    </div>
  );
});
