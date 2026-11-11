import makeAutoObservable from "mobx-store-inheritance";
import { CrudFormLocalDbStore, } from "../../core/store/base_store";
import { message } from "antd";
import { OrderViewModel, applyOrderStatus } from "./orders_db_model";
import { OrdersDbRepository } from "./orders_db_repository";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import type { ClientViewModel } from "../clients/clients_db_model";
import { CarsDbRepository } from "../cars/cars_db_repository";
import { CarsViewModel } from "../cars/cars_model";
import { normalizeCarName } from "../cars/car_picker";
import { PaintComponentsDbRepository } from "../paint_components/paint_components_db_repository";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import {
  parseExcelOrders,
  type ExcelOrder,
  type ExcelSheetResult,
} from "./excel_import/excel_order_parser";
import {
  buildOrderRecept,
  componentKey,
  excelDrainTotal,
} from "./excel_import/excel_order_import";

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
  addNewAuto = async () => {
    const m = new CarsViewModel();
    m.name = this.viewModel.auto;
    (await this.carsDbRepository.addModel(m)).fold(() => { }, (err) => message.error(err as any))
    this.autoCompleteChildren = [];
  }
  findAuto = async () => {

    (await this.carsDbRepository.findModel('name', this.viewModel.auto, false, true)).map((el) => {
      this.autoCompleteChildren = el.map((subEl) => subEl.name);
    })
  }
  findClientsMode(mode: Mode): void {
    this.mode = mode;
  }
  carsDbRepository = new CarsDbRepository()
  autoCompleteChildren: string[] = []
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

  // закрытие модалки (крестиком или после создания заказа) очищает форму
  private baseModalCancel = this.modalCancel;
  modalCancel = () => {
    this.viewModel = new OrderViewModel();
    this.autoCompleteChildren = [];
    this.clearExcel();
    this.baseModalCancel();
  };

  // ---------- загрузка заказа из Excel ----------
  paintComponentsDbRepository = new PaintComponentsDbRepository();
  excelFileName?: string;
  excelSheets: ExcelSheetResult[] = [];
  excelSheetName?: string;
  excelOrder?: ExcelOrder;
  excelError?: string;
  excelLoading = false;
  // картотека компонентов по номеру (без учёта регистра)
  excelCatalog = new Map<string, PaintComponentViewModel>();
  // авто из Excel уже есть в справочнике (под этим названием)
  excelExistingCar?: string;
  // клиенты, чьё ФИО совпало с ФИО из Excel
  excelClientMatches: ClientViewModel[] = [];
  // введённая цена для компонентов, которых нет в картотеке
  excelNewComponentPrice: Record<string, string> = {};

  clearExcel = () => {
    this.excelFileName = undefined;
    this.excelSheets = [];
    this.excelSheetName = undefined;
    this.excelOrder = undefined;
    this.excelError = undefined;
    this.excelExistingCar = undefined;
    this.excelClientMatches = [];
    this.excelNewComponentPrice = {};
  };

  loadExcelFile = async (file: File) => {
    this.clearExcel();
    this.excelLoading = true;
    try {
      const sheets = await parseExcelOrders(await file.arrayBuffer());
      this.excelFileName = file.name;
      this.excelSheets = sheets;
      const first = sheets.find((s) => s.order !== undefined);
      if (first === undefined) {
        this.excelError =
          sheets.length === 0
            ? "В файле нет листов"
            : `Ни один лист не похож на карточку заказа: ${sheets[0].error}`;
        return;
      }
      await this.selectExcelSheet(first.sheetName);
    } catch (error) {
      this.excelError = (error as Error).message;
    } finally {
      this.excelLoading = false;
    }
  };

  excelMissingComponents = (): string[] =>
    (this.excelOrder?.components ?? [])
      .map((el) => el.privateNumber)
      .filter((n) => !this.excelCatalog.has(componentKey(n)));

  private reloadExcelCatalog = async () => {
    const all = (await this.paintComponentsDbRepository.db
      .getRepository(this.paintComponentsDbRepository.entity)
      .toArray()) as PaintComponentViewModel[];
    this.excelCatalog = new Map(all.map((el) => [componentKey(el.privateNumber), el]));
  };

  selectExcelSheet = async (sheetName: string) => {
    const sheet = this.excelSheets.find((s) => s.sheetName === sheetName);
    this.excelSheetName = sheetName;
    this.excelError = sheet?.error;
    this.excelOrder = sheet?.order;
    this.excelNewComponentPrice = {};
    const order = this.excelOrder;
    if (order === undefined) return;

    await this.reloadExcelCatalog();

    // авто: ищем в справочнике без учёта регистра и разделителей
    const cars = (await this.carsDbRepository.db
      .getRepository(this.carsDbRepository.entity)
      .toArray()) as CarsViewModel[];
    const carKey = normalizeCarName(order.auto);
    this.excelExistingCar = cars.find(
      (c) => carKey !== "" && normalizeCarName(c.name ?? "") === carKey,
    )?.name;

    // клиент: все слова ФИО из Excel есть в ФИО клиента
    const words = order.clientName.toLowerCase().replace(/ё/g, "е").split(/\s+/).filter(Boolean);
    const clients = (await this.clientsDbRepository.db
      .getRepository(this.clientsDbRepository.entity)
      .toArray()) as ClientViewModel[];
    this.excelClientMatches =
      words.length === 0
        ? []
        : clients.filter((c) => {
            const name = [c.family, c.name, c.surName]
              .join(" ")
              .toLowerCase()
              .replace(/ё/g, "е")
              .split(/\s+/);
            return words.every((w) => name.includes(w));
          });

    const drain = excelDrainTotal(order);
    this.viewModel = Object.assign(new OrderViewModel(), {
      auto: this.excelExistingCar ?? order.auto,
      codePaint: order.codePaint,
      color: order.color,
      theVolumeOfPainTheCustomerWant: order.volume || (drain > 0 ? String(drain) : ""),
      paintConsistency: this.viewModel.paintConsistency,
      client:
        this.excelClientMatches.length === 1
          ? (this.excelClientMatches[0].id as number)
          : undefined,
    });
  };

  updateExcelNewComponentPrice = (privateNumber: string, price: string) => {
    this.excelNewComponentPrice = { ...this.excelNewComponentPrice, [privateNumber]: price };
  };

  // добавить в картотеку компонент из Excel, которого там нет
  addExcelComponent = async (privateNumber: string): Promise<boolean> => {
    const raw = (this.excelNewComponentPrice[privateNumber] ?? "").replace(",", ".").trim();
    const price = Number(raw);
    if (raw === "" || !Number.isFinite(price) || price < 0) {
      message.error(`Введите цену за грамм для компонента ${privateNumber}`);
      return false;
    }
    const model = new PaintComponentViewModel();
    model.privateNumber = privateNumber;
    model.costPrice = price;
    if ((await model.validMessage()).isFailure()) return false;
    const result = await this.paintComponentsDbRepository.addModel(model);
    if (result.isFailure()) {
      result.fold(() => { }, (error) => message.error(String(error)));
      return false;
    }
    await this.reloadExcelCatalog();
    return true;
  };

  addAllExcelComponents = async () => {
    for (const n of this.excelMissingComponents()) {
      if (!(await this.addExcelComponent(n))) return;
    }
    message.success("Компоненты добавлены в картотеку");
  };

  // «Новый заказ»: при загрузке из Excel сначала все компоненты должны быть
  // в картотеке; авто, которого нет в справочнике, добавляется
  createOrder = async () => {
    const order = this.excelOrder;
    if (order === undefined) return this.createOrUpdate();

    const missing = this.excelMissingComponents();
    if (missing.isNotEmpty()) {
      message.error(`Сначала добавьте в картотеку компоненты: ${missing.join(", ")}`);
      return;
    }
    if ((await this.viewModel.validMessage()).isFailure()) return;

    const carKey = normalizeCarName(this.viewModel.auto ?? "");
    const cars = (await this.carsDbRepository.db
      .getRepository(this.carsDbRepository.entity)
      .toArray()) as CarsViewModel[];
    const existingCar = cars.find((c) => normalizeCarName(c.name ?? "") === carKey);
    if (existingCar === undefined) {
      const car = new CarsViewModel();
      car.name = this.viewModel.auto.trim();
      const added = await this.carsDbRepository.addModel(car);
      if (added.isFailure()) {
        added.fold(() => { }, (error) => message.error(String(error)));
        return;
      }
      message.info(`Авто «${car.name}» добавлено в справочник`);
    } else {
      this.viewModel.auto = existingCar.name;
    }

    try {
      Object.assign(this.viewModel, buildOrderRecept(order, this.excelCatalog));
    } catch (error) {
      message.error((error as Error).message);
      return;
    }
    await this.new();
  };

  searchDateRange?: [Date, Date];
  // createdAt — timestamp, текстовый поиск по нему не работает: ищем по периоду
  private baseFindButton = this.onClickFindButton;
  onClickFindButton = async (): Promise<void> => {
    if (this.searchByField === "auto") {
      return this.findByAuto();
    }
    if (this.searchByField !== "createdAt") {
      return this.baseFindButton();
    }
    if (this.searchDateRange === undefined) {
      message.error("Выберите период");
      return;
    }
    const [from, to] = this.searchDateRange;
    const orders = await this.repository.getOrdersInPeriod(from, to);
    if (this.page !== undefined) {
      this.page.data = orders;
    }
  };

  // Авто: каждое слово запроса ищется в названии без учёта регистра;
  // с «=» — только точное совпадение названия
  findByAuto = async (): Promise<void> => {
    const q = normalizeCarName(this.searchValue ?? "");
    if (!q) {
      message.error("Введите авто");
      return;
    }
    const words = q.split(" ");
    const orders = await this.repository.db
      .getRepository(this.repository.entity)
      .filter((o: OrderViewModel) => {
        const name = normalizeCarName(String(o.auto ?? ""));
        return this.onlyEqual
          ? name === q
          : words.every((w) => name.includes(w));
      })
      .toArray();
    if (this.page !== undefined) {
      this.page.data = orders;
    }
  };

  updateOrderStatus = (value: string, index: number): void => {
    const order = this.page?.data.at(index) as OrderViewModel;
    applyOrderStatus(order, value);
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
