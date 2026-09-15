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
export enum Mode {
  fio,
  phone
}
export class OrdersStore extends CrudFormLocalDbStore<
  OrderViewModel,
  OrdersDbRepository
> {
  findClientsMode(mode: Mode): void {
    this.mode = mode;
  }
  mode?: Mode
  searchFioField?: string;
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


    if (this.mode === Mode.phone) {
      if (this.searchPhoneNumberField === undefined) {
        message.error("введите телефон");
        return;
      }
      await this.mapOk(
        "clients",
        this.clientsDbRepository.findModel('numberPhone', this.searchPhoneNumberField),
      );
    }
    if (this.mode === Mode.fio) {
      if (this.searchFioField === undefined) {
        message.error("введите фио");
        return;
      }
      await this.mapOk(
        "clients",
        this.clientsDbRepository.findInFio(this.searchFioField ?? ''),
      );
    }
  };
}
