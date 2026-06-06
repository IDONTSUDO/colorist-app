import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { ClientViewModel } from "./clients_db_model";

export class ClientsDbRepository extends CrudIndexedDbRepository<ClientViewModel> {
    entity: ClassConstructor<ClientViewModel> = ClientViewModel;
}