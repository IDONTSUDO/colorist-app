import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../core/helper/use_store";
import { clientFullName, ReportsStore } from "./reports_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Calendar } from "../../core/ui/callendar/callendar";
import { InputV3 } from "../../core/ui/input/input_v3";
import { Button, ButtonType } from "../../core/ui/button/Button";
import { TextV2 } from "../../core/ui/text/text";
import { OrderPath } from "../order/order";

export const ReportsPath = "/reports";

const border = "1px solid oklch(92.9% 0.013 255.508)";
const muted = "#8fa1b9";

const formatDate = (d: Date | number) =>
  new Date(d).toLocaleDateString("ru-RU");

const formatPhone = (phone?: string) => (phone ? phone.phoneMapper() : "");

export const Reports = observer(() => {
  const store = useStore(ReportsStore);
  const navigate = useNavigate();
  const report = store.report;

  return (
    <CrudPage
      feature={ReportsPath}
      pageName="Отчеты"
      // CrudPage only touches modal/loading fields when isNeedTable=false
      store={store as any}
      isNeedTable={false}
      body={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            paddingBottom: 40,
          }}
        >
          <div style={{ ...card, maxWidth: 680 }}>
            <TextV2 style={{ fontSize: 18 }} text="Заказы клиента за период" />
            <div style={{ height: 16 }} />

            <TextV2 color={muted} text="1. Клиент" />
            <div style={{ height: 6 }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <InputV3
                  style={{ width: "100%", height: 46 }}
                  placeHolderType=""
                  placeholder="ФИО или телефон"
                  value={store.clientQuery}
                  onChange={(text) => store.setClientQuery(text)}
                />
                {store.clientQuery && (
                  <Button text="✕" onClick={() => store.clearClient()} />
                )}
              </div>
              {store.clientMatches.length > 0 && (
                <div style={dropdown}>
                  {store.clientMatches.map((client) => (
                    <div
                      key={client.id}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: border,
                      }}
                      onClick={() => store.selectClient(client)}
                    >
                      <div>{clientFullName(client) || "Без имени"}</div>
                      <div style={{ color: muted, fontSize: 13 }}>
                        {formatPhone(client.numberPhone)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {store.clientQuery.trim() &&
                !store.selectedClient &&
                store.clientMatches.length === 0 && (
                  <div style={{ color: muted, marginTop: 6 }}>
                    Клиенты не найдены
                  </div>
                )}
            </div>
            {store.selectedClient && (
              <div style={{ color: muted, marginTop: 6 }}>
                Выбран: {clientFullName(store.selectedClient)},{" "}
                {formatPhone(store.selectedClient.numberPhone)}
              </div>
            )}

            <div style={{ height: 20 }} />
            <TextV2 color={muted} text="2. Период" />
            <div style={{ height: 6 }} />
            <Calendar value={store.range} onChange={store.setRange} />

            <div style={{ height: 20 }} />
            <Button
              text={store.isLoading ? "Формирование..." : "Сформировать отчет"}
              type={
                store.selectedClient && store.range.startDate
                  ? ButtonType.gray
                  : ButtonType.default
              }
              style={{ width: "max-content" }}
              onClick={() => {
                if (!store.isLoading) store.createReport();
              }}
            />
          </div>

          {report && (
            <div style={card}>
              <TextV2
                style={{ fontSize: 18 }}
                text={`Отчет: ${clientFullName(report.client)}`}
              />
              <div style={{ color: muted, marginTop: 4 }}>
                {formatPhone(report.client.numberPhone)} · период{" "}
                {formatDate(report.startDate)} — {formatDate(report.endDate)} ·
                заказов: {report.orders.length}
              </div>
              <div style={{ height: 16 }} />
              {report.orders.length === 0 ? (
                <div style={{ color: muted }}>
                  За выбранный период заказов нет
                </div>
              ) : (
                <div style={{ overflowX: "auto", border, borderRadius: 6 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "Дата",
                          "Авто",
                          "Код краски",
                          "Цвет",
                          "Объем",
                          "Статус",
                          "Оплата",
                          "",
                        ].map((h) => (
                          <th key={h} style={th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.orders.map((order) => (
                        <tr key={order.id}>
                          <td style={td}>
                            {formatDate(order.createdAt ?? order.orderCreate)}
                          </td>
                          <td style={td}>{order.auto || "—"}</td>
                          <td style={td}>{order.codePaint || "—"}</td>
                          <td style={td}>{order.color || "—"}</td>
                          <td style={td}>
                            {order.theVolumeOfPainTheCustomerWant || "—"}
                          </td>
                          <td style={td}>{order.statusOrder}</td>
                          <td style={td}>{order.financeStatus}</td>
                          <td style={td}>
                            <span
                              style={{
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                navigate(OrderPath + "/" + order.id)
                              }
                            >
                              открыть
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      }
    />
  );
});

const card: React.CSSProperties = {
  border,
  borderRadius: 8,
  padding: 20,
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  background: "#fff",
  border,
  borderRadius: 6,
  marginTop: 4,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  maxHeight: 320,
  overflowY: "auto",
};

const th: React.CSSProperties = {
  textAlign: "left",
  backgroundColor: "#000",
  color: "#fff",
  padding: "8px 10px",
  fontSize: 14,
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: border,
  fontSize: 14,
};
