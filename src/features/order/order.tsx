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
import { Button, ButtonType } from "../../core/ui/button/Button";
import { Tabs } from "../../core/ui/tabs/tabs";
import { Menu } from "../../core/ui/menu/menu";
import { Icon, IconType } from "../../core/ui/icon/icon";
import { ModalV2 } from "../../core/ui/modal/modal";
import { InputV3 } from "../../core/ui/input/input_v3";
import { M } from "./ui/modal_add_components";
import { OrderForm } from "./ui/order_form";
import { ClientForm } from "./ui/client";
import { FinancialAccountingForm } from "./ui/finance_form";

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
                      <div
                        onClick={() => store.insertReceptFromClickBoard()}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: "#f0f2f5",
                          color: "#4a5568",
                          transition: "all 0.2s",
                        }}
                      >
                        из буффера обмена
                      </div>
                      <div style={{ width: 10 }}> </div>
                      <div
                        onClick={() => store.openNewReceptModal()}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: "#4f46e5",
                          color: "#ffffff",
                          transition: "all 0.2s",
                        }}
                      >
                        создать рецепт
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: "rgb(240, 242, 245)",
                          color: "rgb(74, 85, 104)",
                          transition: "all 0.2s",
                        }}
                        onClick={() => store.copyRecept()}
                      >
                        скопировать
                      </div>
                      <div style={{ width: 10 }}></div>
                      <div
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: "#4f46e5",
                          color: "#ffffff",
                          transition: "all 0.2s",
                        }}
                        onClick={() => store.openComponentsModal()}
                      >
                        компоненты
                      </div>
                      <div style={{ width: 10 }}></div>

                      <div
                        style={{
                          // padding: "10px 18px",
                          // borderRadius: "8px",
                          // fontSize: 14,
                          // fontWeight: 500,
                          // alignContent: "center",
                          // cursor: "pointer",
                          // border: "none",
                          // backgroundColor: "#4f46e5",

                          // transition: "all 0.2s",
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor:
                            store.orderMode === OrderMode.selectRecept
                              ? "rgb(79, 70, 229)"
                              : "rgb(240, 242, 245)",
                          // color: "rgb(74, 85, 104)",
                          color:
                            store.orderMode === OrderMode.selectRecept
                              ? "white"
                              : "rgb(74, 85, 104)",
                          transition: "all 0.2s",
                        }}
                        onClick={() => store.setSelectReceptMode()}
                      >
                        выбрать рецепт
                      </div>
                      {/* <Button
                        text="выбрать рецепт"
                        color={
                         
                        }
                        textColor={
                          
                        }
                        style={{ width: 150, marginRight: 20, height: 50 }}
                       /> */}
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
                                    <div
                                      style={{ display: "flex" }}
                                      className="1"
                                    >
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
                                                  <div>
                                                    {orderMapper.balance.reduce(
                                                      (el, acc) => {
                                                        return (
                                                          el + (acc.weight ?? 0)
                                                        );
                                                      },
                                                      0,
                                                    )}
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
                              </div>
                              <div style={{}}>
                                {store.addingComponentsTable.map((el) => {
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
                              </div>
                              <div style={{ height: 10 }}></div>
                              <div
                                style={{
                                  // border: "1px solid",
                                  background: "#fafafa",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 8,
                                  padding: 20,
                                  maxWidth: 320,
                                  // width: 120,
                                  // height: 50,
                                  // alignContent: "center",
                                  // justifyItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#4a5568",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    width: "100%",
                                  }}
                                >
                                  Вес тары
                                </div>
                                <div
                                  style={
                                    {
                                      // border: "1px solid",
                                      // width: 60,
                                      // height: 50,
                                      // alignContent: "center",
                                      // justifyItems: "center",
                                    }
                                  }
                                >
                                  <div style={{ display: "flex" }}>
                                    <TextV2
                                      isEditable={true}
                                      initialValue={store.weightContainers
                                        .shortToDecimalPlaces(2)
                                        .toString()}
                                      onChange={(text) =>
                                        store.updateWeightContainers(text)
                                      }
                                      style={{
                                        // width: "100%",
                                        // height: "100%",
                                        // alignContent: "center",
                                        // padding: 5,
                                        width: 170,
                                        padding: "11px 36px 11px 14px",
                                        fontSize: 16,
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 6,
                                        backgroundColor: "#ffffff",
                                        color: "#1a202c",
                                        outline: "none",
                                        transition:
                                          "border-color 0.2s, box-shadow 0.2s",
                                      }}
                                    />
                                    <div
                                      style={{
                                        position: "relative",
                                        left: -20,
                                        top: 13,
                                        color: "#1a202c",
                                      }}
                                    >
                                      г{" "}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                {store.selectReceptIndex !== undefined &&
                                store.selectReceptMode ===
                                  SelectReceptMode.one ? (
                                  <>
                                    <div style={{ height: 10 }}></div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                      }}
                                    >
                                      <InputV3
                                        labelStyle={{
                                          fontSize: 10,
                                          fontWeight: 800,
                                        }}
                                        validation={Number().isValid}
                                        // error="только цифры"
                                        onChange={(text) =>
                                          store.updateSelectReceptWeight(
                                            Number(text),
                                          )
                                        }
                                        // value="0"
                                        label={"обьем краски для слива"}
                                      />
                                      <Button
                                        text="Готово"
                                        style={{ height: 40 }}
                                        textStyle={{
                                          position: "relative",
                                          top: -3,
                                        }}
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
                                          <div
                                            style={{
                                              fontSize: 20,
                                              fontWeight: 100,
                                            }}
                                          >
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
                              {/* <TextPointer
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
                               */}
                              <OrderForm orderViewModel={store.viewModel} />
                            </>
                          ),
                        },
                        {
                          name: "Клиент",
                          jsx: (
                            <>
                              {/* <div>имя - {store.client.name}</div>
                              <div>фамилия - {store.client.family}</div>
                              <div>отчество - {store.client.surName}</div>
                              <div>
                                номер телефона - {store.client.numberPhone}
                              </div> */}
                              <ClientForm orderViewModel={store.client} />
                            </>
                          ),
                        },
                        {
                          name: "Производство заказа",
                          jsx: (
                            <>
                              {/* <Select
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
                              /> */}
                              <div>
                                <label
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#4a5568",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    marginBottom: "6px",
                                    display: "block",
                                  }}
                                >
                                  Статус
                                </label>
                                <select
                                  value={store.viewModel.statusOrder}
                                  onChange={(e) => {
                                    store.updateForm({
                                      statusOrder: e.target.value,
                                    });
                                    store.updateOrder();
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    fontSize: "15px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    backgroundColor: "#ffffff",
                                    color: "#1a202c",

                                    outline: "none",
                                    cursor: "pointer",
                                    boxSizing: "border-box",
                                  }}
                                >
                                  <option value="" disabled hidden>
                                    Выберите статус...
                                  </option>
                                  <option value="Начат">Начат</option>
                                  <option value="Готов">Готов</option>
                                  <option value="На паузе">На паузе</option>
                                </select>
                              </div>
                            </>
                          ),
                          width: 200,
                        },
                        {
                          name: "Финансовый учет",
                          jsx: (
                            <>
                              {/* <div style={{ fontSize: 20 }}>
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
                              <CalculateOrder store={store} /> */}
                              {/* <CalculateOrder store={store} /> */}
                              <FinancialAccountingForm store={store} />
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
            <div style={{ width: "75vw" }}>
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    fontSize: 20,

                    margin: "0 0 6px 0",
                    fontWeight: 600,
                    color: "#11111",
                  }}
                >
                  Новый рецепт
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      width: "50%",
                    }}
                  >
                    <div style={{}}>
                      <div
                        style={{ fontSize: 14, color: "#718096", margin: 0 }}
                      >
                        Поиск компонента по номеру в картотеке
                      </div>
                      <InputV3
                        style={{ width: "100%" }}
                        // label="введите номер"
                        onChange={(text) => store.updateComponentsField(text)}
                      />
                    </div>
                    <Button
                      text="поиск"
                      textStyle={{ position: "relative", top: -3 }}
                      style={{
                        width: 100,
                        // position: "relative",/
                        height: 40,
                      }}
                      onClick={() => store.findComponents()}
                    />
                  </div>
                  <div style={{ width: "50%" }}>
                    {store.newReceptComponents.isEmpty() ? (
                      <></>
                    ) : (
                      <>
                        <Button
                          text="начать"
                          textStyle={{ position: "relative", top: -3 }}
                          type={ButtonType.blue}
                          style={{ width: "100%", marginRight: 20, height: 40 }}
                          onClick={() => store.addBeginComponents()}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div style={{ width: "100%", display: "flex" }}>
                  <div style={{ width: "50%" }}>
                    <div style={{ width: "100%" }}>
                      {store.components.map((el, i) => (
                        <div
                          key={i}
                          style={{
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#fafafa",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            width: "100%",
                            padding: 12,
                            gap: 12,
                            marginTop: 3,
                            marginBottom: 3,
                          }}
                        >
                          <div>
                            <TextV2
                              text={`номер:  `}
                              style={{
                                // border: "1px solid",
                                fontSize: 11,
                                textTransform: "uppercase",
                                color: "#718096",
                                fontWeight: 600,
                                letterSpacing: 0.5,
                              }}
                            />
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#1a202c",
                              }}
                            >
                              {el.privateNumber}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <InputV3
                              label="Вес в рецепте"
                              labelStyle={{ fontSize: 10, color: "#4a5568" }}
                              style={{ width: "70px " }}
                              validation={Number().isValid}
                              // initialValue={el.privateNumber}
                              value={el.weight
                                ?.shortToDecimalPlaces(2)
                                ?.toString()}
                              onChange={(val) => {
                                store.updateWeights(Number(val), i);
                              }}
                            />

                            {/* <Button
                              style={{ width: "150px" }}
                              text="добавить"
                            /> */}
                            <div
                              onClick={() => store.addComponentsToNewRecept(i)}
                              style={{
                                padding: "8px 12px",
                                fontSize: 13,
                                fontWeight: 500,
                                borderRadius: 6,
                                backgroundColor: "#f0f2f5",
                                color: "#4f46e5",
                                // height: 34,
                                position: "relative",
                                top: 8,
                                height: 40,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              добавить
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ width: "50%" }}>
                    {store.newReceptComponents.map((el, i) => {
                      return (
                        <>
                          <div
                            style={{
                              height: 80,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#fafafa",
                              border: "1px solid #e2e8f0",
                              borderRadius: 8,
                              width: "100%",
                              padding: 12,
                              gap: 12,
                              marginTop: 3,
                              marginBottom: 3,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: 11,
                                  textTransform: "uppercase",
                                  color: "#718096",
                                  fontWeight: 600,
                                  letterSpacing: 0.5,
                                }}
                              >
                                номер:{el.privateNumber}
                              </div>
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                }}
                              >
                                вес:{el.weight}
                              </div>
                            </div>
                            <div>
                              <Button
                                width={150}
                                type={ButtonType.delete}
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
      <M store={store} />
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
  const [isNeedEllipses, setIsNeedEllipses] = useState(false);

  return (
    <div
      key={index}
      onClick={() => setIsNeedEllipses(true)}
      suppressContentEditableWarning={true}
      contentEditable={true}
      onInput={(event) => {
        store.updateDust(event.currentTarget.innerText, index);
      }}
      style={{ border: "1px solid", width: 60 }}
    >
      {s !== undefined ? s : isNeedEllipses ? "" : "..."}
    </div>
  );
};
