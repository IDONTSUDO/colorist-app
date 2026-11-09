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
import { OrderViewModel } from "./orders_db_model";
import { SelectV2 } from "../../core/ui/select/select_v2";
import { useEffect, useState } from "react";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import { ClientPicker } from "../clients/client_picker";
export const OrdersPath = "/orders";

export const Orders = observer(() => {
  const store = useStore(OrdersStore);
  const navigate = useNavigate();
  return (
    <>
      <CrudPage
        feature={OrdersPath}
        searchByField={{
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
              <div>
                <div
                  onClick={(e) => {
                    orderTabsStore.open(el.id);
                    if (!isBackgroundOpen(e)) navigate(OrderPath + "/" + el.id);
                  }}
                  onAuxClick={(e) =>
                    e.button === 1 && orderTabsStore.open(el.id)
                  }
                  title="Ctrl/Cmd+клик или колёсико — открыть в новой вкладке"
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  перейти в заказ
                </div>
              </div>
            ),
          },
          {
            name: "клиент",
            jsx: (el) => (
              <div>
                <ClientMapper clientId={el.client} />
              </div>
            ),
          },
        ]}
        mappedColumns={[
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
        onClose={() => {
          store.viewModel = new OrderViewModel();
          store.autoCompleteChildren = [];
          store.modalCancel();
        }}
        children={
          <>
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
            <Button text="Новый заказ" onClick={() => store.createOrUpdate()} />
          </>
        }
      />
    </>
  );
});
export const ClientMapper: React.FC<{ clientId: string }> = ({ clientId }) => {
  const [client, setClient] = useState<string | null>(null);
  const getClient = async () => {
    (await new ClientsDbRepository().findModel("id", clientId)).map((el) => {
      setClient(el.at(0)?.family ?? el.at(0)?.numberPhone ?? "");
    });
  };
  useEffect(() => {
    getClient();
  }, [clientId]);
  return <div>{client === null ? " - " : client}</div>;
};
