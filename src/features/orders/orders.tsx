import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { OrdersStore } from "./orders_store";
import { TextV2 } from "../../core/ui/text/text";
import { ModalV2 } from "../../core/ui/modal/modal";
import { InputV3 } from "../../core/ui/input/input_v3";
import PhoneInput from "../../core/ui/input/phone_input";
import { Button } from "../../core/ui/button/Button";
import { ru } from "date-fns/locale";
import { CrudPage } from "../../core/ui/page/crud_page";
import { useNavigate } from "react-router-dom";
import { OrderPath } from "../order/order";
import { Select } from "../../core/ui/select/select";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { OrderViewModel } from "./orders_db_model";
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
              <DayPicker
                mode="single"
                selected={new Date()}
                onSelect={() => {}}
                locale={ru}
                footer={"Pick a day."}
              />
            </>
          ),
          financeStatus: () => (
            <>
              <Select
                style={{ width: "100%" }}
                options={["Ожидает расчета", "Расчет произошел"].map((el) => {
                  return { value: el, label: el };
                })}
                placeholder="Статусы финансовые"
                onChange={(text) => store.findBy(text)}
                value={store.searchValue ?? ""}
              />
            </>
          ),
          statusOrder: () => (
            <>
              <Select
                style={{ width: "100%" }}
                options={["Начат", "Готов", "На паузе"].map((el) => {
                  return { value: el, label: el };
                })}
                placeholder="Статусы производственные"
                onChange={(text) => store.findBy(text)}
                value={store.searchValue ?? ""}
              />
            </>
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
        ]}
        isEditable={false}
        addingColumns={[
          {
            name: "Работа",
            jsx: (el) => (
              <div>
                <div
                  onClick={() => navigate(OrderPath + "/" + el.id)}
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  перейти в заказ
                </div>
              </div>
            ),
          },
        ]}
        mappedColumns={[
          {
            name: "createdAt",
            mapper: (v) => {
              return <>{new Date(v).toLocaleString()}</>;
            },
          },
          {
            name: "orderCharacteristics",
            mapper: (v) => {
              return (
                <>
                  {v === null ? (
                    <>еще не выбран</>
                  ) : v === "Recipe_Selected" ? (
                    <>слив по коду</>
                  ) : v === "NEW_RECEPT" ? (
                    <>новый рецепт</>
                  ) : (
                    <></>
                  )}
                </>
              );
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
          store.modalCancel();
        }}
        children={
          <>
            <InputV3
              label="Авто"
              value={store.viewModel.auto?.toString()}
              onChange={(text) =>
                store.updateForm({
                  auto: text,
                })
              }
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
            <TextV2 text="Поиск клиента по номеру телефона" />
            <div style={{ display: "flex" }}>
              <PhoneInput
                onChange={(text) => (store.searchPhoneNumberField = text)}
              />
              <div style={{ width: 5 }} />
              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.onClickFindButtonToSearchPhone()}
              />
            </div>
            <div style={{ height: 10 }} />
            <div>
              {store.clients.isEmpty() ? (
                <>
                  <TextV2 text={"Не найдено клиентов"} />
                </>
              ) : (
                store.clients.map((el) => (
                  <div
                    style={{
                      // margin: 5,
                      padding: 5,
                      border: "1px solid",
                      backgroundColor:
                        store.viewModel.client === el.id
                          ? "#e6e0ea"
                          : "#ececec",
                    }}
                  >
                    <TextV2 text="Имя" />
                    <div>{el.name}</div>
                    <TextV2 text="Фамилия" />
                    <div>{el.family}</div>
                    <TextV2 text="отчество" />
                    <div>{el.surName}</div>
                    <TextV2 text="Номер телефона" />
                    <div>{el.numberPhone}</div>
                    <Button
                      text="Выбрать"
                      style={{ width: 100 }}
                      onClick={() => store.updateForm({ client: el.id ?? 0 })}
                    />
                  </div>
                ))
              )}
            </div>
            <Button text="Новый заказ" onClick={() => store.createOrUpdate()} />
          </>
        }
      />
    </>
  );
});
