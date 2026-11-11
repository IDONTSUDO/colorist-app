import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { Button, ButtonType } from "../../../core/ui/button/Button";
import { SelectV2 } from "../../../core/ui/select/select_v2";
import type { OrdersStore } from "../orders_store";
import { componentKey } from "./excel_order_import";

const border = "1px solid var(--bd-oklch-92-9-0-013-255-508)";
const muted = "var(--tx-8fa1b9)";

const Badge: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
      color: ok ? "var(--tx-15803d)" : "var(--tx-b45309)",
      background: ok ? "var(--bg-dcfce7)" : "var(--bg-fef3c7)",
    }}
  >
    {text}
  </span>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
    <span style={{ color: muted, minWidth: 70 }}>{label}</span>
    {children}
  </div>
);

/**
 * Загрузка заказа из Excel в окне «Новый заказ»: выбор листа, проверка авто,
 * клиента и компонентов. Пока какого-то компонента нет в картотеке, заказ не
 * создаётся — его можно добавить прямо здесь, указав цену за грамм.
 */
export const ExcelImportPanel: React.FC<{ store: OrdersStore }> = observer(({ store }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const order = store.excelOrder;
  const missing = store.excelMissingComponents();
  const sheetNames = store.excelSheets.map((s) => s.sheetName);

  return (
    <div style={{ marginBottom: 12 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) store.loadExcelFile(file);
          e.target.value = "";
        }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button
          type={ButtonType.gray}
          text={store.excelLoading ? "Читаю файл…" : "Загрузить заказ из Excel"}
          onClick={() => inputRef.current?.click()}
        />
        {store.excelFileName !== undefined && (
          <span
            role="button"
            style={{ color: muted, cursor: "pointer", fontSize: 13 }}
            onClick={() => store.clearExcel()}
            title="Отменить загрузку из Excel"
          >
            {store.excelFileName} ✕
          </span>
        )}
      </div>

      {sheetNames.length > 1 && (
        <div style={{ marginTop: 8 }}>
          <SelectV2
            label={`Лист (${sheetNames.length})`}
            options={sheetNames}
            currentValue={store.excelSheetName}
            onChange={(name) => store.selectExcelSheet(name)}
          />
        </div>
      )}

      {store.excelError !== undefined && (
        <div style={{ marginTop: 8, color: "var(--tx-dc2626)" }}>
          Не удалось прочитать лист: {store.excelError}
        </div>
      )}

      {order !== undefined && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            border,
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 14,
          }}
        >
          <Row label="Авто">
            <b>{order.auto || "—"}</b>
            {order.auto === "" ? (
              <Badge ok={false} text="не указано — введите ниже" />
            ) : store.excelExistingCar !== undefined ? (
              <Badge ok text="есть в справочнике" />
            ) : (
              <Badge ok={false} text="нет в справочнике — будет добавлено" />
            )}
          </Row>
          <Row label="Клиент">
            <b>{order.clientName || "—"}</b>
            {store.excelClientMatches.length === 1 ? (
              <Badge ok text="найден" />
            ) : store.excelClientMatches.length > 1 ? (
              <Badge ok={false} text={`найдено ${store.excelClientMatches.length} — выберите ниже`} />
            ) : (
              <Badge ok={false} text="не найден — выберите ниже" />
            )}
          </Row>
          <Row label="Подбор">
            <span>
              шагов: {order.steps.length}, вес тары: {order.tare} г
            </span>
          </Row>
          {[
            ["VIN", order.vin],
            ["Госномер", order.plate],
            ["Система", order.system],
            ["Деталь", order.part],
            ["Цена", order.price],
          ]
            .filter(([, v]) => v !== "")
            .map(([label, v]) => (
              <Row key={label} label={label}>
                <span>{v}</span>
                <span style={{ color: muted, fontSize: 12 }}>(в заказе такого поля нет)</span>
              </Row>
            ))}

          <div style={{ marginTop: 6, fontWeight: 600 }}>
            Компоненты ({order.components.length})
            {missing.isNotEmpty() && (
              <span style={{ color: "var(--tx-b45309)", fontWeight: 400 }}>
                {" "}
                — нет в картотеке: {missing.length}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {order.components.map((c) => {
              const found = store.excelCatalog.get(componentKey(c.privateNumber));
              return (
                <div
                  key={c.privateNumber}
                  style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 30 }}
                >
                  <span style={{ width: 90, fontWeight: 600 }}>{c.privateNumber}</span>
                  <span style={{ width: 70, color: muted }}>{c.standard} г</span>
                  {found !== undefined ? (
                    <Badge ok text="в картотеке" />
                  ) : (
                    <>
                      <input
                        placeholder="цена за г"
                        inputMode="decimal"
                        value={store.excelNewComponentPrice[c.privateNumber] ?? ""}
                        onChange={(e) =>
                          store.updateExcelNewComponentPrice(c.privateNumber, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") store.addExcelComponent(c.privateNumber);
                        }}
                        style={{
                          width: 90,
                          padding: "4px 8px",
                          border,
                          borderRadius: 6,
                          background: "transparent",
                          color: "inherit",
                        }}
                      />
                      <span
                        role="button"
                        onClick={() => store.addExcelComponent(c.privateNumber)}
                        style={{
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--open-btn-fg)",
                        }}
                      >
                        + в картотеку
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {missing.length > 1 && (
            <span
              role="button"
              onClick={() => store.addAllExcelComponents()}
              style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--open-btn-fg)" }}
            >
              Добавить все недостающие (у каждого должна быть цена)
            </span>
          )}
          {missing.isNotEmpty() && (
            <div style={{ color: "var(--tx-b45309)", fontSize: 13 }}>
              Заказ создастся после того, как все компоненты будут в картотеке.
            </div>
          )}
        </div>
      )}
    </div>
  );
});
