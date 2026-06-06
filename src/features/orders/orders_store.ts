import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormLocalDbStore, } from "../../core/store/base_store";
import { message } from "antd";
import { OrderViewModel } from "./orders_db_model";
import { OrdersDbRepository } from "./orders_db_repository";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import type { ClientViewModel } from "../clients/clients_db_model";

export interface IUser {
  id: number;
  login: string;
  name: string;
  password: string;
  createDate: Date;
}

export class OrdersStore extends CrudFormLocalDbStore<
  OrderViewModel,
  OrdersDbRepository
> {
  repository: OrdersDbRepository = new OrdersDbRepository();
  clientsDbRepository = new ClientsDbRepository();
  viewModel: OrderViewModel = new OrderViewModel();
  searchPhoneNumberField?: string;
  clients: ClientViewModel[] = [];
  users: IUser[] = [];
  constructor() {
    super();
    makeAutoObservable(this);
  }

  updateOrderStatus = (value: string, index: number): void => {
    const order = this.page?.data.at(index) as OrderViewModel;
    order.statusOrder = value;
    this.repository.edit(order);
  };
  onClickFindButtonToSearchPhone = async () => {
    if (this.searchPhoneNumberField === undefined) {
      message.error("введите телефон");
      return;
    }
    
    await this.mapOk(
      "clients",
      this.clientsDbRepository.findModel('numberPhone', this.searchPhoneNumberField),
    );
  };
}
