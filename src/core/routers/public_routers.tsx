import { ClientsPath, Clients } from "../../features/clients/clients";
import {
  ConsumablesPath,
  Consumables,
} from "../../features/consumables/consumables";
import { OrderPath, Order } from "../../features/order/order";
import { OrdersPath, Orders } from "../../features/orders/orders";
import {
  PaintsComponentPath,
  PaintsComponent,
} from "../../features/paint_components/paint_components";
import { RecipesPath, Recipes } from "../../features/recipes/recipes";
import { ReportsPath, Reports } from "../../features/reports/reports";
import type { IRouter } from "./routers";

export const publicRouters: IRouter[] = [
  {
    path: ClientsPath,
    element: <Clients />,
  },
  {
    path: PaintsComponentPath,
    element: <PaintsComponent />,
  },
  {
    path: OrdersPath,
    element: <Orders />,
  },
  {
    path: RecipesPath,
    element: <Recipes />,
  },
  { path: "/", element: <Orders /> },
  {
    path: OrderPath + "/:id",
    element: <Order />,
  },
  { path: ConsumablesPath, element: <Consumables /> },
  { path: ReportsPath, element: <Reports /> },
];
