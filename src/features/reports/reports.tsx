import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../core/helper/use_store";
import { ReportsStore, ReportType, reportTypes } from "./reports_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Calendar } from "../../core/ui/callendar/callendar";
import { Button, ButtonType } from "../../core/ui/button/Button";
import { TextV2 } from "../../core/ui/text/text";
import { OrderPath } from "../order/order";
import { ClientPicker, clientFullName } from "../clients/client_picker";
import { orderDate } from "../orders/orders_db_repository";

export const ReportsPath = "/reports";

const border = "1px solid oklch(92.9% 0.013 255.508)";
const muted = "#8fa1b9";

const formatDate = (d: Date | number) =>
  new Date(d).toLocaleDateString("ru-RU");

const formatPhone = (phone?: string) => (phone ? phone.phoneMapper() : "");

const formatMoney = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " ₽";

type StoreProps = { store: ReportsStore };

export const Reports = observer(() => {
  const store = useStore(ReportsStore);
  const current = reportTypes.find((r) => r.type === store.reportType);

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
          {current === undefined ? (
            <ReportTypePicker store={store} />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Button
                  text="← Другой отчет"
                  style={{ width: "max-content" }}
                  onClick={() => store.backToReportTypes()}
                />
                <TextV2 style={{ fontSize: 18 }} text={current.title} />
              </div>
              {store.reportType === ReportType.clientOrders && (
                <ClientOrdersReportView store={store} />
              )}
              {store.reportType === ReportType.revenue && (
                <RevenueReportView store={store} />
              )}
            </>
          )}
        </div>
      }
    />
  );
});

const ReportTypePicker = observer(({ store }: StoreProps) => (
  <>
    <TextV2 color={muted} text="Выберите вид отчета" />
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {reportTypes.map((r) => (
        <div
          key={r.type}
          role="button"
          tabIndex={0}
          onClick={() => store.selectReportType(r.type)}
          onKeyDown={(e) => e.key === "Enter" && store.selectReportType(r.type)}
          style={{ ...card, width: 300, cursor: "pointer" }}
        >
          <TextV2 style={{ fontSize: 18 }} text={r.title} />
          <div style={{ color: muted, marginTop: 6 }}>{r.description}</div>
        </div>
      ))}
    </div>
  </>
));

const PeriodField = observer(
  ({ store, label }: StoreProps & { label: string }) => (
    <>
      <TextV2 color={muted} text={label} />
      <div style={{ height: 6 }} />
      <Calendar value={store.range} onChange={store.setRange} />
    </>
  ),
);

const SubmitButton = observer(
  ({
    store,
    ready,
    onClick,
  }: StoreProps & { ready: boolean; onClick: () => void }) => (
    <Button
      text={store.isLoading ? "Формирование..." : "Сформировать отчет"}
      type={ready ? ButtonType.gray : ButtonType.default}
      style={{ width: "max-content" }}
      onClick={() => {
        if (!store.isLoading) onClick();
      }}
    />
  ),
);

const ClientOrdersReportView = observer(({ store }: StoreProps) => {
  const navigate = useNavigate();
  const report = store.report;
  return (
    <>
      <div style={{ ...card, maxWidth: 680 }}>
        <ClientPicker
          label="1. Клиент"
          value={store.selectedClient?.id}
          onChange={store.setClient}
        />
        <div style={{ height: 20 }} />
        <PeriodField store={store} label="2. Период" />

        <div style={{ height: 20 }} />
        <SubmitButton
          store={store}
          ready={!!store.selectedClient && !!store.range.startDate}
          onClick={() => store.createReport()}
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
            <div style={{ color: muted }}>За выбранный период заказов нет</div>
          ) : (
            <Table
              headers={[
                "Дата",
                "Авто",
                "Код краски",
                "Цвет",
                "Объем",
                "Статус",
                "Оплата",
                "",
              ]}
            >
              {report.orders.map((order) => (
                <tr key={order.id}>
                  <td style={td}>{formatDate(orderDate(order))}</td>
                  <td style={td}>{order.auto || "—"}</td>
                  <td style={td}>{order.codePaint || "—"}</td>
                  <td style={td}>{order.color || "—"}</td>
                  <td style={td}>
                    {order.theVolumeOfPainTheCustomerWant || "—"}
                  </td>
                  <td style={td}>{order.statusOrder}</td>
                  <td style={td}>{order.financeStatus}</td>
                  <td style={td}>
                    <OpenOrderLink
                      onClick={() => navigate(OrderPath + "/" + order.id)}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </>
  );
});

const RevenueReportView = observer(({ store }: StoreProps) => {
  const navigate = useNavigate();
  const report = store.revenueReport;
  return (
    <>
      <div style={{ ...card, maxWidth: 680 }}>
        <PeriodField store={store} label="Период" />
        <div style={{ height: 20 }} />
        <SubmitButton
          store={store}
          ready={!!store.range.startDate}
          onClick={() => store.createRevenueReport()}
        />
      </div>

      {report && (
        <div style={card}>
          <TextV2 style={{ fontSize: 18 }} text="Отчет по выручке" />
          <div style={{ color: muted, marginTop: 4 }}>
            период {formatDate(report.startDate)} — {formatDate(report.endDate)}{" "}
            · заказов: {report.rows.length}
          </div>
          <div style={{ height: 16 }} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Stat label="Выручка" value={formatMoney(report.total)} accent />
            <Stat label="Себестоимость" value={formatMoney(report.cost)} />
            <Stat label="стоймость работ" value={formatMoney(report.markup)} />
          </div>

          {report.byStatus.length > 0 && (
            <>
              <div style={{ height: 16 }} />
              <TextV2 color={muted} text="По статусу оплаты" />
              <div style={{ height: 6 }} />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {report.byStatus.map((s) => (
                  <Stat
                    key={s.status}
                    label={`${s.status} · ${s.count}`}
                    value={formatMoney(s.total)}
                  />
                ))}
              </div>
            </>
          )}

          <div style={{ height: 16 }} />
          {report.rows.length === 0 ? (
            <div style={{ color: muted }}>За выбранный период заказов нет</div>
          ) : (
            <Table
              headers={[
                "Дата",
                "Клиент",
                "Авто",
                "Оплата",
                "Себестоимость",
                "стоймость работ",
                "Итого",
                "",
              ]}
            >
              {report.rows.map(({ order, clientName, finance }) => (
                <tr key={order.id}>
                  <td style={td}>{formatDate(orderDate(order))}</td>
                  <td style={td}>{clientName || "—"}</td>
                  <td style={td}>{order.auto || "—"}</td>
                  <td style={td}>{order.financeStatus}</td>
                  <td style={tdNum}>
                    {formatMoney(
                      finance.componentsCost + finance.manufactureCost,
                    )}
                  </td>
                  <td style={tdNum}>{formatMoney(finance.markup)}</td>
                  <td style={{ ...tdNum, fontWeight: 600 }}>
                    {formatMoney(finance.total)}
                  </td>
                  <td style={td}>
                    <OpenOrderLink
                      onClick={() => navigate(OrderPath + "/" + order.id)}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </>
  );
});

const Stat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div style={{ border, borderRadius: 8, padding: "10px 14px", minWidth: 160 }}>
    <div style={{ color: muted, fontSize: 13 }}>{label}</div>
    <div style={{ fontSize: accent ? 22 : 18, fontWeight: 600 }}>{value}</div>
  </div>
);

const Table = ({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) => (
  <div style={{ overflowX: "auto", border, borderRadius: 6 }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const OpenOrderLink = ({ onClick }: { onClick: () => void }) => (
  <span
    style={{ textDecoration: "underline", cursor: "pointer" }}
    onClick={onClick}
  >
    открыть
  </span>
);

const card: React.CSSProperties = {
  border,
  borderRadius: 8,
  padding: 20,
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

const tdNum: React.CSSProperties = {
  ...td,
  textAlign: "right",
  whiteSpace: "nowrap",
};
