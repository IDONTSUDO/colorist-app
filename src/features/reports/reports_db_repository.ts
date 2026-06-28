import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { ReportsViewModel } from "./reports_db_model";

export class ReportsDbRepository extends CrudIndexedDbRepository<ReportsViewModel> {
    entity: ClassConstructor<ReportsViewModel> = ReportsViewModel;
}