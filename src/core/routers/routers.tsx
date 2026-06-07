import { createHashRouter } from "react-router-dom";
import { publicRouters } from "./public_routers";
import type { JSX } from "react";

export interface IRouter {
  path: string;
  element: JSX.Element | undefined | JSX.Element[];
}
export const router = createHashRouter(publicRouters);
