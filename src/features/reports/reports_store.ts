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
  calculateManufactureCostBySteps,
  calculateOrderFinance,
  parseArray,
  type OrderFinance,
  type ReceptStep,
} from "../order/order_finance";
import { ORDER_STATUS_READY } from "../orders/orders_db_model";
import { orderDate } from "../orders/orders_db_repository";

import { clientFullName } from "../clients/client_picker";

const round2 = (n: number) => Math.round(n * 100) / 100;

export enum ReportType {
  clientOrders = "clientOrders",
  revenue = "revenue",
  productivity = "productivity",
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
    {
      type: ReportType.productivity,
      title: "Производительность труда",
      description:
        "Сколько заказов сделано за период, как быстро и сколько отпылов ушло на подбор",
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
  markup: number; // стоймость работ
  byStatus: { status: string; count: number; total: number }[];
}

export interface ProductivityRow {
  order: OrderViewModel;
  clientName: string;
  leadTimeMs: number; // от создания до готовности
  attempts: number; // число рецептов (отпылов), 0 — рецепта нет
  volume: number; // объем краски для клиента, г
  markup: number; // стоимость работ
}

export interface ProductivityDay {
  day: number; // начало дня, ms
  count: number;
  volume: number;
  markup: number;
}

export interface ProductivityReport {
  startDate: Date;
  endDate: Date;
  rows: ProductivityRow[]; // готовые за период
  days: ProductivityDay[]; // только дни, когда что-то закончено
  newCount: number; // создано заказов за период
  avgLeadTimeMs?: number;
  avgAttempts?: number;
  volume: number;
  markup: number;
  // готовые заказы без даты готовности (сделаны до появления readyAt) —
  // в расчет не попадают
  undatedReadyCount: number;
}

// "250", "250,5", "250 г" -> число граммов
const parseGrams = (v: unknown) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const avg = (values: number[]) =>
  values.length === 0
    ? undefined
    : values.reduce((a, b) => a + b, 0) / values.length;

export class ReportsStore extends NavigateState {
  clientsDbRepository = new ClientsDbRepository();
  ordersDbRepository = new OrdersDbRepository();

  reportType?: ReportType;

  allClients: ClientViewModel[] = [];
  selectedClient?: ClientViewModel;
  range: DateRange = { startDate: null, endDate: null };
  report?: ClientOrdersReport;
  revenueReport?: RevenueReport;
  productivityReport?: ProductivityReport;

  constructor() {
    super();
    makeAutoObservable(this, {
      allClients: observable.ref,
      report: observable.ref,
      revenueReport: observable.ref,
      productivityReport: observable.ref,
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
    this.productivityReport = undefined;
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
  createProductivityReport = async () => {
    const period = this.getPeriod();
    if (!period) return;
    this.isLoading = true;
    try {
      const [ready, created] = await Promise.all([
        this.ordersDbRepository.getOrdersReadyInPeriod(
          period.startDate,
          period.endDate,
        ),
        this.ordersDbRepository.getOrdersInPeriod(
          period.startDate,
          period.endDate,
        ),
      ]);
      const clients = new Map(this.allClients.map((c) => [c.id, c]));

      const rows: ProductivityRow[] = ready.map((order) => {
        const client = clients.get(order.client);
        return {
          order,
          clientName: client ? clientFullName(client) : "—",
          leadTimeMs: Math.max(0, order.readyAt! - orderDate(order)),
          attempts: calculateManufactureCostBySteps(
            parseArray<ReceptStep>(order.componentsAddInReceptJson),
          ).length,
          volume: parseGrams(order.theVolumeOfPainTheCustomerWant),
          markup: Number(order.markup) || 0,
        };
      });

      const days = new Map<number, ProductivityDay>();
      for (const row of rows) {
        const day = startOfDay(row.order.readyAt!);
        const entry = days.get(day) ?? { day, count: 0, volume: 0, markup: 0 };
        entry.count += 1;
        entry.volume += row.volume;
        entry.markup += row.markup;
        days.set(day, entry);
      }

      const sum = (pick: (r: ProductivityRow) => number) =>
        round2(rows.reduce((acc, r) => acc + pick(r), 0));

      this.productivityReport = {
        ...period,
        rows,
        days: [...days.values()]
          .sort((a, b) => b.day - a.day)
          .map((d) => ({
            ...d,
            volume: round2(d.volume),
            markup: round2(d.markup),
          })),
        newCount: created.length,
        avgLeadTimeMs: avg(rows.map((r) => r.leadTimeMs)),
        avgAttempts: avg(
          rows.filter((r) => r.attempts > 0).map((r) => r.attempts),
        ),
        volume: sum((r) => r.volume),
        markup: sum((r) => r.markup),
        undatedReadyCount: created.filter(
          (o) => o.statusOrder === ORDER_STATUS_READY && !o.readyAt,
        ).length,
      };
    } catch (error) {
      console.error(error);
      message.error("Не удалось сформировать отчет");
    } finally {
      this.isLoading = false;
    }
  };
}
