import type { IPagination } from "../../core/model/pagination";
import {
  CrudHttpRepository,
  HttpMethod,
} from "../../core/repository/http_repository";
import type { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import { RecipesViewModel } from "./recipes_store";

export class RecipesHttpRepository extends CrudHttpRepository<RecipesViewModel> {
  featurePath: string = "/recipes";
  findComponents = (value: string) =>
    this._jsonRequest<PaintComponentViewModel[]>(
      HttpMethod.POST,
      "/components/find",
      {
        prop: "privateNumber",
        value: value,
      }
    );
  getComponents = () =>
    this._jsonRequest<IPagination<PaintComponentViewModel>>(
      HttpMethod.GET,
      "/components?page=1"
    );
}
