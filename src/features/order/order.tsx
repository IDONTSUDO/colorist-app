import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { OrderMapper, OrderMode, OrderStore } from "./order_store";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OrdersPath } from "../orders/orders";
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
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import { plainToClass } from "class-transformer";
import { Popover } from "antd";
import { downloadOrderDoc } from "./order_print";
import { PaintConsistencyPicker } from "../orders/paint_consistency";
import { orderTabsStore } from "./order_tabs_store";
import { OrderTabs } from "./ui/order_tabs";

export const OrderPath = "/order";

// key={id}: при переходе на другой номер заказа экран и стор создаются заново
export const Order = () => {
  const { id } = useParams();
  // открытый заказ всегда попадает во вкладки
  useEffect(() => {
    orderTabsStore.open(Number(id));
  }, [id]);
  return <OrderScreen key={id} />;
};

const OrderNotFound: React.FC<{ id?: string }> = ({ id }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const open = () => {
    const n = Number(value.trim());
    if (!Number.isInteger(n) || n <= 0) return;
    navigate(OrderPath + "/" + n);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: "#fafafa",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 24,
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: "#111111" }}>
          Заказ {id ? `№${id} ` : ""}не найден
        </div>
        <div style={{ fontSize: 14, color: "#4a5568" }}>
          Такого заказа нет. Введите другой номер заказа.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            autoFocus
            inputMode="numeric"
            placeholder="Номер заказа"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") open();
            }}
            style={{
              flex: 1,
              padding: "10px 12px",
              fontSize: 15,
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              backgroundColor: "#ffffff",
              color: "#1a202c",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={open}
            disabled={value === ""}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              backgroundColor: value === "" ? "#c7c9f5" : "#4f46e5",
              color: "#ffffff",
              cursor: value === "" ? "default" : "pointer",
            }}
          >
            Открыть
          </button>
        </div>
        <div
          onClick={() => navigate(OrdersPath)}
          style={{
            fontSize: 14,
            color: "#4f46e5",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          ← к списку заказов
        </div>
      </div>
    </div>
  );
};

const OrderScreen = observer(() => {
  const store = useStore(OrderStore);
  const { id } = useParams();

  useEffect(() => {
    store.initParams(id as string);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA")
      )
        return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        store.redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    // несуществующий заказ не держим во вкладках
    if (store.notFound) orderTabsStore.close(Number(id));
  }, [store.notFound]);
  if (store.notFound) return <OrderNotFound id={id} />;
  return (
    <>
      {store.isLoading ? (
        <Loader />
      ) : (
        <>
          <Menu
            top={<OrderTabs activeId={Number(id)} />}
            right={
              <>
                <div style={{ display: "flex", width: "max-content" }}>
                  <HistoryButton
                    text="↶ Отменить"
                    title="Отменить (Cmd/Ctrl+Z)"
                    disabled={!store.history.canUndo}
                    onClick={() => store.undo()}
                  />
                  <div style={{ width: 6 }}></div>
                  <HistoryButton
                    text="↷ Повторить"
                    title="Повторить (Cmd/Ctrl+Shift+Z)"
                    disabled={!store.history.canRedo}
                    onClick={() => store.redo()}
                  />
                  <div style={{ width: 20 }}></div>
                  {store.componentsAddInRecept.isNotEmpty() ? (
                    <>
                      <div
                        title="скачать таблицу рецептов заказа в .doc"
                        onClick={() => downloadOrderDoc(store)}
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
                      >
                        распечатать
                      </div>
                      <div style={{ width: 10 }}></div>
                    </>
                  ) : (
                    <></>
                  )}
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
                          // padding:  "10px 18px",
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
                      <div style={{ width: 10 }}></div>
                      <div
                        title="нажмите на таблицу слива — его граммовка станет новым шагом рецепта"
                        style={{
                          padding: "10px 18px",
                          borderRadius: "8px",
                          fontSize: 14,
                          fontWeight: 500,
                          alignContent: "center",
                          cursor: "pointer",
                          border: "none",
                          backgroundColor: store.isDrainSelectMode
                            ? "rgb(79, 70, 229)"
                            : "rgb(240, 242, 245)",
                          color: store.isDrainSelectMode
                            ? "white"
                            : "rgb(74, 85, 104)",
                          transition: "all 0.2s",
                        }}
                        onClick={() => store.toggleDrainSelectMode()}
                      >
                        выбрать слив
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

                                {store.isNeedSaveButton === true ? (
                                  <div
                                    onClick={() => store.recalculate()}
                                    style={{
                                      padding: 10,
                                      width: "min-content",
                                      marginBottom: 10,
                                      borderRadius: 6,
                                      backgroundColor: "#4f46e5",
                                      color: "white",
                                      cursor: "pointer",
                                    }}
                                  >
                                    сохранить
                                  </div>
                                ) : (
                                  <></>
                                )}
                                <div style={{ display: "flex" }}>
                                  <div>
                                    {store
                                      .getComponentsReceptUniq()
                                      .isNotEmpty() ? (
                                      <>
                                        {/* пустая ячейка над «компоненты» под строку номеров рецептов */}
                                        <div
                                          style={{
                                            height: RECEPT_NUMBER_HEIGHT,
                                          }}
                                        />
                                        <div
                                          style={{
                                            fontSize: 12,
                                            height: 23,
                                            textAlignLast: "center",
                                            border: "1px solid",
                                          }}
                                        >
                                          компоненты
                                        </div>
                                      </>
                                    ) : (
                                      <></>
                                    )}

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
                                    <ComponentsUsageTable store={store} />
                                  </div>
                                  <div style={{ display: "flex" }}>
                                    {/* {store.componentsAddInRecept.map(
                                      (orderMapper, index) => {
                                        return (
                                          <div style={{ display: "flex" }}>
                                            {orderMapper.balance.map((el) => (
                                              <div>321</div>
                                            ))}
                                          </div>
                                        );
                                      },
                                    )} */}
                                    {store.componentsAddInRecept.map(
                                      (orderMapper, index) => {
                                        return (
                                          <div
                                            // после undo/redo пересоздаем ячейки:
                                            // contentEditable не перечитывает значения сам
                                            key={`${store.historyVersion}-${index}`}
                                            onClick={() =>
                                              store.setSelectRecept(index)
                                            }
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                            }}
                                          >
                                            {index === 0 ? (
                                              <></>
                                            ) : (
                                              <>
                                                <div
                                                  style={{ display: "flex" }}
                                                >
                                                  <div className="55">
                                                    {/* номер отпыла — над «вес комп.» и «остаток» */}
                                                    <ReceptNumber
                                                      store={store}
                                                      number={index}
                                                      orderMapper={orderMapper}
                                                      isSelected={
                                                        store.selectReceptIndex ===
                                                        index
                                                      }
                                                    />
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          fontSize: 11,
                                                          width: 60,
                                                          height: 23,
                                                          textAlignLast:
                                                            "center",
                                                          border: "1px solid",
                                                          ...fromDrainHeaderStyle(
                                                            orderMapper,
                                                          ),
                                                        }}
                                                        title={fromDrainTitle(
                                                          orderMapper,
                                                        )}
                                                      >
                                                        вес комп.
                                                      </div>
                                                      <div
                                                        style={{
                                                          fontSize: 12,
                                                          width: 60,
                                                          border: "1px solid",
                                                          height: 23,

                                                          textAlignLast:
                                                            "center",
                                                          ...fromDrainHeaderStyle(
                                                            orderMapper,
                                                          ),
                                                        }}
                                                        title={fromDrainTitle(
                                                          orderMapper,
                                                        )}
                                                      >
                                                        остаток
                                                      </div>
                                                    </div>
                                                    {orderMapper.balance.map(
                                                      (paint, subIndex) => (
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
                                                            <ComponentWeight
                                                              store={store}
                                                              paint={paint}
                                                              index={index}
                                                              subIndex={
                                                                subIndex
                                                              }
                                                            />
                                                            <div
                                                              className="1"
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
                                                              {(
                                                                ((paint.weightCalcRecept ??
                                                                  0) /
                                                                  orderMapper.balance
                                                                    .reduce(
                                                                      (
                                                                        el,
                                                                        acc,
                                                                      ) => {
                                                                        return (
                                                                          el +
                                                                          (acc.weight ??
                                                                            0)
                                                                        );
                                                                      },
                                                                      0,
                                                                    )
                                                                    .shortToDecimalPlaces(
                                                                      2,
                                                                    )) *
                                                                (orderMapper.balance
                                                                  .reduce(
                                                                    (
                                                                      el,
                                                                      acc,
                                                                    ) => {
                                                                      return (
                                                                        el +
                                                                        (acc.weight ??
                                                                          0)
                                                                      );
                                                                    },
                                                                    0,
                                                                  )
                                                                  .shortToDecimalPlaces(
                                                                    2,
                                                                  ) -
                                                                  orderMapper
                                                                    .getBalance(
                                                                      store,
                                                                    )
                                                                    .shortToDecimalPlaces(
                                                                      2,
                                                                    ))
                                                              ).shortToDecimalPlaces(
                                                                2,
                                                              )}
                                                              <div></div>
                                                            </div>
                                                          </div>
                                                        </>
                                                      ),
                                                    )}

                                                    <div className="общий_вес_комопнентов">
                                                      <div
                                                        style={{
                                                          display: "flex",
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            width: 60,
                                                            border:
                                                              "1px solid black",
                                                            background: "black",
                                                            color: "white",
                                                          }}
                                                        >
                                                          {orderMapper.getCommonW()}
                                                        </div>
                                                        <div
                                                          style={{
                                                            width: 60,
                                                            border:
                                                              "1px solid black",
                                                            background: "black",
                                                            color: "white",
                                                          }}
                                                        >
                                                          {orderMapper.getCommonL(
                                                            store,
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div></div>
                                                    <div
                                                      style={{
                                                        display: "flex",
                                                      }}
                                                    >
                                                      <div>
                                                        <div
                                                          style={{
                                                            border: "1px solid",
                                                            width: 60,
                                                            backgroundColor:
                                                              store.selectReceptIndex ===
                                                              index
                                                                ? "#d0ff49"
                                                                : "",
                                                            fontSize: 8,
                                                            height: 24,
                                                          }}
                                                        >
                                                          <div>вес</div>
                                                          <div>остатка</div>
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
                                                            fontSize: 9,
                                                            height: 24,
                                                          }}
                                                        >
                                                          отпыл расх
                                                        </div>
                                                      </div>
                                                      <div>
                                                        <Dust
                                                          store={store}
                                                          ele={orderMapper}
                                                          index={index}
                                                        />
                                                        <div
                                                          style={{
                                                            border:
                                                              "1px solid black",
                                                          }}
                                                          className="оптыл расх"
                                                        >
                                                          {orderMapper
                                                            .getBalance(store)
                                                            .shortToDecimalPlaces(
                                                              2,
                                                            )}{" "}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <DrainTable
                                                      store={store}
                                                      orderMapper={orderMapper}
                                                      index={index}
                                                      number={index}
                                                    />

                                                    {/* <div className="обьем">
                                                    {orderMapper.balance
                                                      .reduce((el, acc) => {
                                                        return (
                                                          el + (acc.weight ?? 0)
                                                        );
                                                      }, 0)
                                                      .shortToDecimalPlaces(2)}
                                                  </div> */}
                                                  </div>
                                                  <div
                                                    className="3"
                                                    style={{ width: 60 }}
                                                  >
                                                    {/* пустое место над «добавка» под строку номера */}
                                                    <div
                                                      style={{
                                                        height:
                                                          RECEPT_NUMBER_HEIGHT,
                                                      }}
                                                    />
                                                    <div className="2">
                                                      <div
                                                        style={{
                                                          fontSize: 12,
                                                          width: 60,
                                                          border: "1px solid",
                                                          height: 23,
                                                          textAlignLast:
                                                            "center",
                                                          ...fromDrainHeaderStyle(
                                                            orderMapper,
                                                          ),
                                                        }}
                                                        title={fromDrainTitle(
                                                          orderMapper,
                                                        )}
                                                      >
                                                        добавка
                                                      </div>

                                                      {orderMapper.balance.map(
                                                        (paint, indexPaint) => (
                                                          <>
                                                            <div
                                                              style={{
                                                                display: "flex",
                                                              }}
                                                              className="1"
                                                            >
                                                              <PaintMapper
                                                                index={
                                                                  indexPaint
                                                                }
                                                                paint={paint}
                                                                orderMapper={
                                                                  orderMapper
                                                                }
                                                                isLast={
                                                                  store
                                                                    .componentsAddInRecept
                                                                    .length -
                                                                    1 ===
                                                                  index
                                                                }
                                                                store={store}
                                                              />
                                                            </div>
                                                          </>
                                                        ),
                                                      )}
                                                    </div>
                                                    {/*todo */}
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
                              {/* <div style={{}}>
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
                              </div> */}
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
                                    <div
                                      key={store.historyVersion}
                                      style={{
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
                                      // onInput={(event) => {
                                      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                      //   store.updateWeightContainers(
                                      //     // @ts-expect-error
                                      //     event.target.innerText,
                                      //   );
                                      // }}
                                      onKeyDown={(event) => {
                                        const allowedKeys = [
                                          "Backspace",
                                          "Delete",
                                          "ArrowLeft",
                                          "ArrowRight",
                                          "Tab",
                                          ".",
                                          ",",
                                          "ю",
                                          "б",
                                          "Ю",
                                          "Б",
                                        ];
                                        const isNumber = /[0-9]/.test(
                                          event.key,
                                        );

                                        if (
                                          !isNumber &&
                                          !allowedKeys.includes(event.key)
                                        ) {
                                          event.preventDefault();
                                        }

                                        const target =
                                          event.target as HTMLDivElement;
                                        if (
                                          sanitizeDecimal(event.key) === "." &&
                                          sanitizeDecimal(
                                            target.innerText,
                                          ).includes(".")
                                        ) {
                                          event.preventDefault();
                                        }
                                      }}
                                      onBlur={(event) => {
                                        const target =
                                          event.target as HTMLDivElement;
                                        const validValue = sanitizeDecimal(
                                          target.innerText,
                                        );
                                        store.updateWeightContainers(
                                          validValue,
                                        );
                                      }}
                                      suppressContentEditableWarning={true}
                                      contentEditable={true}
                                    >
                                      {store.weightContainers
                                        .shortToDecimalPlaces(2)
                                        .toString()}
                                    </div>

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
                              <div style={{ height: 10 }}></div>
                              <div style={{ maxWidth: 400 }}>
                                <PaintConsistencyPicker
                                  value={store.viewModel.paintConsistency}
                                  onChange={(value) => {
                                    store.updateForm({
                                      paintConsistency: value,
                                    });
                                    store.updateOrder();
                                  }}
                                />
                              </div>
                              <div style={{ height: 10 }}></div>
                              <div
                                onClick={() => store.resetOrderModalShow()}
                                style={{
                                  fontSize: 10,
                                  fontWeight: 100,
                                  cursor: "pointer",
                                }}
                              >
                                Сброс заказа *
                              </div>
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
                                  onChange={(e) =>
                                    store.updateOrderStatus(e.target.value)
                                  }
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
                                {store.viewModel.readyAt ? (
                                  <div
                                    style={{
                                      marginTop: 8,
                                      fontSize: 13,
                                      color: "#4a5568",
                                    }}
                                  >
                                    Дата готовности:{" "}
                                    {new Date(
                                      store.viewModel.readyAt,
                                    ).toLocaleString()}
                                  </div>
                                ) : (
                                  <></>
                                )}
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
        children={
          <>
            <div style={{}}>
              <div style={{ fontSize: 15, fontWeight: 300 }}>
                вы уверены что хотите сбросить заказ?
              </div>
              <Button text="да" onClick={() => store.resetOrder()} />
              <Button
                text="нет"
                onClick={() => {
                  store.resetOrderModalIsShow = false;
                }}
              />
            </div>
          </>
        }
        isOpen={store.resetOrderModalIsShow}
        onClose={() => {
          store.resetOrderModalIsShow = false;
        }}
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
}> = observer(({ store, index, ele }) => {
  // вес остатка правим только у последнего отпыла
  const isLast = index === store.componentsAddInRecept.length - 1;
  return (
    <DrainCell
      style={{ border: "1px solid", width: 60, boxSizing: "border-box" }}
      value={
        ele.dust !== undefined && ele.dust !== "" ? Number(ele.dust) : undefined
      }
      placeholder={isLast ? "..." : ""}
      disabled={!isLast}
      title={
        isLast ? undefined : "Вес остатка редактируется только на последнем отпыле"
      }
      onChange={(text) => store.updateDust(text, index)}
    />
  );
});
const PaintMapper: React.FC<{
  paint: PaintComponentViewModel;
  orderMapper: OrderMapper;
  store: OrderStore;
  isLast: boolean;
  index: number;
}> = observer(({ orderMapper, paint, store, index, isLast }) => {
  const [isNeedEllipses, setIsNeedEllipses] = useState(true);

  return (
    <>
      <div
        contentEditable={isLast}
        suppressContentEditableWarning={true}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (orderMapper.addingComponents.length !== 0) {
              store.recalculate();
              store.isNeedSaveButton = false;
            }
            // todo
          }
        }}
        onInput={(event) => {
          const target = event.target as HTMLDivElement;
          let value = target.innerText;

          value = value.replace(/,/g, ".");

          value = value.replace(/[^0-9.]/g, "");

          const parts = value.split(".");
          if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
          }

          if (target.innerText !== value) {
            target.innerText = value;
          }
          store.isNeedSaveButton = true;
          if (orderMapper.addingComponents.length === 0) {
            orderMapper.addingComponents = orderMapper.addingComponents.fill(
              new PaintComponentViewModel(),
              0,
              orderMapper.balance.length,
            );
          }
          const p = plainToClass(
            PaintComponentViewModel,
            JSON.parse(JSON.stringify(paint)),
          );
          if (event.currentTarget.innerText.trim() === "") {
            // ячейку очистили — добавки нет (иначе осталась бы копия веса)
            p.weight = undefined;
          } else if (Number().isValid(event.currentTarget.innerText)) {
            p.weight = Number(event.currentTarget.innerText);
          }
          orderMapper.addingComponents[index] = p;
          if (
            orderMapper.addingComponents.length !== orderMapper.balance.length
          ) {
            Array.from(
              {
                length:
                  orderMapper.balance.length -
                  orderMapper.addingComponents.length,
              },
              (_, index) => index,
            ).forEach((_) =>
              orderMapper.addingComponents.push(new PaintComponentViewModel()),
            );
          }
          // сохраняем введённую добавку в базу сразу, не дожидаясь пересчёта
          store.updateOrder();
        }}
        style={{
          border: "1px solid",
          width: 60,
          height: 23.81,
          // backgroundColor:
          //   paint.privateNumber === orderMapper.add.privateNumber
          //     ? "#4f46e540"
          //     : undefined,
        }}
        onClick={() => {
          if (paint.privateNumber !== orderMapper.add.privateNumber && isLast)
            setIsNeedEllipses(false);
        }}
      >
        <div>
          {isNeedEllipses ? (
            <>
              {orderMapper.addingComponents[index]?.weight !== undefined
                ? orderMapper.addingComponents[index]?.weight
                : "- "}
            </>
          ) : (
            " "
          )}
        </div>
      </div>
    </>
  );
});
const ComponentWeight: React.FC<{
  store: OrderStore;
  paint: PaintComponentViewModel;
  index: number;
  subIndex: number;
}> = observer(({ store, paint, index, subIndex }) => {
  const style: React.CSSProperties = {
    border: "1px solid",
    width: 60,
    boxSizing: "border-box",
    backgroundColor: store.selectReceptIndex === index ? "#d0ff49" : "",
  };
  const isEditable = index === 1 && store.componentsAddInRecept.length === 2;
  if (!isEditable) {
    return (
      <div className="остаток" style={style}>
        {paint.weightCalcRecept?.shortToDecimalPlaces(2)}
      </div>
    );
  }
  return (
    <DrainCell
      style={style}
      value={paint.weightCalcRecept}
      onChange={(text) => store.componenstDefaultReceptUpdate(text, subIndex)}
    />
  );
});

const HistoryButton: React.FC<{
  text: string;
  title: string;
  disabled: boolean;
  onClick: () => void;
}> = ({ text, title, disabled, onClick }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    style={{
      padding: "10px 14px",
      borderRadius: "8px",
      fontSize: 14,
      fontWeight: 500,
      border: "none",
      backgroundColor: "rgb(240, 242, 245)",
      color: "rgb(74, 85, 104)",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "opacity 0.2s",
    }}
  >
    {text}
  </button>
);

// ячейка-поле: пока в фокусе — показывает то, что вводят, иначе — текущее значение из стора
// высота строки в таблицах сливов и «общий расход пигментов»
const DRAIN_ROW_H = 26;

// таблица «общий расход пигментов» под столбцом «компоненты»
const ComponentsUsageTable: React.FC<{ store: OrderStore }> = observer(
  ({ store }) => {
    if (store.componentsAddInRecept.length < 2) return <></>;
    const usage = store.getComponentsUsage();
    const total = usage.reduce((acc, el) => acc + el.weight, 0);
    // та же высота строк, что у таблиц сливов — строки пигментов стоят вровень
    const cell: React.CSSProperties = {
      border: "1px solid",
      width: 60,
      height: DRAIN_ROW_H,
      boxSizing: "border-box",
      overflow: "hidden",
    };
    return (
      <>
        {/* невидимые строки той же высоты, что итоги/«вес остатка»/«отпыл расх»
            в колонках рецептов — чтобы таблица стояла на уровне таблиц сливов */}
        <div style={{ visibility: "hidden" }} aria-hidden>
          <div style={{ border: "1px solid", width: 60 }}>0</div>
          <div style={{ border: "1px solid", width: 60, height: 24 }} />
          <div style={{ border: "1px solid", width: 60, height: 24 }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              ...cell,
              width: 120,
              // = шапка «N слив» + строка «грамм по рецепту»
              height: DRAIN_ROW_H * 2,
              fontSize: 12,
              lineHeight: "16px",
              textAlign: "center",
              // fontWeight: 600,
              backgroundColor: "#f0f2f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="сколько каждого пигмента ушло в заказ: исходный рецепт + все добавки"
          >
            общий расход пигментов
          </div>
          {usage.map((el) => (
            <div key={el.privateNumber} style={{ display: "flex" }}>
              <div
                style={{
                  ...cell,
                  border: "1px solid black",
                  backgroundColor: "black",
                  color: "white",
                }}
              >
                {el.privateNumber}
              </div>
              <div style={cell}>{el.weight.shortToDecimalPlaces(2)}</div>
            </div>
          ))}
          <div style={{ display: "flex" }}>
            <div
              style={{
                ...cell,
                border: "1px solid black",
                background: "black",
                color: "white",
                fontSize: 11,
              }}
            >
              всего
            </div>
            <div
              style={{
                ...cell,
                border: "1px solid black",
                background: "black",
                color: "white",
              }}
            >
              {total.shortToDecimalPlaces(2)}
            </div>
          </div>
        </div>
      </>
    );
  },
);

// номер рецепта (шага) над колонкой — та же нумерация, что у сливов
const RECEPT_NUMBER_HEIGHT = 26;
const ReceptNumber: React.FC<{
  number: number;
  orderMapper: OrderMapper;
  isSelected: boolean;
  store: OrderStore;
}> = observer(({ number, orderMapper, isSelected, store }) => {
  const fromDrain =
    orderMapper.fromDrain !== undefined && orderMapper.fromDrain !== null
      ? orderMapper.fromDrain
      : undefined;
  const label = (
    <div
      style={{
        height: RECEPT_NUMBER_HEIGHT,
        // ширина — по двум столбцам под ней, подпись не растягивает колонку
        width: 0,
        minWidth: "100%",
        boxSizing: "border-box",
        border: "1px solid",
        borderBottom: "none",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: `${RECEPT_NUMBER_HEIGHT - 2}px`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        cursor: fromDrain !== undefined ? "help" : undefined,
        backgroundColor: isSelected
          ? "#d0ff49"
          : fromDrain !== undefined
            ? DRAIN_APPLIED_BG
            : "#f0f2f5",
      }}
    >
      Отпыл {number}
    </div>
  );
  if (fromDrain === undefined) return label;

  const source = store.componentsAddInRecept.at(fromDrain);
  return (
    <Popover
      trigger="hover"
      placement="top"
      mouseEnterDelay={0.15}
      title={`Отпыл ${number}`}
      content={
        <div style={{ fontSize: 13 }}>
          Создан из <b>{fromDrain} слива</b>
          {source?.drainWeight ? (
            <> — {source.drainWeight.shortToDecimalPlaces(2)} г по рецепту</>
          ) : (
            <></>
          )}
        </div>
      }
    >
      {label}
    </Popover>
  );
});

// колонка рецепта, созданная из слива, — зелёная шапка
const DRAIN_APPLIED_BG = "#bbf7d0";
const fromDrainHeaderStyle = (m: OrderMapper): React.CSSProperties =>
  m.fromDrain !== undefined && m.fromDrain !== null
    ? { backgroundColor: DRAIN_APPLIED_BG, fontWeight: 600 }
    : {};
const fromDrainTitle = (m: OrderMapper): string | undefined =>
  m.fromDrain !== undefined && m.fromDrain !== null
    ? `шаг создан из ${m.fromDrain} слива`
    : undefined;

// дробное число из ввода. На Windows с русской раскладкой точка вводится как
// «,» (Num Del), а клавиша «.» английской раскладки даёт «ю» (Shift — «Ю»),
// соседняя «,» — «б». Всё это считаем десятичной точкой.
export const sanitizeDecimal = (raw: string): string => {
  let v = raw.replace(/[,юбЮБ]/g, ".").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
  return v;
};

const DrainCell: React.FC<{
  value?: number;
  onChange: (text: string) => void;
  style: React.CSSProperties;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
}> = observer(({ value, onChange, style, title, placeholder, disabled }) => {
  const [text, setText] = useState<string | null>(null);
  const shown =
    text ?? (value !== undefined ? String(value.shortToDecimalPlaces(2)) : "");
  return (
    <input
      title={title}
      placeholder={placeholder}
      value={shown}
      inputMode="decimal"
      disabled={disabled}
      onFocus={() => setText(shown)}
      onBlur={() => setText(null)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
      onChange={(event) => {
        const v = sanitizeDecimal(event.target.value);
        setText(v);
        onChange(v);
      }}
      style={{
        ...style,
        font: "inherit",
        padding: 0,
        borderRadius: 0,
        backgroundColor: disabled
          ? "#f1f5f9"
          : style.backgroundColor || "#fff",
        color: "inherit",
        outline: "none",
        cursor: disabled ? "not-allowed" : undefined,
      }}
    />
  );
});

// таблица слива под каждым рецептом: ввод веса слива + раскладка по компонентам
const DrainTable: React.FC<{
  store: OrderStore;
  orderMapper: OrderMapper;
  index: number;
  number: number;
}> = observer(({ store, orderMapper, index, number }) => {
  const isSelected = store.selectReceptIndex === index;
  // слив уже перенесён в рецепт (и та колонка ещё существует)
  const isApplied =
    orderMapper.drainAppliedTo !== undefined &&
    orderMapper.drainAppliedTo !== null &&
    store.componentsAddInRecept.at(orderMapper.drainAppliedTo)?.fromDrain ===
      index;
  const cell: React.CSSProperties = {
    border: "1px solid",
    width: 60,
    height: DRAIN_ROW_H,
    boxSizing: "border-box",
    overflow: "hidden",
  };

  // перенести можно слив с введёнными граммами
  const canApply = !!orderMapper.drainWeight;

  return (
    <div
      title={
        store.isDrainSelectMode
          ? canApply
            ? "нажмите, чтобы добавить слив в добавку и создать новый отпыл"
            : "сначала введите грамм по рецепту"
          : undefined
      }
      onClick={(e) => {
        e.stopPropagation();
        if (store.isDrainSelectMode) store.applyDrainToRecept(index);
      }}
      style={{
        marginTop: 10,
        cursor: store.isDrainSelectMode
          ? canApply
            ? "pointer"
            : "not-allowed"
          : undefined,
        outline: store.isDrainSelectMode
          ? canApply
            ? "3px solid #4f46e5"
            : "3px dashed #cbd5e1"
          : isApplied
            ? "3px solid #22c55e"
            : undefined,
        outlineOffset: 2,
        opacity: store.isDrainSelectMode && !canApply ? 0.6 : 1,
      }}
    >
      <div
        style={{
          ...cell,
          width: 120,
          fontSize: 12,
          textAlign: "center",
          fontWeight: isApplied ? 600 : undefined,
          backgroundColor: isApplied
            ? DRAIN_APPLIED_BG
            : isSelected
              ? "#d0ff49"
              : "",
        }}
        title={
          isApplied
            ? `слив перенесён в рецепт — колонка ${orderMapper.drainAppliedTo}`
            : undefined
        }
      >
        {number} слив
        {isApplied ? " ✓ в рецепте" : ""}
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ ...cell, fontSize: 9, lineHeight: "11px" }}>
          грамм по рецепту
        </div>
        <DrainCell
          title="сколько грамм слить по рецепту"
          style={cell}
          value={orderMapper.drainWeight}
          onChange={(text) => store.updateDrainWeight(index, text)}
        />
      </div>
      {orderMapper.getDrain().map((el, i) => (
        <div key={i} style={{ display: "flex" }}>
          <div
            style={{
              ...cell,
              border: "1px solid black",
              backgroundColor: "black",
              color: "white",
            }}
          >
            {el.privateNumber}
          </div>
          <DrainCell
            title={
              orderMapper.drainWeight
                ? "вес компонента — общий вес слива не меняется, остальные пересчитаются по рецепту"
                : "сначала введите грамм по рецепту"
            }
            disabled={!orderMapper.drainWeight}
            style={{
              ...cell,
              fontWeight: el.edited ? 700 : undefined,
              boxShadow: el.edited ? "inset 0 0 0 2px #4f46e5" : undefined,
            }}
            value={orderMapper.drainWeight ? el.weight : undefined}
            onChange={(text) => store.updateDrainByComponent(index, i, text)}
          />
        </div>
      ))}
      {orderMapper.hasDrainOverrides() ? (
        <div
          onClick={() => store.resetDrainComponents(index)}
          style={{
            fontSize: 11,
            marginTop: 4,
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          сбросить по рецепту
        </div>
      ) : (
        <></>
      )}
    </div>
  );
});
