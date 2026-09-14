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
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { OrderViewModel } from "./orders_db_model";
export const OrdersPath = "/orders";

export const Orders = observer(() => {
  const store = useStore(OrdersStore);
  const navigate = useNavigate();
  // console.log(JSON.stringify(store.page?.data[0]));
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
          // financeStatus: () => <>312</>,
          statusOrder: () => <></>,
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
          // "financeStatus",
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
                textStyle={{ position: "relative", top: -5 }}
                style={{
                  width: 100,
                  position: "relative",
                  top: 21,
                  height: 42,
                }}
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
                      marginTop: 5,
                      marginBottom: 5,
                      padding: 5,
                      border: "1px solid #e2e8f1",
                      borderRadius: 6,
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
                    <div>{el.numberPhone.phoneMapper()}</div>
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
