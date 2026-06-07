import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { OrderMapper, OrderStore, SelectReceptMode } from "./order_store";
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
          {/* <Button text="1" onClick={() => store.addBeginComponents()} />
          <Button text="2" onClick={() => store.addComponents()} />
          <Button
            text="3"
            onClick={async () => {
              await store.aabab();
              store.addComponents();
            }}
          /> */}

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
                    </>
                  ) : (
                    <>
                      <Button
                        text="компоненты"
                        style={{ width: 120, marginRight: 20, height: 50 }}
                        onClick={() => store.openComponentsModal()}
                      />
                    </>
                  )}
                </div>
              </>
            }
            child={
              <>
                {/* {store.viewModel?.orderCharacteristics === undefined ? (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <TextV2
                      style={{ textDecoration: "underline" }}
                      text="По рецепту"
                      onClick={() => store.selectOrderProcessType("IN_RECEPT")}
                    />
                    <div style={{ width: "20%" }} />
                    <TextV2
                      style={{ textDecoration: "underline" }}
                      text="Создание нового рецепта"
                      onClick={() => store.selectOrderProcessType("NEW_RECEPT")}
                    />
                  </div>
                ) : (
                  <></>
                )} */}
                {store.orderCharacteristics === "NEW_RECEPT" ? (
                  <div className="ee" style={{ width: "max-content" }}>
                    <Tabs
                      tabs={[
                        {
                          name: "Слив по рецепту",
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
                                            onClick={() => {
                                              store.selectReceptIndex = index;
                                            }}
                                            style={{
                                              display: "flex",
                                              border:
                                                store.selectReceptIndex ===
                                                index
                                                  ? "1px solid red"
                                                  : "",
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
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              border:
                                                                "1px solid",
                                                              width: 60,
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
                                                    }}
                                                  >
                                                    отпыл
                                                  </div>
                                                  <div
                                                    style={{
                                                      border: "1px solid",
                                                      width: 60,
                                                    }}
                                                  >
                                                    вес
                                                  </div>
                                                </div>
                                                <div>
                                                  <div>
                                                    {orderMapper.balance.map(
                                                      (paint) => (
                                                        <>
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                            }}
                                                          >
                                                            <div
                                                              style={{
                                                                border:
                                                                  "1px solid",
                                                                width: 60,
                                                              }}
                                                            >
                                                              {paint.privateNumber ===
                                                              orderMapper.add
                                                                .privateNumber
                                                                ? paint.weightCalcRecept?.shortToDecimalPlaces(
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
                                    <InputV3
                                      onChange={(text) =>
                                        store.updateSelectReceptWeight(
                                          Number(text),
                                        )
                                      }
                                      label={"краски для слива"}
                                    />
                                    <Button
                                      text="Готово"
                                      onClick={() => store.rrrfdasf()}
                                    />
                                  </>
                                ) : (
                                  <>
                                    {store.selectReceptPaintFinal.map((el) => {
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
                                            {el.weightCalcRecept}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </>
                                )}
                              </div>
                            </>
                          ),
                        },
                        {
                          name: "Расходники",
                          jsx: (
                            <div
                              style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                {store.viewModel.consumables?.isNotEmpty() ? (
                                  <>
                                    {store.viewModel.consumables?.map((el) => (
                                      <div
                                        style={{
                                          width: "100%",
                                          margin: 10,
                                          padding: 10,
                                          backgroundColor: "#3c51e0",

                                          color: "white",
                                          border: "4px solid #6474de",
                                          borderRadius: 10,
                                        }}
                                      >
                                        <div>количество: {el.count}</div>
                                        <div>
                                          описание: {el.consumables.description}
                                        </div>
                                      </div>
                                    ))}
                                  </>
                                ) : (
                                  <>У заказа нету расходников</>
                                )}
                              </div>
                              <Button
                                style={{ width: 200 }}
                                text="Добавить расходники"
                                onClick={() => store.consumablesModalOpen()}
                              />
                            </div>
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
                        { name: "Клиент", jsx: <>3</> },
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

                    {/* {store.componentsNewRecept.length !== 0 ? (
                      <>
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              border: "1px solid",
                              width: 60,
                              height: 65,
                            }}
                          >
                            <div
                              style={{
                                transform: "rotate(-90deg)",
                                position: "relative",
                                top: 20,
                              }}
                            >
                              вес (гр)
                            </div>
                          </div>

                          <div
                            style={{
                              border: "1px solid",
                              width: 60,
                              height: 65,
                              alignContent: "center",
                              justifyItems: "center",
                            }}
                          >
                            <div
                              style={{
                                // transform: "rotate(-90deg)",
                                position: "relative",
                                // top: 40,
                              }}
                            >
                              {store.componentsNewRecept.reduce((acc, el) => {
                                return acc + el.weight!;
                              }, 0)}
                            </div>
                          </div>
                          <div
                            style={{
                              border: "1px solid",
                              width: 60,
                              height: 65,
                              alignContent: "center",
                              justifyItems: "center",
                            }}
                          >
                            <div>
                              {store.componentsNewRecept.reduce((acc, el) => {
                                return acc + el.weightCalcRecept!;
                              }, 0)}
                            </div>
                          </div>
                          <div
                            style={{
                              border: "1px solid",
                              width: 60,
                              height: 65,
                              alignContent: "center",
                              justifyItems: "center",
                            }}
                          >
                            <TextV2
                              text={store.getWeightOfTheDust()}
                              // onChange={(text) => store.updateRemainder(text)}
                              style={{
                                width: "100%",
                                height: "100%",
                                alignContent: "center",
                                padding: 5,
                              }}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )} */}
                    {store.componentsNewRecept.length !== 0 ? (
                      <>
                        <div style={{ display: "flex" }}>
                          {/* <div
                            style={{
                              border: "1px solid",
                              width: 120,
                              height: 50,
                              alignContent: "center",
                              justifyItems: "center",
                            }}
                          >
                            <div>Общий вес</div>
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
                            <div>{store.getCommonWeight()}</div>
                          </div> */}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
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
                      validation={Number().isValid}
                      value={el.weight?.toString()}
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
