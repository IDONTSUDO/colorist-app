import makeAutoObservable from "mobx-store-inheritance";
import { observable } from "mobx";
import { message } from "antd";
import type { NavigateFunction } from "react-router-dom";
import { NavigateState } from "../../core/store/base_store";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import type { ClientViewModel } from "../clients/clients_db_model";
import { OrdersDbRepository } from "../orders/orders_db_repository";
import type { OrderViewModel } from "../orders/orders_db_model";
import type { DateRange } from "../../core/ui/callendar/callendar";

export const clientFullName = (c: ClientViewModel) =>
  [c.family, c.name, c.surName].filter((el) => el && el.trim()).join(" ");

const digits = (s: string | undefined) => (s ?? "").replace(/\D/g, "");

export interface Report {
  client: ClientViewModel;
  startDate: Date;
  endDate: Date;
  orders: OrderViewModel[];
}

export class ReportsStore extends NavigateState {
  clientsDbRepository = new ClientsDbRepository();
  ordersDbRepository = new OrdersDbRepository();

  allClients: ClientViewModel[] = [];
  clientQuery = "";
  selectedClient?: ClientViewModel;
  range: DateRange = { startDate: null, endDate: null };
  report?: Report;

  constructor() {
    super();
    makeAutoObservable(this, {
      allClients: observable.ref,
      report: observable.ref,
    });
  }

  async init(navigate?: NavigateFunction): Promise<any> {
    await super.init(navigate);
    this.allClients = (await this.clientsDbRepository.db
      .getRepository(this.clientsDbRepository.entity)
      .toArray()) as ClientViewModel[];
  }

  // Поиск по ФИО (любая часть) или по цифрам телефона
  get clientMatches(): ClientViewModel[] {
    const query = this.clientQuery.trim().toLowerCase();
    if (!query || this.selectedClient) return [];
    const queryDigits = digits(query);
    return this.allClients
      .filter((c) => {
        if (clientFullName(c).toLowerCase().includes(query)) return true;
        return (
          queryDigits.length > 0 && digits(c.numberPhone).includes(queryDigits)
        );
      })
      .slice(0, 8);
  }

  setClientQuery = (text: string) => {
    this.clientQuery = text;
    if (this.selectedClient && text !== clientFullName(this.selectedClient)) {
      this.selectedClient = undefined;
    }
  };

  selectClient = (client: ClientViewModel) => {
    this.selectedClient = client;
    this.clientQuery = clientFullName(client);
  };

  clearClient = () => {
    this.selectedClient = undefined;
    this.clientQuery = "";
    this.report = undefined;
  };

  setRange = (range: DateRange) => {
    this.range = range;
  };

  createReport = async () => {
    const client = this.selectedClient;
    const { startDate, endDate } = this.range;
    if (!client || client.id === undefined) {
      message.error("Выберите клиента");
      return;
    }
    if (!startDate) {
      message.error("Выберите период");
      return;
    }
    // один выбранный день = отчёт за этот день
    const end = endDate ?? startDate;
    this.isLoading = true;
    try {
      const orders = await this.ordersDbRepository.getClientOrdersByPeriod(
        client.id,
        startDate,
        end,
      );
      this.report = { client, startDate, endDate: end, orders };
    } catch (error) {
      console.error(error);
      message.error("Не удалось сформировать отчет");
    } finally {
      this.isLoading = false;
    }
  };
}
