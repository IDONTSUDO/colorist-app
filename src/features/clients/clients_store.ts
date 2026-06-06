import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormLocalDbStore } from "../../core/store/base_store";
import { ClientsDbRepository } from "./clients_db_repository";
import { ClientViewModel } from "./clients_db_model";



export class ClientsStore extends CrudFormLocalDbStore<
  ClientViewModel,
  ClientsDbRepository
> {
  repository: ClientsDbRepository = new ClientsDbRepository();
  viewModel: ClientViewModel = new ClientViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
