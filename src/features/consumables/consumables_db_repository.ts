import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { ConsumablesViewModel } from "./consumables_db_model";

export class ConsumablesDbRepository extends CrudIndexedDbRepository<ConsumablesViewModel> {
    entity: ClassConstructor<ConsumablesViewModel> = ConsumablesViewModel;
}