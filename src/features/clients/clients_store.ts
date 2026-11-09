import makeAutoObservable from "mobx-store-inheritance";
import { message } from "antd";
import { CrudFormLocalDbStore } from "../../core/store/base_store";
import { ClientsDbRepository } from "./clients_db_repository";
import { ClientViewModel } from "./clients_db_model";



export class ClientsStore extends CrudFormLocalDbStore<
  ClientViewModel,
  ClientsDbRepository
> {
  repository: ClientsDbRepository = new ClientsDbRepository();
  viewModel: ClientViewModel = new ClientViewModel();
  // поиск по телефону: только цифры после +7, совпадение по подстроке
  searchPhoneDigits = "";
  private baseFindButton = this.onClickFindButton;
  onClickFindButton = async (): Promise<void> => {
    if (this.searchByField !== "numberPhone") {
      return this.baseFindButton();
    }
    if (this.searchPhoneDigits.length === 0) {
      message.error("Введите номер телефона");
      return;
    }
    const clients = await this.repository.findByPhoneDigits(
      this.searchPhoneDigits,
    );
    if (this.page !== undefined) {
      this.page.data = clients;
    }
  };
  constructor() {
    super();
    makeAutoObservable(this);
  }
}
