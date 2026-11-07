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
import {
  calculateOrderFinance,
  type OrderFinance,
} from "../order/order_finance";

import { clientFullName } from "../clients/client_picker";

const round2 = (n: number) => Math.round(n * 100) / 100;

export enum ReportType {
  clientOrders = "clientOrders",
  revenue = "revenue",
}

export const reportTypes: {
  type: ReportType;
  title: string;
  description: string;
}[] = [
  {
    type: ReportType.clientOrders,
    title: "Заказы клиента",
    description: "Какие заказы были у выбранного клиента за период",
  },
  {
    type: ReportType.revenue,
    title: "Выручка",
    description: "Сумма по всем заказам за период с разбивкой по оплате",
  },
];

export interface ClientOrdersReport {
  client: ClientViewModel;
  startDate: Date;
  endDate: Date;
  orders: OrderViewModel[];
}

export interface RevenueRow {
  order: OrderViewModel;
  clientName: string;
  finance: OrderFinance;
}

export interface RevenueReport {
  startDate: Date;
  endDate: Date;
  rows: RevenueRow[];
  total: number; // выручка
  cost: number; // себестоимость (компоненты + производство)
  markup: number; // наценка
  byStatus: { status: string; count: number; total: number }[];
}

export class ReportsStore extends NavigateState {
  clientsDbRepository = new ClientsDbRepository();
  ordersDbRepository = new OrdersDbRepository();

  reportType?: ReportType;

  allClients: ClientViewModel[] = [];
  selectedClient?: ClientViewModel;
  range: DateRange = { startDate: null, endDate: null };
  report?: ClientOrdersReport;
  revenueReport?: RevenueReport;

  constructor() {
    super();
    makeAutoObservable(this, {
      allClients: observable.ref,
      report: observable.ref,
      revenueReport: observable.ref,
    });
  }

  async init(navigate?: NavigateFunction): Promise<any> {
    await super.init(navigate);
    this.allClients = (await this.clientsDbRepository.db
      .getRepository(this.clientsDbRepository.entity)
      .toArray()) as ClientViewModel[];
  }

  selectReportType = (type: ReportType) => {
    this.reportType = type;
  };

  // возврат к выбору отчета сбрасывает форму
  backToReportTypes = () => {
    this.reportType = undefined;
    this.selectedClient = undefined;
    this.range = { startDate: null, endDate: null };
    this.report = undefined;
    this.revenueReport = undefined;
  };

  setClient = (client: ClientViewModel | undefined) => {
    this.selectedClient = client;
    this.report = undefined;
  };

  setRange = (range: DateRange) => {
    this.range = range;
  };

  // один выбранный день = отчет за этот день
  private getPeriod(): { startDate: Date; endDate: Date } | undefined {
    const { startDate, endDate } = this.range;
    if (!startDate) {
      message.error("Выберите период");
      return undefined;
    }
    return { startDate, endDate: endDate ?? startDate };
  }

  createReport = async () => {
    const client = this.selectedClient;
    if (!client || client.id === undefined) {
      message.error("Выберите клиента");
      return;
    }
    const period = this.getPeriod();
    if (!period) return;
    this.isLoading = true;
    try {
      const orders = await this.ordersDbRepository.getOrdersInPeriod(
        period.startDate,
        period.endDate,
        client.id,
      );
      this.report = { client, ...period, orders };
    } catch (error) {
      console.error(error);
      message.error("Не удалось сформировать отчет");
    } finally {
      this.isLoading = false;
    }
  };

  createRevenueReport = async () => {
    const period = this.getPeriod();
    if (!period) return;
    this.isLoading = true;
    try {
      const orders = await this.ordersDbRepository.getOrdersInPeriod(
        period.startDate,
        period.endDate,
      );
      const clients = new Map(this.allClients.map((c) => [c.id, c]));
      const rows: RevenueRow[] = orders.map((order) => {
        const client = clients.get(order.client);
        return {
          order,
          clientName: client ? clientFullName(client) : "—",
          finance: calculateOrderFinance(order),
        };
      });

      const statuses = new Map<string, { count: number; total: number }>();
      for (const row of rows) {
        const status = row.order.financeStatus || "Без статуса";
        const entry = statuses.get(status) ?? { count: 0, total: 0 };
        entry.count += 1;
        entry.total += row.finance.total;
        statuses.set(status, entry);
      }

      const sum = (pick: (r: RevenueRow) => number) =>
        round2(rows.reduce((acc, r) => acc + pick(r), 0));

      this.revenueReport = {
        ...period,
        rows,
        total: sum((r) => r.finance.total),
        cost: sum((r) => r.finance.componentsCost + r.finance.manufactureCost),
        markup: sum((r) => r.finance.markup),
        byStatus: [...statuses.entries()].map(([status, v]) => ({
          status,
          count: v.count,
          total: round2(v.total),
        })),
      };
    } catch (error) {
      console.error(error);
      message.error("Не удалось сформировать отчет");
    } finally {
      this.isLoading = false;
    }
  };
}
