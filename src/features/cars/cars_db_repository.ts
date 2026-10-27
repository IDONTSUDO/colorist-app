import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { CarsViewModel } from "./cars_model";

export class CarsDbRepository extends CrudIndexedDbRepository<CarsViewModel> {
    entity: ClassConstructor<CarsViewModel> = CarsViewModel;
}