import "reflect-metadata";
import "antd/dist/antd.min.css";
import "./theme.css";

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./core/routers/routers";
import { extensions } from "./core/extensions/extensions";
import { AuthService } from "./core/service/auth_service";
import { configure } from "mobx";
import { ConfigProvider } from "antd";
import ruRU from "antd/es/locale/ru_RU";
import moment from "moment";
// @ts-ignore — у moment/dist/locale нет типов
import "moment/dist/locale/ru";

import { themeStore } from "./core/store/theme_store";
import { enableNumpadDecimalPoint } from "./core/helper/numpad_decimal";
import { setupPwaUpdates } from "./core/helper/pwa_update";
import { Database } from "@indexeddb-orm/idb-orm";
import { PaintComponentViewModel } from "./features/paint_components/paint_components_db_model";
import { ConsumablesViewModel } from "./features/consumables/consumables_db_model";
import { OrderViewModel } from "./features/orders/orders_db_model";
import { ClientViewModel } from "./features/clients/clients_db_model";
import { CarsViewModel } from "./features/cars/cars_model";
import { OrderHistoryViewModel } from "./features/order/order_history_db_model";

export const db = Database.createDatabase({
  name: "Colorist_calc",
  version: 5,
  entities: [
    ClientViewModel,
    PaintComponentViewModel,
    ConsumablesViewModel,
    OrderViewModel,
    CarsViewModel,
    OrderHistoryViewModel,
  ],
  config: {
    onSchemaChangeStrategy: "selective",
  },
});

configure({
  enforceActions: "never",
});
export const authService = new AuthService();
export { themeStore };

extensions();
enableNumpadDecimalPoint();
setupPwaUpdates();
moment.locale("ru");

createRoot(document.getElementById("root")!).render(
  <ConfigProvider locale={ruRU}>
    <RouterProvider router={router} />
  </ConfigProvider>,
);
