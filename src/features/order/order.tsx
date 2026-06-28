import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import {
  OrderMapper,
  OrderMode,
  OrderStore,
  SelectReceptMode,
} from "./order_store";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "../../core/ui/loader/loader";
import { TextV2 } from "../../core/ui/text/text";
import { Button } from "../../core/ui/button/Button";
import { Tabs } from "../../core/ui/tabs/tabs";
import { TextPointer } from "../../core/ui/text/text_pointer";
import { Menu } from "../../core/ui/menu/menu";
import { Select } from "../../core/ui/select/select";
import { Icon, IconType } from "../../core/ui/icon/icon";
import { ModalV2 } from "../../core/ui/modal/modal";
import { CalculateOrder } from "./ui/calculate_order";
import { InputV3 } from "../../core/ui/input/input_v3";

export const OrderPath = "/order";

export const Order = observer(() => {
  const store = useStore(OrderStore);
  const { id } = useParams();

  useEffect(() => {
    store.initParams(id as string);
  }, []);
  return (
    <>
      {store.isLoading ? (
        <Loader />
      ) : (
        <>
          <Menu
            right={
              <>
                <div style={{ display: "flex", width: "max-content" }}>
                  {store.componentsAddInRecept.isEmpty() ? (
                    <>
                      <Button
                        text="создать рецепт"
                        style={{ width: 140, marginRight: 20, height: 50 }}
                        onClick={() => store.openNewReceptModal()}
                      />
                      <Button
                        text="из буффера обмена"
                        style={{ width: 200, marginRight: 20, height: 50 }}
                        onClick={() => store.insertReceptFromClickBoard()}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        text="скопировать"
                        style={{ width: 120, marginRight: 20, height: 50 }}
                        onClick={() => store.copyRecept()}
                      />
                      <Button
                        text="компоненты"
                        style={{ width: 120, marginRight: 20, height: 50 }}
                        onClick={() => store.openComponentsModal()}
                      />
                      <Button
                        text="выбрать рецепт"
                        color={
                          store.orderMode === OrderMode.selectRecept
                            ? "rgb(208, 255, 73)"
                            : undefined
                        }
                        textColor={
                          store.orderMode === OrderMode.selectRecept
                            ? "black"
                            : undefined
                        }
                        style={{ width: 150, marginRight: 20, height: 50 }}
                        onClick={() => store.setSelectReceptMode()}
                      />
                    </>
                  )}
                </div>
              </>
            }
            child={
              <>
                {store.orderCharacteristics === "NEW_RECEPT" ? (
                  <div className="ee" style={{ width: "max-content" }}>
                    <Tabs
                      tabs={[
                        {
                          name: "Рецепт",
                          jsx: (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  width: "100%",
                                  justifyContent: "space-between",
                                }}
                              ></div>
                              <div>
                                {store.componentsNewRecept.length !== 0 ? (
                                  <>
                                    <div style={{ display: "flex" }}>
                                      <div
                                        style={{
                                          border: "1px solid",

                                          width: 60,
                                          height: 120,
                                        }}
                                      >
                                        <div
                                          style={{
                                            transform: "rotate(-90deg)",
                                            position: "relative",
                                            top: 60,
                                          }}
                                        >
                                          Компоненты
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          border: "1px solid",
                                          width: 60,
                                          height: 120,
                                        }}
                                      >
                                        <div
                                          style={{
                                            transform: "rotate(-90deg)",
                                            position: "relative",
                                            top: 40,
                                          }}
                                        >
                                          Стандарт
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          border: "1px solid",
                                          width: 60,
                                          height: 120,
                                        }}
                                      >
                                        <div
                                          style={{
                                            transform: "rotate(-90deg)",
                                            position: "relative",
                                            top: 0,
                                          }}
                                        >
                                          Вес
                                        </div>
                                      </div>
                                      {store.componentsAddInRecept.map(
                                        (_, __) => {
                                          return (
                                            <>
                                              <div
                                                style={{
                                                  border: "1px solid",
                                                  width: 60,
                                                  height: 120,
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    transform: "rotate(-90deg)",
                                                    position: "relative",
                                                    top: 30,
                                                  }}
                                                >
                                                  Остаток
                                                </div>
                                              </div>
                                              <div
                                                style={{
                                                  border: "1px solid",
                                                  width: 60,
                                                  height: 120,
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    transform: "rotate(-90deg)",
                                                    position: "relative",
                                                    top: 30,
                                                  }}
                                                >
                                                  Добавка
                                                </div>
                                              </div>
                                            </>
                                          );
                                        },
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}

                                <div style={{ display: "flex" }}>
                                  <div>
                                    {store
                                      .getComponentsReceptUniq()
                                      .map((el) => (
                                        <>
                                          <div style={{ display: "flex" }}>
                                            <div
                                              style={{
                                                border: "1px solid black  ",
                                                width: 60,
                                                backgroundColor: "black",
                                                color: "white",
                                              }}
                                            >
                                              {el.privateNumber}
                                            </div>
                                            {/* <div
                                              style={{
                                                border: "1px solid",
                                                width: 60,
                                              }}
                                            >
                                              {el.weight}
                                            </div> */}
                                            <div
                                              style={{
                                                border: "1px solid",
                                                width: 60,
                                              }}
                                            >
                                              {isNaN(el.weightCalcRecept!)
                                                ? "-"
                                                : el.weightCalcRecept?.shortToDecimalPlaces(
                                                    2,
                                                  )}
                                            </div>
                                          </div>
                                        </>
                                      ))}
                                  </div>
                                  <div style={{ display: "flex" }}>
                                    {store.componentsAddInRecept.map(
                                      (orderMapper, index) => {
                                        return (
                                          <div
                                            onClick={() =>
                                              store.setSelectRecept(index)
                                            }
                                            style={{
                                              display: "flex",
                                            }}
                                          >
                                            {index === 0 ? (
                                              <></>
                                            ) : (
                                              <>
                                                <div>
                                                  {orderMapper.balance.map(
                                                    (paint) => (
                                                      <>
                                                        <div
                                                          style={{
                                                            display: "flex",
                                                            backgroundColor:
                                                              store.selectReceptIndex ===
                                                              index
                                                                ? "#d0ff49"
                                                                : "",
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              border:
                                                                "1px solid",
                                                              width: 60,
                                                              backgroundColor:
                                                                store.selectReceptIndex ===
                                                                index
                                                                  ? "#d0ff49"
                                                                  : "",
                                                            }}
                                                          >
                                                            {paint.weightCalcRecept?.shortToDecimalPlaces(
                                                              2,
                                                            )}
                                                          </div>
                                                        </div>
                                                      </>
                                                    ),
                                                  )}
                                                  <div
                                                    style={{
                                                      border: "1px solid",
                                                      width: 60,
                                                      backgroundColor:
                                                        store.selectReceptIndex ===
                                                        index
                                                          ? "#d0ff49"
                                                          : "",
                                                    }}
                                                  >
                                                    отпыл
                                                  </div>
                                                  <div
                                                    style={{
                                                      border: "1px solid",
                                                      width: 60,
                                                      backgroundColor:
                                                        store.selectReceptIndex ===
                                                        index
                                                          ? "#d0ff49"
                                                          : "",
                                                    }}
                                                  >
                                                    вес
                                                  </div>
                                                </div>
                                                <div
                                                  className="3"
                                                  style={{ width: 60 }}
                                                >
                                                  <div className="2">
                                                    {orderMapper.balance.map(
                                                      (paint) => (
                                                        <>
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                            }}
                                                            className="1"
                                                          >
                                                            <div
                                                              style={{
                                                                border:
                                                                  "1px solid",
                                                                width: 60,
                                                              }}
                                                            >
                                                              {/* todo */}
                                                              {paint.privateNumber ===
                                                              orderMapper.add
                                                                .privateNumber
                                                                ? orderMapper.add.weight?.shortToDecimalPlaces(
                                                                    2,
                                                                  )
                                                                : "-"}{" "}
                                                            </div>
                                                          </div>
                                                        </>
                                                      ),
                                                    )}
                                                  </div>
                                                  <Dust
                                                    store={store}
                                                    ele={orderMapper}
                                                    index={index}
                                                  />
                                                  <div
                                                    style={{
                                                      border: "1px solid",
                                                    }}
                                                  >
                                                    {orderMapper
                                                      .getBalance(store)
                                                      .shortToDecimalPlaces(
                                                        2,
                                                      )}{" "}
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        );
                                      },
                                    )}
                                  </div>

                                  <>
                                    {/* {store.additiveComponents.map((element, _) => {
                            return (
                              <span>
                                {element.map((subElement) => {
                                  return (
                                    <>
                                      <div
                                        style={{
                                          border: "1px solid",
                                          width: 60,
                                        }}
                                      >
                                        {subElement.additives}
                                      </div>
                                    </>
                                  );
                                })}
                              </span>
                            );
                          })} */}
                                  </>
                                </div>
                                <div style={{ display: "flex" }}>
                                  <div
                                    style={{
                                      border: "1px solid",
                                      width: 120,
                                      height: 50,
                                      alignContent: "center",
                                      justifyItems: "center",
                                    }}
                                  >
                                    <div>Вес тары</div>
                                  </div>
                                  <div
                                    style={{
                                      border: "1px solid",
                                      width: 60,
                                      height: 50,
                                      alignContent: "center",
                                      justifyItems: "center",
                                    }}
                                  >
                                    <TextV2
                                      isEditable={true}
                                      initialValue={store.weightContainers
                                        .shortToDecimalPlaces(2)
                                        .toString()}
                                      onChange={(text) =>
                                        store.updateWeightContainers(text)
                                      }
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        alignContent: "center",
                                        padding: 5,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex" }}>
                                {store.addingComponentsTable.map((el) => {
                                  return (
                                    <div>
                                      <div
                                        style={{
                                          border: "1px solid black  ",
                                          width: 60,
                                          backgroundColor: "black",
                                          color: "white",
                                        }}
                                      >
                                        {el.privateNumber}
                                      </div>
                                      <div
                                        style={{
                                          border: "1px solid black  ",
                                          width: 60,
                                        }}
                                      >
                                        {el.weightCalcRecept}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div>
                                {store.selectReceptIndex !== undefined &&
                                store.selectReceptMode ===
                                  SelectReceptMode.one ? (
                                  <>
                                    <div style={{ height: 10 }}></div>
                                    <div style={{ display: "flex" }}>
                                      <InputV3
                                        validation={Number().isValid}
                                        error="только цифры"
                                        onChange={(text) =>
                                          store.updateSelectReceptWeight(
                                            Number(text),
                                          )
                                        }
                                        label={"обьем краски для слива"}
                                      />
                                      <Button
                                        text="Готово"
                                        style={{ width: 100 }}
                                        onClick={() =>
                                          store.setTheInkVolumeForDraining()
                                        }
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {store.selectReceptMode ===
                                    SelectReceptMode.two ? (
                                      <>
                                        <div style={{ display: "flex" }}>
                                          <div style={{ fontSize: 20 }}>
                                            Слив по рецепту{" "}
                                            {store.selectReceptWeight} грамм
                                          </div>
                                          <div style={{ width: 20 }} />
                                          <div
                                            style={{
                                              fontSize: 20,
                                              textDecoration: "underline",
                                            }}
                                            onClick={() => store.cancelLeak()}
                                          >
                                            отменить
                                          </div>
                                        </div>
                                        {store.selectReceptPaintFinal.map(
                                          (el) => {
                                            return (
                                              <div style={{ display: "flex" }}>
                                                <div
                                                  style={{
                                                    border: "1px solid black  ",
                                                    width: 60,
                                                    backgroundColor: "black",
                                                    color: "white",
                                                  }}
                                                >
                                                  {el.privateNumber}
                                                </div>
                                                <div
                                                  style={{
                                                    border: "1px solid black  ",
                                                    width: 60,
                                                  }}
                                                >
                                                  {Number(
                                                    el.weightCalcRecept,
                                                  ).shortToDecimalPlaces(2)}
                                                </div>
                                              </div>
                                            );
                                          },
                                        )}
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                )}
                              </div>
                            </>
                          ),
                        },

                        {
                          name: "Заказ",
                          jsx: (
                            <>
                              <TextPointer
                                rightText={"авто"}
                                leftText={store.viewModel.auto}
                              />
                              <TextPointer
                                rightText={"цвет"}
                                leftText={store.viewModel.color}
                              />
                              <TextPointer
                                rightText={"код краски"}
                                leftText={store.viewModel.codePaint}
                              />
                              <TextPointer
                                rightText={"Обьем краски для клиента"}
                                leftText={store.viewModel.theVolumeOfPainTheCustomerWant?.toString()}
                              />
                            </>
                          ),
                        },
                        {
                          name: "Клиент",
                          jsx: (
                            <>
                              <div>имя - {store.client.name}</div>
                              <div>фамилия - {store.client.family}</div>
                              <div>отчество - {store.client.surName}</div>
                              <div>
                                номер телефона - {store.client.numberPhone}
                              </div>
                            </>
                          ),
                        },
                        {
                          name: "Производство заказа",
                          jsx: (
                            <>
                              <Select
                                options={["Начат", "Готов", "На паузе"].map(
                                  (el) => {
                                    return {
                                      value: el,
                                      label: el,
                                    };
                                  },
                                )}
                                value={store.viewModel.statusOrder}
                                onChange={(text) => {
                                  store.updateForm({ statusOrder: text });
                                  store.updateOrder();
                                }}
                              />
                            </>
                          ),
                          width: 200,
                        },
                        {
                          name: "Финансовый учет",
                          jsx: (
                            <>
                              <div style={{ fontSize: 20 }}>
                                Управление статусом финансов
                              </div>
                              <Select
                                options={[
                                  "Ожидает расчета",
                                  "Расчет произошел",
                                ].map((el) => {
                                  return {
                                    value: el,
                                    label: el,
                                  };
                                })}
                                value={store.viewModel.financeStatus}
                                onChange={(text) => {
                                  store.updateForm({
                                    financeStatus: text,
                                  });
                                  store.updateOrder();
                                }}
                              />
                              <CalculateOrder store={store} />
                            </>
                          ),
                          width: 170,
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <></>
                )}
                {store.viewModel?.orderCharacteristics === "IN_RECEPT" ? (
                  <>
                    <div style={{ display: "flex" }}>
                      <InputV3
                        style={{ width: "100%" }}
                        label="поиск рецепта по номеру в картотеке"
                        onChange={(text) => store.updateReceptField(text)}
                      />

                      <Button
                        text="поиск"
                        style={{ width: 100 }}
                        onClick={() => store.findRecipes()}
                      />
                    </div>
                    <div>
                      {store.recipes.isEmpty() ? (
                        <></>
                      ) : (
                        store.recipes.map((el, i) => (
                          <div
                            key={i}
                            style={{
                              backgroundColor: "#d4d4d58f",
                              margin: 10,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: 10,
                            }}
                          >
                            <div>{el.cardIndexNumber}</div>
                            <Button
                              text="Выбрать"
                              style={{ width: 100 }}
                              onClick={() => store.selectRecept(i)}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </>
            }
          />
        </>
      )}
      <ModalV2
        onClose={() => store.closeNewReceptModal()}
        isOpen={store.isNewReceptModal}
        children={
          <>
            <div style={{ width: "50vw" }}>
              <div style={{ display: "flex" }}>
                <div style={{ fontSize: 20 }}>Новый рецепт</div>
              </div>
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", width: "100%" }}>
                  <InputV3
                    style={{ width: "100%" }}
                    label="Поиск компонента по номеру в картотеке"
                    onChange={(text) => store.updateComponentsField(text)}
                  />

                  <Button
                    text="поиск"
                    style={{ width: 100 }}
                    onClick={() => store.findComponents()}
                  />
                  {store.newReceptComponents.isEmpty() ? (
                    <></>
                  ) : (
                    <>
                      <Button
                        text="начать"
                        style={{ width: 380, marginRight: 20 }}
                        onClick={() => store.addBeginComponents()}
                      />
                    </>
                  )}
                </div>
                <div style={{ width: "100%", display: "flex" }}>
                  <div style={{ width: "50%" }}>
                    <div>
                      {store.components.map((el, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <TextV2
                            text={`номер: ${el.privateNumber}`}
                            style={{
                              // border: "1px solid",
                              textAlign: "center",
                              alignContent: "center",
                              backgroundColor: "black",
                              color: "white",
                              width: "100%",
                            }}
                          />
                          <div style={{ display: "flex" }}>
                            <InputV3
                              label="Вес в рецепте"
                              style={{ width: "max-content" }}
                              validation={Number().isValid}
                              initialValue={el.privateNumber}
                              value={el.weight
                                ?.shortToDecimalPlaces(2)
                                ?.toString()}
                              onChange={(val) => {
                                store.updateWeights(Number(val), i);
                              }}
                            />

                            <Button
                              style={{ width: "150px" }}
                              onClick={() => store.addComponentsToNewRecept(i)}
                              text="добавить"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ width: "50%" }}>
                    {store.newReceptComponents.map((el, i) => {
                      return (
                        <>
                          <div style={{ border: "1px solid" }}>
                            <div>
                              <div>номер:{el.privateNumber}</div>
                              <div>вес:{el.weight}</div>
                            </div>
                            <div>
                              <Button
                                width={150}
                                text="удалить"
                                onClick={() => store.deleteReceptComp(i)}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      />
      <ModalV2
        isOpen={store.isOpenComponentsModal}
        onClose={() => store.closeComponentsModal()}
        children={
          <>
            <div style={{ display: "flex", width: 500 }}>
              <InputV3
                style={{ width: "100%" }}
                label="Поиск компонента по номеру в картотеке"
                onChange={(text) => store.updateComponentsField(text)}
              />

              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.findComponents()}
              />
            </div>
            <div style={{ height: 10 }}></div>
            <div>
              {store.components.map((el, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <TextV2
                    text={`номер: ${el.privateNumber}`}
                    style={{ alignContent: "center", width: "100%" }}
                  />
                  <div style={{ display: "flex" }}>
                    <InputV3
                      label="Вес в рецепте"
                      style={{ width: "max-content" }}
                      initialValue={el.id?.toString()}
                      validation={Number().isValid}
                      onChange={(val) => {
                        store.updateWeights(Number(val), i);
                      }}
                    />
                    <Button
                      width={150}
                      onClick={() => store.addComponents(i)}
                      text="добавить"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        }
      />
      <ModalV2
        isOpen={store.consumablesModalIsOpen}
        onClose={() => store.consumablesModalClose()}
        children={
          <>
            <div style={{ display: "flex" }}>
              <InputV3
                label="Поиск расходников"
                style={{ width: 500 }}
                onChange={(text) => store.consumablesFindField(text)}
              />
              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.findConsumables()}
              />
            </div>
            {store.consumables.map((el, i) => (
              <div
                key={i}
                style={{
                  margin: 10,
                  backgroundColor: "rgb(239 244 252)",
                  width: "100%",
                  display: "flex",
                  justifyItems: "center",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgb(213 214 215)",
                  padding: 10,
                }}
              >
                <div>{el.description}</div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => store.addConsumablesToOrder(i)}
                >
                  <Icon type={IconType.plus} />
                </div>
              </div>
            ))}
          </>
        }
      />
    </>
  );
});

const Dust: React.FC<{
  store: OrderStore;
  index: number;
  ele: OrderMapper;
}> = ({ store, index, ele }) => {
  const [s] = useState(ele.dust);
  return (
    <div
      key={index}
      suppressContentEditableWarning={true}
      contentEditable={true}
      onInput={(event) => {
        store.updateDust(
          // @ts-ignore
          event.currentTarget.innerText,
          index,
        );
      }}
      style={{ border: "1px solid", width: 60 }}
    >
      {s ?? "..."}
    </div>
  );
};
