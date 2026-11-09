import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClientsDbRepository } from "./clients_db_repository";
import type { ClientViewModel } from "./clients_db_model";
import { OrdersDbRepository } from "../orders/orders_db_repository";

type ClientInfo = {
  client?: ClientViewModel & { createDate?: number | string };
  ordersCount: number;
};

// репозитории создаём лениво: db из main.tsx на этапе импорта ещё не готова
const loadClient = async (clientId: string | number): Promise<ClientInfo> => {
  const clients = new ClientsDbRepository();
  const client = (await clients.findModel("id", clientId as string)).fold(
    (list) => list.at(0),
    () => undefined,
  );
  const orders = new OrdersDbRepository();
  const ordersCount = await orders.db
    .getRepository(orders.entity)
    .where("client")
    .equals(clientId as any)
    .count()
    .catch(() => 0);
  return { client: client as ClientInfo["client"], ordersCount };
};

const fullName = (c?: ClientViewModel) =>
  c ? [c.family, c.name, c.surName].filter(Boolean).join(" ") : "";

const formatPhone = (phone?: string) => {
  if (!phone) return "—";
  const [code, rest] = String(phone).split(" ");
  return `+7 (${code ?? ""}) ${rest ?? ""}`.trim();
};

const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
    <span style={{ color: "var(--tx-8fa1b9)" }}>{label}</span>
    <span style={{ fontWeight: 500, textAlign: "right" }}>{children}</span>
  </div>
);

/**
 * Ячейка «Клиент»: показывает ФИО, при наведении — карточка с данными клиента,
 * загруженными из базы (каждый раз свежие).
 */
export const ClientHoverCard: React.FC<{ clientId?: string | number }> = ({
  clientId,
}) => {
  const [info, setInfo] = useState<ClientInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();

  const hasClient =
    clientId !== undefined && clientId !== null && clientId !== "";

  // имя в ячейке
  useEffect(() => {
    if (!hasClient) return;
    loadClient(clientId!).then(setInfo).catch(console.error);
  }, [clientId]);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const open = () => {
    if (!hasClient) return;
    window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(async () => {
      setIsOpen(true);
      setIsLoading(true);
      try {
        setInfo(await loadClient(clientId!));
      } finally {
        setIsLoading(false);
      }
    }, 250);
  };
  const close = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setIsOpen(false), 150);
  };

  // позиция карточки: под ячейкой, не вылезая за правый/нижний край экрана
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const cardW = cardRef.current?.offsetWidth ?? 280;
    const cardH = cardRef.current?.offsetHeight ?? 160;
    let left = r.left;
    let top = r.bottom + 8;
    if (left + cardW > window.innerWidth - 12)
      left = Math.max(12, r.right - cardW);
    if (top + cardH > window.innerHeight - 12) top = r.top - cardH - 8;
    setPos({ top, left });
  }, [isOpen, info, isLoading]);

  // при прокрутке таблицы карточку закрываем — иначе она «отстанет» от ячейки
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => setIsOpen(false);
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen]);

  if (!hasClient) return <span style={{ color: "var(--tx-8fa1b9)" }}>—</span>;

  const name = fullName(info?.client);
  const label = info === null ? "…" : name || info.client?.numberPhone || "—";

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={open}
        onMouseLeave={close}
        style={{
          cursor: "default",
          borderBottom: "1px dashed var(--bd-cbd5e1)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {isOpen &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={() => window.clearTimeout(closeTimer.current)}
            onMouseLeave={close}
            style={{
              position: "fixed",
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              zIndex: 1100,
              width: 280,
              boxSizing: "border-box",
              padding: 14,
              borderRadius: 10,
              background: "var(--bg-fff)",
              border: "1px solid var(--bd-e2e8f0)",
              boxShadow:
                "0 12px 28px -8px rgba(15, 23, 42, 0.25), 0 2px 6px rgba(15, 23, 42, 0.08)",
              fontFamily: "system-ui",
              fontSize: 13,
              color: "var(--tx-oklch-37-2-0-044-257-287)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {info?.client === undefined && !isLoading ? (
              <div style={{ color: "var(--tx-8fa1b9)" }}>
                Клиент не найден в базе
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "var(--open-btn-fg)",
                      background: "var(--open-btn-bg)",
                    }}
                  >
                    {(info?.client?.family || info?.client?.name || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--tx-1a202c)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name || "Без имени"}
                    </div>
                    <div style={{ color: "var(--tx-8fa1b9)", fontSize: 12 }}>
                      {isLoading ? "загрузка…" : `клиент №${clientId}`}
                    </div>
                  </div>
                </div>
                <div
                  style={{ height: 1, background: "var(--bg-e2e8f0)" }}
                />
                <Row label="Телефон">
                  {formatPhone(info?.client?.numberPhone)}
                </Row>
                <Row label="Заказов">
                  {info
                    ? `${info.ordersCount} ${plural(info.ordersCount, [
                        "заказ",
                        "заказа",
                        "заказов",
                      ])}`
                    : "—"}
                </Row>
                {info?.client?.createDate ? (
                  <Row label="Клиент с">
                    {new Date(info.client.createDate).toLocaleDateString()}
                  </Row>
                ) : null}
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
