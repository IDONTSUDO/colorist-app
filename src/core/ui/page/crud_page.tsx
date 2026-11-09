import {
  CrudFormLocalDbStore,
  CrudFormStore,
  CrudMode,
} from "../../store/base_store";
import { TextV2 } from "../text/text";
import { Loader } from "../loader/loader";
import { observer } from "mobx-react-lite";
import { CoreTable } from "../table/table";
import { ModalV2 } from "../modal/modal";
import { Pagination } from "../pagination/pagination";
import { Button, ButtonType } from "../button/Button";
import type { ClassConstructor } from "class-transformer";
import { Select } from "../select/select";
import React, { useEffect, useRef } from "react";
import { Icon, IconType } from "../icon/icon";
import { useNavigate } from "react-router-dom";
import { InputV3 } from "../input/input_v3";
import { OrdersPath } from "../../../features/orders/orders";
import { PaintsComponentPath } from "../../../features/paint_components/paint_components";
import { ReportsPath } from "../../../features/reports/reports";
import { SettingsPath } from "../../../features/settings/settings";
import { ThemeToggle } from "../theme_toggle/theme_toggle";

const pages: { icon: IconType; name: string; path?: string; fn?: Function }[] =
  [
    { icon: IconType.clients, name: "Клиенты", path: "/clients" },
    { icon: IconType.order, name: "Заказы", path: OrdersPath },
    // { icon: IconType.consumables, name: "Расходники", path: ConsumablesPath },
    {
      icon: IconType.components,
      name: "Компоненты",
      path: PaintsComponentPath,
    },
    // { icon: IconType.recipes, name: "Рецепты", path: RecipesPath },
    { icon: IconType.report, name: "Отчеты", path: ReportsPath },
    { icon: IconType.car, name: "Авто", path: "/cars" },
    { icon: IconType.settings, name: "Настройки", path: SettingsPath },
  ];
export const CrudPage: React.FC<{
  feature: string;
  // isNeedHttpError: boolean;
  isNeedTable?: boolean;
  body?: React.ReactNode;
  store: CrudFormStore<any, any> | CrudFormLocalDbStore<any, any>;
  missingKey?: string[];
  pageName?: string;
  instanceModel?: object;
  isEditable?: boolean;
  editableComponent?: React.ReactNode;
  createButton?: boolean;
  searchByField?: { [key: string]: () => React.ReactNode };
  isNeedDelete?: boolean;
  modalStyle?: React.CSSProperties;
  addingColumns?: { name: string; jsx: (el: any) => React.ReactNode }[];
  mappedColumns?: {
    name: string;
    mapper: (date: any) => React.ReactNode;
  }[];
  replacedJSXColumns?: { name: string; jsx: (p: any) => React.ReactNode }[];
  replacedColumns?:
    | {
        name: string;
        replace: string;
      }[]
    | undefined;
}> = observer(
  ({
    store,
    missingKey,
    replacedColumns,
    isEditable = true,
    searchByField = {},
    editableComponent,
    instanceModel,
    isNeedDelete,
    pageName,
    mappedColumns,
    modalStyle,
    replacedJSXColumns,
    addingColumns,
    feature,
    isNeedTable = true,
    body,
  }) => {
    const n = useNavigate();
    const isDeleteMode = store.currentMode === CrudMode.delete;
    const isEditMode = store.currentMode === CrudMode.edit;
    const modeInfo = isDeleteMode
      ? {
          color: "var(--tx-e11d48)",
          bg: "var(--bg-fff1f2)",
          border: "var(--bd-fecdd3)",
          rowHover: "var(--bg-ffe4e6)",
          title: "Режим удаления",
          hint: "нажмите на строку, чтобы удалить запись",
        }
      : isEditMode
        ? {
            color: "var(--tx-2563eb)",
            bg: "var(--bg-eff6ff)",
            border: "var(--bd-bfdbfe)",
            rowHover: "var(--bg-dbeafe)",
            title: "Режим редактирования",
            hint: "нажмите на строку, чтобы изменить запись",
          }
        : undefined;
    // Esc — выйти из режима удаления/редактирования
    useEffect(() => {
      if (store.currentMode === undefined) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !store.isModalOpen) {
          store.currentMode = undefined;
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [store.currentMode]);
    const fieldReplace = searchByField[store.searchByField ?? ""];
    // Поля берём из первой записи. Запоминаем их, чтобы при пустом
    // результате поиска не пропадали варианты в «Выбрать» и выбранное поле.
    const lastKeys = useRef<string[]>([]);
    // у сторов страниц без таблицы метода models может не быть
    const models: any[] | undefined =
      typeof store.models === "function" ? store.models() : undefined;
    const firstModel = models?.at(0);
    if (firstModel !== undefined) {
      lastKeys.current = Object.keys(firstModel);
    }
    const fieldKeys = lastKeys.current.filter(
      (el) => !missingKey?.includes(el),
    );
    const isEmpty = (models?.length ?? 0) === 0;
    useEffect(() => {
      store.feature = feature;
    }, []);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexShrink: 0,
            paddingLeft: 9,
            borderBottom: "1px solid var(--bd-oklch-92-9-0-013-255-508)",
          }}
        >
          {pages.map((el) => (
            <div
              onClick={() => {
                if (el.fn !== undefined) {
                  el.fn();
                }
                if (el.path !== undefined) {
                  n(el.path);
                }
              }}
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 10,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Icon
                color={pageName === el.name ? undefined : "#8fa1b9"}
                type={el.icon}
                size={25}
              />
              <TextV2
                color={pageName === el.name ? undefined : "#8fa1b9"}
                text={el.name}
              />
              <div style={{ height: 5 }}></div>
              <div
                style={{
                  borderBottom:
                    pageName !== el.name
                      ? undefined
                      : "2px solid var(--bd-oklch-20-8-0-042-265-755)",
                }}
              ></div>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingRight: 20,
            }}
          >
            <ThemeToggle />
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            paddingLeft: 20,
            paddingRight: 20,
            // justifyContent: "space-between",
          }}
        >
          <div style={{ height: 10 }} />
          <TextV2 style={{ fontSize: "1.5rem" }} text={pageName ?? ""} />
          <div style={{ height: 10 }} />

          {isNeedTable ? (
            <>
              <div style={{ display: "flex", width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "calc(0.25rem * 2)",
                    width: "100%",
                    alignItems: "center",
                  }}
                  className="1"
                >
                  {fieldReplace !== undefined ? (
                    <>{fieldReplace()}</>
                  ) : (
                    <>
                      <InputV3
                        style={{ width: "100%", height: 46 }}
                        placeHolderType=""
                        placeholder="Поиск по полю"
                        onChange={(text) => store.findBy(text)}
                      />
                    </>
                  )}
                  <Button
                    text="="
                    type={
                      store.onlyEqual ? ButtonType.gray : ButtonType.default
                    }
                    onClick={() => store.onClickOnlyEqual()}
                  />
                  <Button
                    text="Поиск"
                    type={ButtonType.gray}
                    onClick={() => store.onClickFindButton()}
                  />

                  <Select
                    style={{ width: "max-content" }}
                    options={fieldKeys.map((el) => {
                      return {
                        value: el,
                        label:
                          replacedColumns
                            ?.rFind<{
                              name: string;
                              replace: string;
                            }>((element) => element.name === el)
                            .fold(
                              (s) => s.replace,
                              (_) => el,
                            ) ?? "",
                      };
                    })}
                    value={store.searchByField ?? ""}
                    onChange={function (value: string): void {
                      store.searchByField = value;
                    }}
                    label="Искать по"
                  />
                </div>
                <div
                  style={{
                    width: 20,
                    textAlign: "center",
                    justifyItems: "center",
                    alignContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 1.5,
                      backgroundColor: "var(--bg-oklch-92-9-0-013-255-508)",
                      height: 18,
                    }}
                  ></div>
                </div>
                <div
                  className="2"
                  style={{
                    display: "flex",
                    gap: "calc(0.25rem * 2)",
                    alignItems: "center",
                  }}
                >
                  <div
                    onClick={() => {
                      // store.setMode(CrudMode.create);
                      // store.loadClassInstance(
                      //   instanceModel as ClassConstructor<any>,
                      //   {}
                      // );

                      store.modalShow();
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <Button text="Создать" width={100} />
                    </div>
                  </div>
                  {isNeedDelete === undefined || isNeedDelete ? (
                    <div onClick={() => store.setMode(CrudMode.delete)}>
                      <Button
                        text="Удалить"
                        type={ButtonType.delete}
                        width={100}
                        textColor={isDeleteMode ? "#fff" : undefined}
                        style={
                          isDeleteMode
                            ? {
                                backgroundColor: "#e11d48",
                                borderColor: "#e11d48",
                              }
                            : undefined
                        }
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  {isEditable ? (
                    <>
                      <div onClick={() => store.setMode(CrudMode.edit)}>
                        <Button
                          text="Редактировать"
                          width={130}
                          textColor={isEditMode ? "#fff" : undefined}
                          style={
                            isEditMode
                              ? {
                                  backgroundColor: "#2563eb",
                                  borderColor: "#2563eb",
                                }
                              : undefined
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </>
          ) : (
            <> </>
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              paddingBottom: 10,
            }}
          >
            {store.isLoading && firstModel !== undefined ? (
              <Loader />
            ) : (
              <>
                {isNeedTable ? (
                  <>
                    {modeInfo !== undefined ? (
                      <div
                        style={{
                          marginTop: 12,
                          marginBottom: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 8px 8px 14px",
                          background: modeInfo.bg,
                          border: `1px solid ${modeInfo.border}`,
                          borderLeft: `4px solid ${modeInfo.color}`,
                          borderRadius: 6,
                          fontFamily: "system-ui",
                          fontSize: 14,
                          color: "var(--tx-oklch-37-2-0-044-257-287)",
                        }}
                      >
                        <span
                          style={{ fontWeight: 600, color: modeInfo.color }}
                        >
                          {modeInfo.title}
                        </span>
                        <span>— {modeInfo.hint}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ color: "var(--tx-8fa1b9)", fontSize: 12 }}>
                          Esc
                        </span>
                        <div
                          onClick={() => (store.currentMode = undefined)}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 5,
                            background: "var(--bg-fff)",
                            border: `1px solid ${modeInfo.border}`,
                            color: modeInfo.color,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Отмена
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: 20 }} className="1"></div>
                    )}
                    {isEmpty ? (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid var(--bd-oklch-92-9-0-013-255-508)",
                          borderRadius: 6,
                          color: "var(--tx-8fa1b9)",
                          fontSize: 18,
                        }}
                      >
                        Ничего не найдено
                      </div>
                    ) : (
                      <CoreTable
                        rowHoverColor={modeInfo?.rowHover}
                        addingColumns={addingColumns}
                        replacedJSXColumns={replacedJSXColumns}
                        missingKey={missingKey}
                        replacedColumns={replacedColumns}
                        mappedColumns={mappedColumns}
                        onClick={(index) => {
                          if (store.currentMode === CrudMode.edit) {
                            store.loadClassInstance(
                              instanceModel as ClassConstructor<any>,
                              models!.at(index),
                            );
                            // if(this.viewModel)
                            if (Object.hasOwn(store.viewModel, "fromServer")) {
                              store.viewModel.fromServer();
                            }
                            store.modalShow();
                          }
                          if (store.currentMode === CrudMode.delete) {
                            store.delete(models!.at(index).id);
                          }
                        }}
                        columns={fieldKeys}
                        source={models ?? []}
                      />
                    )}
                    <Pagination store={store} />
                  </>
                ) : (
                  <>{body}</>
                )}
              </>
            )}
          </div>
        </div>

        <ModalV2
          style={modalStyle}
          isOpen={store.isModalOpen}
          onClose={() => {
            // @ts-expect-error
            store.viewModel = new instanceModel();
            store.modalCancel();
          }}
          children={<>{editableComponent}</>}
        />
      </div>
    );
  },
);
