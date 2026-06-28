import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormLocalDbStore } from "../../core/store/base_store";
import { ReportsViewModel } from "./reports_db_model";
import { message } from "antd";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import type { ClientViewModel } from "../clients/clients_db_model";
import { ReportsDbRepository } from "./reports_db_repository";
import { OrdersDbRepository } from "../orders/orders_db_repository";


export class ReportsStore extends CrudFormLocalDbStore<
  ReportsViewModel,
  ReportsDbRepository
> {


  clients: ClientViewModel[] = [];
  clientsDbRepository: ClientsDbRepository = new ClientsDbRepository();
  numberPhone?: string
  ordersDbRepository: OrdersDbRepository = new OrdersDbRepository();
  repository: ReportsDbRepository = new ReportsDbRepository();
  viewModel: ReportsViewModel = new ReportsViewModel();
  constructor() {
    super();
    makeAutoObservable(this);
  }
  createReport = (): void => {
    if (this.viewModel.clientId === undefined) {
      message.error('нужно указать клиента');
      return;
    }
    this.ordersDbRepository.f(this.viewModel);

  }
  updateNumber(text: string): void {
    this.numberPhone = text;
  }
  findClients = async () => {
    if (this.numberPhone === undefined) {
      message.error('введите телефон');
      return;
    }
    (await this.clientsDbRepository.findModel('numberPhone', this.numberPhone)).map((clients) => {
      this.clients = clients;
    })
  }
  selectClient(id: number | undefined): void {
    if (
      this.viewModel.clientId === id
    ) {
      this.updateForm({ clientId: undefined })
    } else {
      this.updateForm({ clientId: id })
    }
  }
}
