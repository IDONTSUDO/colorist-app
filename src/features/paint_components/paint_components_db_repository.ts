import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { PaintComponentViewModel } from "./paint_components_db_model";


export class PaintComponentsDbRepository extends CrudIndexedDbRepository<PaintComponentViewModel> {
    entity: ClassConstructor<PaintComponentViewModel> = PaintComponentViewModel;
}