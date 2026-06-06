import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { RecipesViewModel } from "./recipes_db_model";

export class RecipesDbRepository extends CrudIndexedDbRepository<RecipesViewModel> {
    entity: ClassConstructor<RecipesViewModel> = RecipesViewModel;
}