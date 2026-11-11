import { observer } from "mobx-react-lite";
import { PaintConsistencyPicker } from "./paint_consistency";
import { CarPicker } from "../cars/car_picker";
import { useStore } from "../../core/helper/use_store";
import { OrdersStore } from "./orders_store";
import { ModalV2 } from "../../core/ui/modal/modal";
import { InputV3 } from "../../core/ui/input/input_v3";
import { Button } from "../../core/ui/button/Button";
import { CrudPage } from "../../core/ui/page/crud_page";
import { useNavigate } from "react-router-dom";
import { OrderPath } from "../order/order";
import { isBackgroundOpen, orderTabsStore } from "../order/order_tabs_store";
import { DatePicker } from "antd";
import ruLocale from "antd/es/date-picker/locale/ru_RU";
import moment from "moment";
import { SelectV2 } from "../../core/ui/select/select_v2";
import { useState } from "react";
import { ClientPicker } from "../clients/client_picker";
import { STATUSES } from "../order/ui/order_details";
import { ClientHoverCard } from "../clients/client_hover_card";
import { ExcelImportPanel } from "./excel_import/excel_import_panel";
export const OrdersPath = "/orders";

export const Orders = observer(() => {
  const store = useStore(OrdersStore);
  const navigate = useNavigate();
  return (
    <>
      <CrudPage
        feature={OrdersPath}
        searchByField={{
          auto: () => (
            <CarPicker
              label=""
              allowAdd={false}
              placeholder="Авто: начните вводить марку или модель"
              value={store.searchValue ?? ""}
              onChange={(text) => (store.searchValue = text)}
              onEnter={() => store.onClickFindButton()}
            />
          ),
          createdAt: () => (
            <>
              <DatePicker.RangePicker
                locale={ruLocale}
                format="DD.MM.YYYY"
                placeholder={["С даты", "По дату"]}
                style={{ width: "100%", height: 46, borderRadius: 6 }}
                value={
                  store.searchDateRange
                    ? [
                        moment(store.searchDateRange[0]),
                        moment(store.searchDateRange[1]),
                      ]
                    : null
                }
                onChange={(range) =>
                  (store.searchDateRange =
                    range?.[0] && range?.[1]
                      ? [range[0].toDate(), range[1].toDate()]
                      : undefined)
                }
              />
            </>
          ),
          financeStatus: () => (
            <>
              <div style={{ width: "100%" }}>
                <SelectV2
                  options={["Оплачено", "Ожидает оплаты", "Долг"]}
                  style={{ width: "100%", position: "relative", top: -3 }}
                  onChange={(text) => (store.searchValue = text)}
                />
              </div>
            </>
          ),
          statusOrder: () => (
            <div style={{ width: "100%" }}>
              <SelectV2
                options={["Начат", "Готов", "На паузе"]}
                style={{ width: "100%", position: "relative", top: -3 }}
                onChange={(text) => (store.searchValue = text)}
              />
            </div>
          ),
        }}
        pageName="Заказы"
        missingKey={[
          "id",
          "theVolumeOfPainTheCustomerWant",
          "recipe",
          "recipeJSON",
          "orderProcess",
          "consumablesJson",
          "markup",
          "client",
          "consumablesJson",
          "componentsAddInReceptJson",
          "orderCharacteristics",
          "consumables",
          "componentsAddInReceptJson",
          "selectReceptIndex",
          "addingComponentsTableJson",
          "selectReceptWeight",
          "selectReceptPaintFinal",
          "orderCreate",
          "weightContainers",
          "ignoreManufactureCost",
          "manufactureExcludedSteps",
          "readyAt",
          "paintConsistency",
        ]}
        isEditable={false}
        addingColumns={[
          {
            name: "Работа",
            jsx: (el) => (
              <OpenOrderButton
                id={el.id}
                onClick={(e) => {
                  orderTabsStore.open(el.id);
                  if (!isBackgroundOpen(e)) navigate(OrderPath + "/" + el.id);
                }}
                onAuxClick={(e) =>
                  e.button === 1 && orderTabsStore.open(el.id)
                }
              />
            ),
          },
          {
            name: "клиент",
            jsx: (el) => (
              <div>
                <ClientHoverCard clientId={el.client} />
              </div>
            ),
          },
        ]}
        mappedColumns={[
          {
            name: "statusOrder",
            mapper: (v) => <StatusBadge value={v} palette={STATUSES} />,
          },
          {
            name: "financeStatus",
            mapper: (v) => <StatusBadge value={v} palette={FINANCE_STATUSES} />,
          },
          {
            name: "createdAt",
            mapper: (v) => {
              return <>{new Date(v).toLocaleDateString()}</>;
            },
          },
          {
            name: "paintConsistency",
            mapper: (v) => {
              return <>{v ? v : "-"}</>;
            },
          },
          {
            name: "readyAt",
            mapper: (v) => {
              return <>{v ? new Date(v).toLocaleDateString() : "-"}</>;
            },
          },
          {
            name: "financeStatus",
            mapper: (v) => {
              return <>{v}</>;
            },
          },
          {
            name: "statusOrder",
            mapper: (v) => {
              return <>{v}</>;
            },
          },
        ]}
        replacedColumns={[
          { replace: "Отвественный", name: "personResponsibleForTheOrder" },
          { replace: "Статус рецепта", name: "orderProcess" },
          { replace: "Авто", name: "auto" },
          { replace: "Код краски", name: "codePaint" },
          { replace: "Цвет", name: "color" },
          { replace: "Подбор рецепта", name: "orderCharacteristics" },
          { replace: "Финансовый статус", name: "financeStatus" },
          { replace: "Дата создания", name: "createdAt" },
          { replace: "Дата готовности", name: "readyAt" },
          { replace: "Тип краски", name: "paintConsistency" },
          { replace: "Кто делает заказ", name: "user" },
          { replace: "Производственный статус", name: "statusOrder" },
        ]}
        store={store}
      />
      <ModalV2
        style={{ overflow: "auto", maxHeight: "100%" }}
        isOpen={store.isModalOpen}
        onClose={() => store.modalCancel()}
        children={
          <>
            <ExcelImportPanel store={store} />
            <CarPicker
              value={store.viewModel.auto?.toString()}
              onChange={(text) => store.updateForm({ auto: text })}
            />

            <div style={{ height: 5 }} />

            <InputV3
              label="Код краски"
              value={store.viewModel.codePaint?.toString()}
              onChange={(text) =>
                store.updateForm({
                  codePaint: text,
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              label="Цвет"
              value={store.viewModel.color?.toString()}
              onChange={(text) =>
                store.updateForm({
                  color: text,
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              // validation={(e) => Number(e).isPositive()}
              // error="только числа"
              label="Обьем краски которую хочет клиент в грамах"
              value={store.viewModel.theVolumeOfPainTheCustomerWant}
              onChange={(text) =>
                store.updateForm({
                  theVolumeOfPainTheCustomerWant: text,
                })
              }
            />
            <div style={{ height: 5 }} />
            <PaintConsistencyPicker
              value={store.viewModel.paintConsistency}
              onChange={(value) =>
                store.updateForm({ paintConsistency: value })
              }
            />
            <div style={{ height: 5 }} />
            <ClientPicker
              value={store.viewModel.client}
              onChange={(client) =>
                store.updateForm({ client: client?.id as number })
              }
            />
            <div style={{ height: 16 }} />
            <Button text="Новый заказ" onClick={() => store.createOrder()} />
          </>
        }
      />
    </>
  );
});
// кнопка «Открыть №…» в колонке «Работа»
const OpenOrderButton: React.FC<{
  id: number;
  onClick: (e: React.MouseEvent) => void;
  onAuxClick: (e: React.MouseEvent) => void;
}> = ({ id, onClick, onAuxClick }) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      role="button"
      onClick={onClick}
      onAuxClick={onAuxClick}
      onMouseDown={(e) => e.button === 1 && e.preventDefault()}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      title="Ctrl/Cmd+клик или колёсико — открыть в новой вкладке"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        cursor: "pointer",
        userSelect: "none",
        fontFamily: "system-ui",
        fontSize: 13,
        fontWeight: 600,
        color: isHover ? "var(--open-btn-hover-fg)" : "var(--open-btn-fg)",
        background: isHover ? "var(--open-btn-hover-bg)" : "var(--open-btn-bg)",
        border: `1px solid ${isHover ? "var(--open-btn-hover-bg)" : "var(--open-btn-bd)"}`,
        boxShadow: isHover ? "0 2px 6px rgba(79, 70, 229, 0.25)" : "none",
        transition:
          "background 0.12s, border-color 0.12s, color 0.12s, box-shadow 0.12s",
      }}
    >
      Открыть №{id}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isHover ? "translateX(2px)" : "none",
          transition: "transform 0.12s",
        }}
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
};

type StatusColor = { value: string; color: string; bg: string };

const FINANCE_STATUSES: StatusColor[] = [
  { value: "Оплачено", color: "var(--tx-15803d)", bg: "var(--bg-dcfce7)" },
  { value: "Ожидает оплаты", color: "var(--tx-b45309)", bg: "var(--bg-fef3c7)" },
  { value: "Долг", color: "var(--tx-dc2626)", bg: "var(--bg-fff1f2)" },
  // старые значения
  { value: "Ожидает расчета", color: "var(--tx-b45309)", bg: "var(--bg-fef3c7)" },
  { value: "Расчет произошел", color: "var(--tx-15803d)", bg: "var(--bg-dcfce7)" },
];

// цветной бейдж статуса: точка + подпись на подложке своего цвета
const StatusBadge: React.FC<{ value?: string; palette: StatusColor[] }> = ({
  value,
  palette,
}) => {
  if (!value) return <span style={{ color: "var(--tx-8fa1b9)" }}>—</span>;
  const c = palette.find((p) => p.value === value) ?? {
    color: "var(--tx-64748b)",
    bg: "var(--bg-f1f5f9)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        fontFamily: "system-ui",
        fontSize: 13,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "currentColor",
          flexShrink: 0,
        }}
      />
      {value}
    </span>
  );
};
