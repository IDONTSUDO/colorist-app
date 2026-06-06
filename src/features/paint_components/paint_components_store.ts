import { CrudFormLocalDbStore, } from "../../core/store/base_store";
import makeAutoObservable from "mobx-store-inheritance";
import { PaintComponentsDbRepository } from "./paint_components_db_repository";
import { PaintComponentViewModel } from "./paint_components_db_model";


export class PaintComponentStore extends CrudFormLocalDbStore<
  PaintComponentViewModel,
  PaintComponentsDbRepository
> {
  repository: PaintComponentsDbRepository =
    new PaintComponentsDbRepository();
  viewModel: PaintComponentViewModel = new PaintComponentViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
