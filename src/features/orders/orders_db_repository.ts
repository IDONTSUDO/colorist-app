import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { OrderViewModel } from "./orders_db_model";

export class OrdersDbRepository extends CrudIndexedDbRepository<OrderViewModel> {
    entity: ClassConstructor<OrderViewModel> = OrderViewModel;
}