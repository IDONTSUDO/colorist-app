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
import { Button } from "../button/Button";
import type { ClassConstructor } from "class-transformer";
import { Select } from "../select/select";
import React, { useEffect } from "react";
import { Icon, IconType } from "../icon/icon";
import { PaintsComponentPath } from "../../../features/paint_components/paint_components";
import { OrdersPath } from "../../../features/orders/orders";
import { useNavigate } from "react-router-dom";
import { ReportsPath } from "../../../features/reports/reports";
import { useInstallPWA } from "../../helper/use_install_pwa";
import { InputV3 } from "../input/input_v3";

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
  ];
export const CrudPage: React.FC<{
  feature: string;
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
  }) => {
    const n = useNavigate();
    const fieldReplace = searchByField[store.searchByField ?? ""];
    const { canInstall, install } = useInstallPWA();
    useEffect(() => {
      store.feature = feature;
    }, []);
    return (
      <div style={{ height: "100%" }}>
        {!canInstall && (
          <button onClick={install}>📲 Установить приложение</button>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
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
              <Icon type={el.icon} size={50} />
              <TextV2 text={el.name} />
            </div>
          ))}
        </div>
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            // justifyContent: "space-between",
          }}
        >
          <TextV2
            style={{ fontSize: 40, paddingLeft: 20 }}
            text={pageName ?? ""}
          />

          <div style={{ display: "flex" }}>
            {fieldReplace !== undefined ? (
              <>{fieldReplace()}</>
            ) : (
              <>
                <InputV3
                  style={{ width: "100%" }}
                  label="Поиск по полю"
                  onChange={(text) => store.findBy(text)}
                />
              </>
            )}

            <Button
              style={{ width: 150 }}
              text="Поиск"
              // color="cornflowerblue"
              onClick={() => store.onClickFindButton()}
            />
            <Select
              options={Object.keys(store.models()?.at(0) ?? {})
                .filter((el) => !missingKey?.includes(el))
                .map((el) => {
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
              label={""}
            />
            <div></div>
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
            <div style={{ display: "flex" }}>
              {isNeedDelete === undefined || isNeedDelete ? (
                <div onClick={() => store.setMode(CrudMode.delete)}>
                  <Button
                    text="Удалить"
                    width={100}
                    color={
                      store.currentMode === CrudMode.delete
                        ? "rgb(28 29 38)"
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
                      color={
                        store.currentMode === CrudMode.edit
                          ? "rgb(28 29 38)"
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

          <div style={{ height: "100%" }}>
            {store.isLoading &&
            store.models !== undefined &&
            store.models()?.at(0) !== undefined ? (
              <Loader />
            ) : (
              <>
                <CoreTable
                  addingColumns={addingColumns}
                  replacedJSXColumns={replacedJSXColumns}
                  missingKey={missingKey}
                  replacedColumns={replacedColumns}
                  mappedColumns={mappedColumns}
                  onClick={(index) => {
                    if (store.currentMode === CrudMode.edit) {
                      store.loadClassInstance(
                        instanceModel as ClassConstructor<any>,
                        store.models()!.at(index),
                      );
                      store.modalShow();
                    }
                    if (store.currentMode === CrudMode.delete) {
                      store.delete(store.models()!.at(index).id);
                    }
                  }}
                  columns={Object.keys(store.models()?.at(0) ?? {}).filter(
                    (el) => !missingKey?.includes(el),
                  )}
                  source={store.models() ?? []}
                />
                <Pagination store={store} />
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
