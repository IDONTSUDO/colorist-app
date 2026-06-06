import makeAutoObservable from "mobx-store-inheritance";
import { ValidationModel } from "../../core/model/validation_model";
import { CrudFormStore } from "../../core/store/base_store";
import { ReportsHttpRepository } from "./reports_http_repository";

export class ReportsViewModel extends ValidationModel {}

export class ReportsStore extends CrudFormStore<
  ReportsViewModel,
  ReportsHttpRepository
> {
  repository: ReportsHttpRepository = new ReportsHttpRepository();
  viewModel: ReportsViewModel = new ReportsViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
