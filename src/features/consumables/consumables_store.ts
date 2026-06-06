import { CrudFormLocalDbStore, } from "../../core/store/base_store";
import makeAutoObservable from "mobx-store-inheritance";
import { ConsumablesViewModel } from "./consumables_db_model";
import { ConsumablesDbRepository } from "./consumables_db_repository";


export class ConsumablesStore extends CrudFormLocalDbStore<
  ConsumablesViewModel,
  ConsumablesDbRepository
> {
  constructor() {
    super();
    makeAutoObservable(this);
  }
  repository: ConsumablesDbRepository = new ConsumablesDbRepository();
  viewModel: ConsumablesViewModel = new ConsumablesViewModel();
}
