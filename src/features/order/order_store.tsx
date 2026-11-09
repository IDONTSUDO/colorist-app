import makeAutoObservable from "mobx-store-inheritance";
import { FormState } from "../../core/store/base_store";
import { IOrderDbRepository } from "./order_db_repository";
import { message } from "antd";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import type { ConsumablesViewModel } from "../consumables/consumables_db_model";
import type { RecipesViewModel } from "../recipes/recipes_db_model";
import { ClientViewModel } from "../clients/clients_db_model";
import {
  plainToClass,
  plainToInstance,
  type ClassTransformOptions,
} from "class-transformer";
import { OrderViewModel, applyOrderStatus } from "../orders/orders_db_model";
import { SnapshotHistory } from "./snapshot_history";
import { OrderHistoryDbRepository } from "./order_history_db_repository";
import {
  calculateComponentsUsage,
  calculateManufactureCost,
  calculateManufactureCostBySteps,
  isManufactureStepExcluded,
} from "./order_finance";

export class OrderMapper {
  getCommonL(store: OrderStore) {
    return this.balance
      .map((paint) => {
        return (
          ((paint.weightCalcRecept ?? 0) /
            this.balance
              .reduce((el, acc) => {
                return el + (acc.weight ?? 0);
              }, 0)
              .shortToDecimalPlaces(2)) *
          (this.balance
            .reduce((el, acc) => {
              return el + (acc.weight ?? 0);
            }, 0)
            .shortToDecimalPlaces(2) -
            this.getBalance(store).shortToDecimalPlaces(2))
        ).shortToDecimalPlaces(2);
      })
      .reduce((acc, el) => {
        return acc + el;
      }, 0)
      .shortToDecimalPlaces(2);
  }
  getCommonW() {
    return this.balance
      .reduce((acc, el) => {
        // if(el.weight )
        acc += el.weightCalcRecept ?? 0;
        return acc;
      }, 0)
      .shortToDecimalPlaces(2);
  }
  add: PaintComponentViewModel;
  dust?: string;
  // сколько грамм краски слить по этому рецепту
  drainWeight?: number = undefined;
  // номер колонки рецепта, в которую перенесён этот слив
  drainAppliedTo?: number | null = undefined;
  // этот шаг рецепта создан из слива колонки №
  fromDrain?: number | null = undefined;
  // ручная граммовка компонентов слива (если правили вручную)
  drainComponents?: number[] = undefined;
  // какие компоненты слива зафиксированы ручным вводом
  drainEdited?: boolean[] = undefined;
  hasDrainOverrides(): boolean {
    return (
      this.drainComponents !== undefined &&
      this.drainComponents.length === this.balance.length
    );
  }
  // раскладка слива по компонентам: ручная, иначе пропорционально рецепту
  getDrain(): { privateNumber: string; weight: number; edited: boolean }[] {
    const total = this.balance.reduce(
      (acc, el) => acc + (el.weightCalcRecept ?? 0),
      0,
    );
    const drain = this.drainWeight ?? 0;
    const overrides = this.hasDrainOverrides();
    return this.balance.map((el, i) => ({
      privateNumber: el.privateNumber,
      weight: overrides
        ? this.drainComponents![i]
        : total === 0
          ? 0
          : ((el.weightCalcRecept ?? 0) / total) * drain,
      edited: overrides && (this.drainEdited?.[i] ?? false),
    }));
  }
  addingComponents: PaintComponentViewModel[] = [];
  // шаг создан добавлением компонента (add — добавленная краска)
  isAdding?: boolean;
  balance: PaintComponentViewModel[];
  constructor(
    add: PaintComponentViewModel,
    balance: PaintComponentViewModel[],
  ) {
    this.add = add;
    this.balance = balance;
    makeAutoObservable(this);
  }
  // отпыл/расход = вес компонентов + вес тары − вес остатка
  // (остаток взвешивается вместе с тарой). Пока остаток не введён — тару
  // не учитываем, иначе остаток по компонентам уйдёт в минус.
  getBalance(store: OrderStore) {
    const components = this.balance.reduce((acc, el) => {
      return acc + (el?.weightCalcRecept ?? 0);
    }, 0);
    if (this.dust === undefined || this.dust === "") return components;
    return components + store.weightContainers - Number(this.dust);
  }
}
export enum OrderProcessType {
  inRecept,
  diffRecept,
  notSelected,
}

export enum SelectReceptMode {
  one,
  two,
}

export enum OrderMode {
  selectRecept,
  none,
}
function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

const HISTORY_DEBOUNCE_MS = 600;

export class OrderStore extends FormState<OrderViewModel> {
  componenstDefaultReceptUpdate = (str: any, index: number): void => {
    if (Number().isValid(str)) {
      this.componentsAddInRecept.at(1)!.balance.at(index)!.weightCalcRecept =
        Number(str);
      this.componentsAddInRecept.at(1)!.balance.at(index)!.weight = Number(str);
      this.updateOrder();
    }
  };

  resetOrder = (): void => {
    this.resetOrderModalIsShow = false;
    this.componentsAddInRecept = [];
    this.components = [];
    this.updateOrder();
  };
  resetOrderModalShow = () => {
    this.resetOrderModalIsShow = true;
  };
  resetOrderModalIsShow = false;
  // общий расход пигментов по заказу (в порядке таблицы компонентов)
  getComponentsUsage = () => {
    const usage = calculateComponentsUsage(this.componentsAddInRecept);
    const order = this.getComponentsReceptUniq().map((el) =>
      String(el.privateNumber),
    );
    return usage.sort(
      (a, b) =>
        (order.indexOf(a.privateNumber) + 1 || Infinity) -
        (order.indexOf(b.privateNumber) + 1 || Infinity),
    );
  };
  // себестоимость производства по рецептам + исключён ли рецепт галочкой
  getManufactureCostBySteps = () =>
    calculateManufactureCostBySteps(this.componentsAddInRecept).map((el) => ({
      ...el,
      excluded: isManufactureStepExcluded(this.viewModel, el.step),
    }));
  // себестоимость производства, которая идёт в итог (без исключённых рецептов)
  getManufactureCostInTotal() {
    return calculateManufactureCost(this.componentsAddInRecept, (step) =>
      isManufactureStepExcluded(this.viewModel, step),
    );
  }
  isAllManufactureExcluded = () => {
    const steps = this.getManufactureCostBySteps();
    return steps.isNotEmpty() && steps.every((el) => el.excluded);
  };
  // старый флаг «не учитывать всё» переводим в список рецептов
  private getExcludedSteps = (): number[] =>
    this.getManufactureCostBySteps()
      .filter((el) => el.excluded)
      .map((el) => el.step);
  toggleManufactureStep = (step: number, excluded: boolean): void => {
    const steps = this.getExcludedSteps().filter((el) => el !== step);
    if (excluded) steps.push(step);
    this.viewModel.ignoreManufactureCost = false;
    this.viewModel.manufactureExcludedSteps = steps.sort((a, b) => a - b);
    this.updateOrder();
  };
  setIgnoreManufactureCost = (value: boolean): void => {
    this.viewModel.ignoreManufactureCost = false;
    this.viewModel.manufactureExcludedSteps = value
      ? this.getManufactureCostBySteps().map((el) => el.step)
      : [];
    this.updateOrder();
  };
  getCostComponentsManufacturePrice() {
    return calculateManufactureCost(this.componentsAddInRecept);
  }
  recalculate = () => {
    // if()
    const newComponents: PaintComponentViewModel[] = [];
    const lastRecept = this.componentsAddInRecept.lastElement()!;
    // console.log(JSON.stringify(lastRecept));
    if (lastRecept.dust === undefined) {
      message.error("введите вес остатка");
      return;
    }
    lastRecept.addingComponents.forEach((component, i) => {
      const weight = lastRecept.balance.at(i)?.weight ?? 0;

      let newComponentWeight =
        ((weight ?? 0) /
          lastRecept.balance
            .reduce((el, acc) => {
              return el + (acc.weightCalcRecept ?? 0);
            }, 0)
            .shortToDecimalPlaces(2)) *
        (
          lastRecept.balance
            .reduce((el, acc) => {
              return el + (acc.weightCalcRecept ?? 0);
            }, 0)
            .shortToDecimalPlaces(2) -
          lastRecept.getBalance(this).shortToDecimalPlaces(2)
        ).shortToDecimalPlaces(2);
      if (component !== undefined) {
        newComponentWeight += component.weight ?? 0;
      }

      const newComponent = plainToInstance(
        PaintComponentViewModel,
        JSON.parse(JSON.stringify(lastRecept.balance.at(i))),
      );
      newComponent.weightCalcRecept = newComponentWeight;
      newComponent.weight = newComponentWeight;
      newComponents.push(newComponent);
    });

    const step = new OrderMapper(newComponents[0], newComponents);
    step.isAdding = false;
    this.componentsAddInRecept.push(step);

    this.updateOrder();
    this.isNeedSaveButton = false;
  };

  isNeedSaveButton = false;

  insertReceptFromClickBoard = async () => {
    const buff = await navigator.clipboard.readText();
    if (buff === "" && !isValidJson(buff)) {
      message.error("буфер обмена содержит неверные данные");
      return;
    }

    const result = JSON.parse(buff).map(
      (el: ClassTransformOptions | undefined) =>
        plainToClass(PaintComponentViewModel, el),
    ) as PaintComponentViewModel[];
    if (result.length === 0) {
      message.error("не валидные данные");
      return;
    }
    const paintComponentViewModels: PaintComponentViewModel[] = [];
    let lastComponent: any;
    result
      .filter(
        (el, index, self) =>
          index === self.findIndex((u) => u.privateNumber === el.privateNumber),
      )
      .forEach((el) => {
        const component = el;
        const c = JSON.parse(JSON.stringify(component));
        c.weightCalcRecept = c.weight;
        lastComponent = c;

        paintComponentViewModels
          .rFind<PaintComponentViewModel>(
            (el) => el.privateNumber === c.privateNumber,
          )
          .fold(
            (s) => {
              if (s.weightCalcRecept === undefined) {
                s.weightCalcRecept = 0;
              }
              s.weightCalcRecept = c.weight;
            },
            () => {
              paintComponentViewModels.add(c);
            },
          );
      });
    this.componentsAddInRecept.push(
      new OrderMapper(lastComponent, paintComponentViewModels),
    );
    this.componentsAddInRecept.push(
      new OrderMapper(lastComponent, paintComponentViewModels),
    );
    this.componentsAddInRecept[0].balance.forEach((el) => {
      this.addingComponentsTable.push(el);
    });
    this.updateOrder();
  };
  copyRecept = async () => {
    if (this.selectReceptIndex === undefined) {
      message.error(
        "не выбран рецепт для копирования нажмите на кнопку выбрать рецепт и выберете активный рецепт",
      );
      return;
    }

    await navigator.clipboard.writeText(
      JSON.stringify(
        this.componentsAddInRecept.at(this.selectReceptIndex)?.balance,
      ),
    );

    message.info("выбранный рецепт скопирован!");
  };
  selectReceptPaintFinal: PaintComponentViewModel[] = [];
  selectReceptMode: SelectReceptMode = SelectReceptMode.one;
  selectReceptWeight?: number = undefined;
  selectReceptIndex?: number = undefined;
  weighs: number[] = [];
  orderMode = OrderMode.none;
  orderCharacteristics = "NEW_RECEPT";
  isNewReceptModal = false;
  additiveComponents: { componentId: number; additives: number }[][] = [];
  currentRemainder = 0;
  afterDust = 0;
  weightContainers = 0;
  repository = new IOrderDbRepository();
  viewModel: OrderViewModel = new OrderViewModel();
  client: ClientViewModel = new ClientViewModel();
  recipes: RecipesViewModel[] = [];
  receptField?: string;
  consumablesField?: string;
  addingComponentsTable: PaintComponentViewModel[] = [];
  componentsField?: string;
  components: PaintComponentViewModel[] = [];
  consumables: ConsumablesViewModel[] = [];
  consumablesModalIsOpen: boolean = false;
  reportComponentsModalIsOpen: boolean = false;
  reportConsumablesModalIsOpen: boolean = false;
  isOpenComponentsModal: boolean = false;
  additional: { componentId: string; weight: number }[] = [];
  componentsNewRecept: PaintComponentViewModel[] = [];
  componentsAddInRecept: OrderMapper[] = [];
  newReceptComponents: PaintComponentViewModel[] = [];
  constructor() {
    super();
    makeAutoObservable(this);
  }
  setTheInkVolumeForDraining(): void {
    if (this.selectReceptWeight === undefined) {
      message.error("введите сколько надо краски");
      return;
    }

    this.selectReceptPaintFinal = JSON.parse(
      JSON.stringify(this.componentsAddInRecept),
    )
      .at(this.selectReceptIndex)!
      .balance.map((el: { weightCalcRecept: number }) => {
        el.weightCalcRecept =
          ((el.weightCalcRecept ?? 1) /
            this.componentsAddInRecept
              .at(this.selectReceptIndex!)!
              .balance.reduce((acc, el) => {
                return (acc += el.weightCalcRecept ?? 0);
              }, 0)) *
          this.selectReceptWeight!;
        return el;
      });
    this.selectReceptMode = SelectReceptMode.two;
    this.updateOrder();
  }
  // слив по конкретному рецепту (колонке)
  updateDrainWeight = (index: number, text: string): void => {
    const mapper = this.componentsAddInRecept.at(index);
    if (mapper === undefined) return;
    const value = Number(text);
    const newTotal =
      text.trim() === "" || isNaN(value) || value <= 0 ? undefined : value;
    if (newTotal === undefined) {
      mapper.drainWeight = undefined;
      mapper.drainComponents = undefined;
      mapper.drainEdited = undefined;
    } else {
      // ручную раскладку масштабируем под новый общий вес
      if (mapper.hasDrainOverrides() && (mapper.drainWeight ?? 0) > 0) {
        const k = newTotal / mapper.drainWeight!;
        mapper.drainComponents = mapper.drainComponents!.map((w) => w * k);
      }
      mapper.drainWeight = newTotal;
    }
    this.recalculateDrainTotal();
    this.updateOrder();
  };
  // ввели вес одного компонента: общий вес слива не меняется,
  // компонент фиксируется, остаток делится между незафиксированными по рецепту
  updateDrainByComponent = (
    index: number,
    subIndex: number,
    text: string,
  ): void => {
    const mapper = this.componentsAddInRecept.at(index);
    if (mapper === undefined) return;
    const value = Number(text);
    if (text.trim() === "" || isNaN(value) || value < 0) return;
    const recipe = mapper.balance.map((el) => el.weightCalcRecept ?? 0);
    const recipeTotal = recipe.reduce((acc, w) => acc + w, 0);

    // слив ещё не задан — считаем общий вес от компонента по пропорции рецепта
    if (!mapper.drainWeight) {
      const part = recipe[subIndex] ?? 0;
      if (recipeTotal === 0 || part === 0 || value === 0) {
        message.error("сначала введите граммы по рецепту");
        return;
      }
      mapper.drainWeight = (value * recipeTotal) / part;
      mapper.drainComponents = undefined;
      mapper.drainEdited = undefined;
      this.recalculateDrainTotal();
      this.updateOrder();
      return;
    }

    const total = mapper.drainWeight;
    const current = mapper.getDrain().map((el) => el.weight);
    const edited = mapper.balance.map(
      (_, i) =>
        mapper.hasDrainOverrides() && (mapper.drainEdited?.[i] ?? false),
    );
    edited[subIndex] = true;
    const others = mapper.balance
      .map((_, i) => i)
      .filter((i) => i !== subIndex);
    let free = others.filter((i) => !edited[i]);
    // все остальные уже зафиксированы — снимаем с них фиксацию
    if (free.length === 0) {
      free = others;
      free.forEach((i) => (edited[i] = false));
    }
    const lockedSum = others
      .filter((i) => !free.includes(i))
      .reduce((acc, i) => acc + current[i], 0);
    const rest = total - value - lockedSum;
    if (rest < 0) {
      message.error(
        `компонентов больше, чем ${total.shortToDecimalPlaces(2)} г слива`,
      );
      return;
    }
    const freeRecipe = free.reduce((acc, i) => acc + recipe[i], 0);
    const next = [...current];
    next[subIndex] = value;
    free.forEach((i) => {
      next[i] =
        freeRecipe === 0 ? rest / free.length : (recipe[i] / freeRecipe) * rest;
    });
    mapper.drainComponents = next;
    mapper.drainEdited = edited;
    this.recalculateDrainTotal();
    this.updateOrder();
  };
  // режим «выбрать слив»: клик по таблице слива переносит его в рецепт
  isDrainSelectMode = false;
  toggleDrainSelectMode = (): void => {
    this.isDrainSelectMode = !this.isDrainSelectMode;
  };
  // граммовка слива становится новым шагом (колонкой) рецепта
  // слив → новый отпыл: граммовка слива записывается в «добавку» этого отпыла,
  // а новый отпыл (в конце) = остаток этого отпыла + слив — та же формула,
  // что у «сохранить»/Enter (recalculate).
  applyDrainToRecept = (index: number): void => {
    const mapper = this.componentsAddInRecept.at(index);
    if (mapper === undefined) return;
    if (!mapper.drainWeight) {
      message.error("введите грамм по рецепту в этом сливе");
      return;
    }
    if (mapper.dust === undefined || mapper.dust === "") {
      message.error("введите вес остатка у этого отпыла");
      return;
    }
    const isLast = index === this.componentsAddInRecept.length - 1;
    const drain = mapper.getDrain().map((el) => Number(el.weight.toFixed(2)));
    const existing = mapper.balance.map(
      (_, i) => Number(mapper.addingComponents[i]?.weight ?? 0) || 0,
    );

    // остаток по компоненту (как в колонке «остаток»)
    const sum = mapper.balance
      .reduce((acc, el) => acc + (el.weightCalcRecept ?? 0), 0)
      .shortToDecimalPlaces(2);
    const used = (
      sum - mapper.getBalance(this).shortToDecimalPlaces(2)
    ).shortToDecimalPlaces(2);
    const newComponents = mapper.balance.map((paint, i) => {
      const remainder = sum === 0 ? 0 : ((paint.weight ?? 0) / sum) * used;
      // у последнего отпыла ручные добавки ещё не применены — идут в новый
      // отпыл вместе со сливом; у остальных они уже ушли в следующий отпыл
      const add = drain[i] + (isLast ? existing[i] : 0);
      const c = plainToInstance(
        PaintComponentViewModel,
        JSON.parse(JSON.stringify(paint)),
      );
      c.weightCalcRecept = remainder + add;
      c.weight = remainder + add;
      return c;
    });

    // «добавка» отпыла: уже введённое + слив
    mapper.addingComponents = mapper.balance.map((paint, i) => {
      const c = plainToInstance(
        PaintComponentViewModel,
        JSON.parse(JSON.stringify(paint)),
      );
      c.weight = Number((existing[i] + drain[i]).toFixed(2));
      return c;
    });

    const step = new OrderMapper(newComponents[0], newComponents);
    step.isAdding = false;
    step.fromDrain = index;
    this.componentsAddInRecept.push(step);
    mapper.drainAppliedTo = this.componentsAddInRecept.length - 1;
    this.isDrainSelectMode = false;
    this.isNeedSaveButton = false;
    this.historyVersion += 1;
    this.updateOrder();
    message.success("слив добавлен в добавку, создан новый отпыл");
  };
  // сброс ручной граммовки — снова по рецепту
  resetDrainComponents = (index: number): void => {
    const mapper = this.componentsAddInRecept.at(index);
    if (mapper === undefined) return;
    mapper.drainComponents = undefined;
    mapper.drainEdited = undefined;
    this.recalculateDrainTotal();
    this.updateOrder();
  };
  // итог всех сливов по компонентам — используется в финансах
  private recalculateDrainTotal = (): void => {
    const result: PaintComponentViewModel[] = [];
    let total = 0;
    this.componentsAddInRecept.forEach((mapper, index) => {
      if (index === 0 || !mapper.drainWeight) return;
      total += mapper.drainWeight;
      const drain = mapper.getDrain();
      mapper.balance.forEach((paint, i) => {
        const weight = drain[i]?.weight ?? 0;
        const existing = result.find(
          (el) => el.privateNumber === paint.privateNumber,
        );
        if (existing) {
          existing.weightCalcRecept = (existing.weightCalcRecept ?? 0) + weight;
          return;
        }
        const copy = plainToInstance(
          PaintComponentViewModel,
          JSON.parse(JSON.stringify(paint)),
        );
        copy.weightCalcRecept = weight;
        result.push(copy);
      });
    });
    this.selectReceptPaintFinal = result;
    this.selectReceptWeight = total === 0 ? undefined : total;
    this.selectReceptMode =
      total === 0 ? SelectReceptMode.one : SelectReceptMode.two;
  };
  updateSelectReceptWeight = (weight: number): void => {
    this.selectReceptWeight = weight;
  };
  mapperBalance = (weightCalcRecept: number | undefined) => weightCalcRecept;

  deleteReceptComp(i: number): void {
    this.newReceptComponents = this.newReceptComponents.filter(
      (_, index) => index !== i,
    );
  }
  updateDust = (value: string, index: number): void => {
    const n = Number(value);
    // "55." во время ввода — валидно (Number даст 55); 0 тоже допустим
    if (value.trim() === "" || isNaN(n) || n < 0) {
      return;
    }
    this.componentsAddInRecept.atR(index).map((el) => {
      el.dust = value;
      this.updateOrder();
    });
  };
  addAdditive = (el: PaintComponentViewModel, text: string, index: number) => {
    this.additiveComponents.atR(index).fold(
      (s) => {
        s.rFind<{ componentId: number; additives: number }>(
          (element) => element.componentId === el.id,
        ).fold(
          (additive) => {
            additive.additives = Number(text);
          },
          () => {
            this.additiveComponents.push([
              {
                componentId: el.id!,
                additives: Number(text),
              },
            ]);
          },
        );
      },
      () => {
        this.additiveComponents
          .add([])
          .atR(index)
          .map((element) => {
            element.push({
              componentId: el.id!,
              additives: Number(text),
            });
          });
      },
    );
  };
  getRemainderInComponent = (el: PaintComponentViewModel) =>
    String(
      (
        (el.weightCalcRecept! / this.totalWeightExcludingPackaging()) *
        Number(this.getWeightOfTheDust())
      ).toFixed(2),
    );

  cancelLeak = (): void => {
    this.selectReceptIndex = undefined;
    this.selectReceptWeight = undefined;
    this.orderMode = OrderMode.none;
    // store.selectReceptMode
    this.selectReceptMode = SelectReceptMode.one;
    this.updateOrder();
  };
  // Остаток
  getRemainder = () => String(this.getCommonWeight() - this.currentRemainder);
  // Отпыл
  getVacation = (): string => String(this.afterDust);
  //  Вес после отпыла
  getWeightOfTheDust = () =>
    String(this.totalWeightExcludingPackaging() - this.afterDust);
  //общицй вес без тары
  totalWeightExcludingPackaging = () => {
    return this.componentsNewRecept.reduce((acc, el) => {
      return acc + el.weightCalcRecept!;
    }, 0);
  };
  // общий вес с тарой
  getCommonWeight = (): number =>
    this.componentsNewRecept.reduce((acc, el) => {
      return acc + el.weightCalcRecept!;
    }, 0) + this.weightContainers;

  getComponentsReceptUniq = () =>
    this.componentsAddInRecept
      .map((el) => {
        return el.balance;
      })
      .flat()
      .filter(
        (el, index, self) =>
          index === self.findIndex((u) => u.privateNumber === el.privateNumber),
      );
  updateWeightContainers = (text: string): void => {
    this.weightContainers = Number(text);
    this.updateOrder();
  };
  updateRemainder(text: string): void {
    this.afterDust = Number(text);
  }

  updateWeights = (newWeight: number, i: number) => {
    this.components.at(i)!.weight = newWeight;
  };
  updateOrderStatus = (status: string): void => {
    applyOrderStatus(this.viewModel, status);
    this.updateOrder();
  };
  selectOrderProcessType = async (type: string) => {
    this.viewModel.orderCharacteristics = type;
    this.updateOrder();
    this.repository.edit(this.viewModel);
  };

  // История хранится в таблице order-history и переживает перезагрузку.
  history = new SnapshotHistory();
  historyRepository = new OrderHistoryDbRepository();
  historyVersion = 0;
  private historyTimer?: ReturnType<typeof setTimeout>;

  private takeSnapshot = () =>
    JSON.stringify({
      componentsAddInRecept: this.componentsAddInRecept,
      addingComponentsTable: this.addingComponentsTable,
      selectReceptIndex: this.selectReceptIndex ?? null,
      selectReceptWeight: this.selectReceptWeight ?? null,
      selectReceptPaintFinal: this.selectReceptPaintFinal,
      weightContainers: this.weightContainers,
    });

  private scheduleHistoryCommit = () => {
    clearTimeout(this.historyTimer);
    this.historyTimer = setTimeout(this.commitHistory, HISTORY_DEBOUNCE_MS);
  };

  private commitHistory = () => {
    clearTimeout(this.historyTimer);
    this.historyTimer = undefined;
    if (this.history.record(this.takeSnapshot())) this.persistHistory();
  };

  private persistHistory = () => {
    const orderId = this.viewModel.id;
    if (orderId === undefined) return;
    this.historyRepository.save(orderId, this.history.state);
  };

  private applySnapshot = async (snapshot: string) => {
    const s = JSON.parse(snapshot);
    this.componentsAddInRecept = (s.componentsAddInRecept as any[]).map((el) =>
      plainToClass(OrderMapper, el),
    ) as any;
    this.addingComponentsTable = s.addingComponentsTable;
    this.selectReceptIndex = s.selectReceptIndex ?? undefined;
    this.selectReceptWeight = s.selectReceptWeight ?? undefined;
    this.selectReceptMode =
      this.selectReceptWeight !== undefined
        ? SelectReceptMode.two
        : SelectReceptMode.one;
    this.selectReceptPaintFinal = (s.selectReceptPaintFinal as any[]).map(
      (el) => plainToClass(PaintComponentViewModel, el),
    );
    this.weightContainers = s.weightContainers;
    this.isNeedSaveButton = false;
    this.historyVersion += 1;
    await this.saveOrder();
  };

  undo = async () => {
    if (this.historyTimer !== undefined) this.commitHistory();
    const snapshot = this.history.undo();
    if (snapshot === undefined) return;
    this.persistHistory();
    await this.applySnapshot(snapshot);
  };

  redo = async () => {
    if (this.historyTimer !== undefined) this.commitHistory();
    const snapshot = this.history.redo();
    if (snapshot === undefined) return;
    this.persistHistory();
    await this.applySnapshot(snapshot);
  };

  dispose() {
    if (this.historyTimer !== undefined) this.commitHistory();
  }

  updateOrder = async () => {
    this.scheduleHistoryCommit();
    await this.saveOrder();
  };

  private saveOrder = async () => {
    this.viewModel.consumablesJson = JSON.stringify(this.viewModel.consumables);
    this.viewModel.addingComponentsTableJson = JSON.stringify(
      this.addingComponentsTable,
    );
    if (this.weightContainers !== undefined) {
      this.viewModel.weightContainers = this.weightContainers;
    }
    this.viewModel.selectReceptIndex =
      this.selectReceptIndex === undefined ? null : this.selectReceptIndex!;
    this.viewModel.componentsAddInReceptJson = JSON.stringify(
      this.componentsAddInRecept,
    );
    this.viewModel.selectReceptWeight =
      this.selectReceptWeight === undefined ? null : this.selectReceptWeight;
    this.viewModel.selectReceptPaintFinal = JSON.stringify(
      this.selectReceptPaintFinal,
    );

    await this.repository.updateOrder(this.viewModel);
  };
  // заказ с таким id не найден — показываем экран «не найден»
  notFound = false;
  initParams = async (id: string) => {
    const orderId = Number(id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      this.notFound = true;
      return;
    }
    this.isLoading = true;
    const order = (await this.repository.getOrderById(orderId as any)).fold(
      (el) => el as OrderViewModel | undefined,
      () => undefined,
    );
    this.isLoading = false;
    if (order === undefined) {
      this.notFound = true;
      return;
    }
    this.viewModel = order;

    await this.mapOk(
      "client",
      this.repository.getClientById(this.viewModel.client),
    );
    if (this.viewModel.addingComponentsTableJson) {
      this.addingComponentsTable = JSON.parse(
        this.viewModel.addingComponentsTableJson,
      );
    }

    if (this.viewModel.selectReceptWeight) {
      this.selectReceptWeight = this.viewModel.selectReceptWeight;
      this.selectReceptMode = SelectReceptMode.two;
    }
    // OrderMode.selectRecept
    if (this.viewModel.weightContainers) {
      this.weightContainers = this.viewModel.weightContainers;
    }
    if (this.viewModel.selectReceptIndex) {
      this.selectReceptIndex = this.viewModel.selectReceptIndex;
      // this.orderMode = OrderMode.selectRecept;
    }
    if (this.viewModel.recipeJSON !== undefined) {
      this.componentsNewRecept = JSON.parse(this.viewModel.recipeJSON) as any;
    }
    if (this.viewModel.componentsAddInReceptJson !== undefined) {
      this.componentsAddInRecept = (
        JSON.parse(this.viewModel.componentsAddInReceptJson) as any[]
      ).map((el) => plainToClass(OrderMapper, el)) as any;
    }

    if (this.viewModel.selectReceptPaintFinal !== undefined) {
      this.selectReceptPaintFinal = (
        JSON.parse(this.viewModel.selectReceptPaintFinal) as any[]
      ).map((el) => plainToClass(PaintComponentViewModel, el));
    }
    (await this.repository.getConsumables()).map((el) => {
      this.consumables = el;
    });
    const actual = this.takeSnapshot();
    const saved =
      this.viewModel.id !== undefined
        ? await this.historyRepository.load(this.viewModel.id)
        : undefined;
    if (saved) {
      this.history.load(saved, actual);
    } else {
      this.history.reset(actual);
    }
    this.persistHistory();
  };

  findRecipes = async (): Promise<void> => {
    if (this.receptField === undefined) {
      message.error("Введите номер в картотеке для поиска рецепта");
      return;
    }
    await this.mapOk("recipes", this.repository.findRecept(this.receptField));
  };
  updateReceptField = (text: string): void => {
    this.receptField = text;
  };
  selectRecept = async (index: number) => {
    this.viewModel.recipeJSON = JSON.stringify(this.recipes.at(index));
    this.viewModel.orderCharacteristics = "Recipe_Selected";
    await this.repository.updateOrder(this.viewModel);
  };

  consumablesFindField = (text: string): void => {
    this.consumablesField = text;
  };
  findConsumables = async (): Promise<void> => {
    if (this.consumablesField === undefined) {
      message.error("Введите в поле поиск расходников текст для поиска");
      return;
    }
    await this.mapOk(
      "consumables",
      this.repository.findConsumables(this.consumablesField),
    );
  };
  consumablesModalClose = (): void => {
    this.consumablesModalIsOpen = false;
  };
  consumablesModalOpen = () => {
    this.consumablesModalIsOpen = true;
  };
  addConsumablesToOrder = async (i: number): Promise<void> => {
    const consumables = this.consumables.at(i)!;
    if (this.viewModel.consumables === undefined) {
      this.viewModel.consumables = [];
    }
    const index = this.viewModel.consumables.findIndex(
      (el) => el.consumables.description === consumables.description,
    );

    if (index !== -1) {
      this.viewModel.consumables.at(index)!.count += 1;
      await this.updateOrder();
      return;
    }
    this.viewModel.consumables.add({
      consumables: consumables,
      count: 1,
    });
    await this.updateOrder();
  };
  getOrderCost = () => {
    let cost = 0;
    if (this.selectReceptPaintFinal === undefined) {
      return cost;
    }
    return this.selectReceptPaintFinal.reduce((acc, el) => {
      return (acc += (el.weightCalcRecept ?? 0) * (el.costPrice ?? 0));
    }, 0);
  };
  closeReportComponentsModal = (): void => {
    this.reportComponentsModalIsOpen = false;
  };
  closeReportConsumablesModal = (): void => {
    this.reportConsumablesModalIsOpen = false;
  };
  openReportComponentsModal = () => {
    this.reportComponentsModalIsOpen = true;
  };
  openReportConsumablesModal = () => {
    this.reportConsumablesModalIsOpen = true;
  };
  getOrderStatisticComponents = () =>
    this.selectReceptPaintFinal.map((el) => {
      return {
        privateNumber: el.privateNumber,
        // вес в рецепте
        weightInTheRecipe: el.weightCalcRecept ?? 0,
        // себе стоймость
        costPrice: el.costPrice ?? 0,
        // финальная стоймость
        finalCostOfTheComponent:
          (el.weightCalcRecept ?? 0) * (el.costPrice ?? 0),
      };
    });
  // себестоимость каждого слива: вес компонента слива × цена за грамм
  getDrainsCost = () =>
    this.componentsAddInRecept
      .map((mapper, index) => {
        const drain = mapper.getDrain();
        return {
          number: index,
          weight: mapper.drainWeight ?? 0,
          cost: mapper.balance.reduce(
            (acc, paint, i) =>
              acc + (drain[i]?.weight ?? 0) * (paint.costPrice ?? 0),
            0,
          ),
        };
      })
      .filter((el) => el.number !== 0 && el.weight > 0);
  getCostComponents = () =>
    this.getOrderStatisticComponents().reduce((acc, el) => {
      return acc + el.finalCostOfTheComponent;
      // return acc;
    }, 0);
  getCostConsumables = () => {
    let cost = 0;
    this.viewModel.consumables?.map((el) => {
      cost += el.consumables.costPrice;
    });
    return cost;
  };
  updateComponentsField = (text: string): void => {
    this.componentsField = text;
  };
  findComponents = (): void => {
    if (this.componentsField === undefined) {
      message.error("Введите номер компонента для поиска");
      return;
    }
    this.mapOk(
      "components",
      this.repository.findComponents(this.componentsField),
    );
  };
  closeComponentsModal = (): void => {
    this.isOpenComponentsModal = false;
  };
  openComponentsModal = (): void => {
    this.isOpenComponentsModal = true;
  };
  openNewReceptModal = () => {
    this.isNewReceptModal = true;
  };

  closeNewReceptModal = () => {
    this.isNewReceptModal = false;
  };
  addComponentsToNewRecept = (i: number) => {
    const component = this.components.at(i)!;
    const c = JSON.parse(JSON.stringify(component));
    if (c.weight === undefined) {
      message.error("добавьте вес компонента");
      return;
    }
    c.weightCalcRecept = c.weight;
    this.newReceptComponents = this.newReceptComponents.filter(
      (el) => el.privateNumber !== c.privateNumber,
    );
    this.components = [];
    this.newReceptComponents.push(c);
  };
  addComponentsToRecept = (i: number): void => {
    const component = this.components.at(i)!;
    const c = JSON.parse(JSON.stringify(component));
    c.weightCalcRecept = c.weight;
    this.componentsNewRecept.push(c);
  };
  addComponents = (i: number = 0) => {
    const components = this.components;
    // this.components = [];
    const component = components.at(i)!;
    const c = JSON.parse(JSON.stringify(component));
    const addWeight = c.weight;
    if (c.weight === undefined) {
      message.error("введите добавляймый вес");
      return;
    }
    c.weightCalcRecept = c.weight;

    let oldPaintComponentViewModels = JSON.parse(
      JSON.stringify(
        this.componentsAddInRecept.length === 0
          ? this.componentsNewRecept
          : this.componentsAddInRecept.at(this.componentsAddInRecept.length - 1)
              ?.balance,
      ),
    ) as PaintComponentViewModel[];

    let paintComponentViewModels = JSON.parse(
      JSON.stringify(
        this.componentsAddInRecept.length === 0
          ? this.componentsNewRecept
          : this.componentsAddInRecept.at(this.componentsAddInRecept.length - 1)
              ?.balance,
      ),
    ) as PaintComponentViewModel[];

    paintComponentViewModels
      .rFind<PaintComponentViewModel>(
        (el) => el.privateNumber === c.privateNumber,
      )
      .fold(
        (s) => {
          if (s.weightCalcRecept === undefined) {
            s.weightCalcRecept = 0;
          }
          // s.weightCalcRecept = 0;
          s.weightCalcRecept += c.weight;
          // s.weight = s.weightCalcRecept;
          this.addingComponentsTable.forEach((el) => {
            if (el.privateNumber === c.privateNumber) {
              el.weightCalcRecept += c.weight;
              //todo
            }
          });
        },
        () => {
          this.addingComponentsTable.push(c);
          this.addingComponentsTable.forEach((el) => {
            if (el.privateNumber === c.privateNumber) {
              el.weightCalcRecept = c.weight;
            }
          });
          paintComponentViewModels.add(c);
        },
      );
    const dust = Number(
      this.componentsAddInRecept.at(this.componentsAddInRecept.length - 1)
        ?.dust,
    );
    if (!isNaN(dust)) {
      paintComponentViewModels.forEach((el) => {
        if (el.privateNumber === c.privateNumber) {
          return;
        }
        if (el.weightCalcRecept === undefined) {
          el.weightCalcRecept = 1;
        }

        el.weightCalcRecept =
          (el.weightCalcRecept /
            oldPaintComponentViewModels.reduce((acc, el) => {
              return acc + (el.weightCalcRecept ?? 1);
            }, 0)) *
          dust;
      });
    }
    c.weight = addWeight;
    const step = new OrderMapper(c, paintComponentViewModels);
    step.isAdding = true;
    this.componentsAddInRecept.push(step);
    this.components = [];
    this.closeComponentsModal();
    this.updateOrder();
  };
  addBeginComponents = () => {
    const paintComponentViewModels: PaintComponentViewModel[] = [];
    let lastComponent: any;
    this.newReceptComponents
      .filter(
        (el, index, self) =>
          index === self.findIndex((u) => u.privateNumber === el.privateNumber),
      )
      .forEach((el) => {
        const component = el;
        const c = JSON.parse(JSON.stringify(component));
        c.weightCalcRecept = c.weight;
        // todo
        lastComponent = c;

        paintComponentViewModels
          .rFind<PaintComponentViewModel>(
            (el) => el.privateNumber === c.privateNumber,
          )
          .fold(
            (s) => {
              if (s.weightCalcRecept === undefined) {
                s.weightCalcRecept = 0;
              }
              s.weightCalcRecept = c.weight;
            },
            () => {
              paintComponentViewModels.add(c);
            },
          );
      });
    this.componentsAddInRecept.push(
      new OrderMapper(lastComponent, paintComponentViewModels),
    );
    this.componentsAddInRecept.push(
      new OrderMapper(lastComponent, paintComponentViewModels),
    );
    this.componentsAddInRecept[0].balance.forEach((el) => {
      this.addingComponentsTable.push(el);
    });
    this.updateOrder();
    this.closeNewReceptModal();
  };
  setSelectRecept = (index: number): void => {
    // if (this.selectReceptMode === SelectReceptMode.two) {
    //   return;
    // }
    if (this.orderMode === OrderMode.selectRecept) {
      if (this.selectReceptIndex === index) {
        this.selectReceptIndex = undefined;

        this.updateOrder();
        return;
      }
      this.selectReceptIndex = index;
      this.updateOrder();
    }
  };
  setSelectReceptMode = (): void => {
    if (this.orderMode === OrderMode.none) {
      this.orderMode = OrderMode.selectRecept;
    } else {
      this.orderMode = OrderMode.none;
    }
  };
}
