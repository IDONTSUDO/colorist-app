import { CrudFormStore } from "../../core/store/base_store";
import { RecipesHttpRepository } from "./recipes_repository";
import makeAutoObservable from "mobx-store-inheritance";
import type { NavigateFunction } from "react-router-dom";
import { message } from "antd";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import { RecipesViewModel } from "./recipes_db_model";


export class RecipesStore extends CrudFormStore<
  RecipesViewModel,
  RecipesHttpRepository
> {
  lastWights?: number;
  repository: RecipesHttpRepository = new RecipesHttpRepository();
  viewModel: RecipesViewModel = new RecipesViewModel();
  paintComponents: PaintComponentViewModel[] = [];
  isModalAddComponentsOpen: boolean = false;
  searchInput = "";
  constructor() {
    super();
    makeAutoObservable(this);
  }

  removeComponent = (index: number): void => {
    this.viewModel.componentsArray = this.viewModel.componentsArray?.filter(
      (_, i) => i !== index
    );
  };
  modalAddComponentsShow = () => {
    this.isModalAddComponentsOpen = true;
  };

  modalAddComponentsClickOk = () => {
    this.isModalAddComponentsOpen = false;
  };

  modalAddComponentsCancel = () => {
    this.isModalAddComponentsOpen = false;
  };
  onClickButtonFindInPrivateNumber = async () => {
    if (this.searchInput === "") {
      message.error("поле поиска пусто");
      return;
    }
    (await this.repository.findComponents(this.searchInput)).map((el) => {
      this.paintComponents = el;
    });
  };
  addNewComponentsToRecept = (index: number): void => {
    if (this.lastWights === undefined) {
      message.error("Введите вес компонента");
      return;
    }

    const component = this.paintComponents.at(index)!;
    component!.weight = this.lastWights;

    this.viewModel.componentsArray?.push(JSON.parse(JSON.stringify(component)));
  };
  init = async (navigate?: NavigateFunction): Promise<any> => {
    super.init(navigate);
    (await this.repository.getComponents()).map((el) => {
      this.paintComponents = el.data;
    });
  };
  updateWeights = (text: string): void => {
    this.lastWights = Number(text);
  };
}
export { RecipesViewModel };

