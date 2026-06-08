import "reflect-metadata";
import "antd/dist/antd.min.css";

import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./core/routers/routers";
import { extensions } from "./core/extensions/extensions";
import { AuthService } from "./core/service/auth_service";
import { configure } from "mobx";

import { ThemeStore } from "./core/store/theme_store";
import { Database } from "@indexeddb-orm/idb-orm";
import { PaintComponentViewModel } from "./features/paint_components/paint_components_db_model";
import { ConsumablesViewModel } from "./features/consumables/consumables_db_model";
import { OrderViewModel } from "./features/orders/orders_db_model";
import { ClientViewModel } from "./features/clients/clients_db_model";

export const db = Database.createDatabase({
  name: "MyApp",
  version: 5,
  entities: [
    ClientViewModel,
    PaintComponentViewModel,
    ConsumablesViewModel,
    OrderViewModel,
  ],
  config: {
    onSchemaChangeStrategy: "selective",
  },
});

configure({
  enforceActions: "never",
});
export const authService = new AuthService();
export const themeStore = new ThemeStore();

extensions();

createRoot(document.getElementById("root")!).render(
  <>
    <RouterProvider router={router} />
  </>,
);
