import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormLocalDbStore } from "../../core/store/base_store";
import { CarsDbRepository } from "./cars_db_repository";
import { CarsViewModel } from "./cars_model";

export class CarsStore extends CrudFormLocalDbStore<
    CarsViewModel,
    CarsDbRepository
> {
    repository: CarsDbRepository = new CarsDbRepository();
    viewModel: CarsViewModel = new CarsViewModel();
    constructor() {
        super();
        makeAutoObservable(this);
    }
}
