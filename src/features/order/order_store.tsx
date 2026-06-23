import makeAutoObservable from "mobx-store-inheritance";
import { FormState } from "../../core/store/base_store";
import { IOrderDbRepository } from "./order_db_repository";
import { message } from "antd";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import type { ConsumablesViewModel } from "../consumables/consumables_db_model";
import type { RecipesViewModel } from "../recipes/recipes_db_model";
import { ClientViewModel } from "../clients/clients_db_model";
import { plainToClass } from "class-transformer";
import { OrderViewModel } from "../orders/orders_db_model";

export class OrderMapper {
  add: PaintComponentViewModel;
  dust?: string;
  balance: PaintComponentViewModel[];
  constructor(
    add: PaintComponentViewModel,
    balance: PaintComponentViewModel[],
  ) {
    this.add = add;
    this.balance = balance;
    makeAutoObservable(this);
  }
  getBalance(store: OrderStore) {
    return (
      this.balance.reduce((acc, el) => {
        return acc + (el?.weightCalcRecept ?? 0);
      }, 0) +
      store.weightContainers -
      Number(this.dust ?? 0)
    );
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
export class OrderStore extends FormState<OrderViewModel> {
  selectReceptPaintFinal: PaintComponentViewModel[] = [];
  selectReceptMode: SelectReceptMode = SelectReceptMode.one;
  selectReceptWeight?: number = undefined;
  selectReceptIndex?: number = undefined;
  weihgs: number[] = [];
  orderMode = OrderMode.none;
  orderCharacteristics = "NEW_RECEPT";
  isNewReceptModal = false;
  additiveComponents: { componentId: number; additives: number }[][] = [];
  componentsWeights: { componentId: number; newWeights: number }[][] = [];
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
    if (!Number(value).isPositive()) {
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
  };
  updateRemainder(text: string): void {
    this.afterDust = Number(text);
  }

  updateWeights = (newWeight: number, i: number) => {
    this.components.at(i)!.weight = newWeight;
  };
  selectOrderProcessType = async (type: string) => {
    this.viewModel.orderCharacteristics = type;
    this.updateOrder();
    this.repository.edit(this.viewModel);
  };
  updateOrder = async () => {
    this.viewModel.consumablesJson = JSON.stringify(this.viewModel.consumables);
    this.viewModel.addingComponentsTableJson = JSON.stringify(
      this.addingComponentsTable,
    );
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
  initParams = async (id: string) => {
    await this.mapOk(
      "viewModel",
      this.repository.getOrderById(Number(id) as any),
    );

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

    if (this.viewModel.selectReceptIndex) {
      this.selectReceptIndex = this.viewModel.selectReceptIndex;
      this.orderMode = OrderMode.selectRecept;
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
  getCostComponents = () => {
    let cost = 0;
    if (this.selectReceptPaintFinal === undefined) {
      return cost;
    }
    return this.selectReceptPaintFinal.reduce((acc, el) => {
      return (acc += (el.weightCalcRecept ?? 0) * (el.costPrice ?? 0));
    }, 0);
    // const recipe = JSON.parse(this.viewModel.recipeJSON ?? "");
    // recipe.components = JSON.parse(recipe.components);
    // const components = recipe?.components as PaintComponentViewModel[];
    // const sumAllPigments = components.reduce((acc, el) => {
    //   return acc + el.weight!;
    // }, 0);

    // components.map((el) => {
    //   el.weight =
    //     (el.weight! / sumAllPigments) *
    //     this.viewModel.theVolumeOfPainTheCustomerWant;
    //   return el;
    // });
    // components?.map((el) => {
    //   cost += el.costPrice * (el.weight ?? 1);
    // });
    return cost;
  };
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
      message.error("добавте вес компонента");
      return;
    }
    c.weightCalcRecept = c.weight;
    this.newReceptComponents = this.newReceptComponents.filter(
      (el) => el.privateNumber !== c.privateNumber,
    );
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
          s.weightCalcRecept += c.weight;
          // s.weight = s.weightCalcRecept;
          this.addingComponentsTable.forEach((el) => {
            if (el.privateNumber === c.privateNumber) {
              el.weightCalcRecept += c.weight;
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

    this.componentsAddInRecept.push(
      new OrderMapper(c, paintComponentViewModels),
    );
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
    if (this.selectReceptMode === SelectReceptMode.two) {
      return;
    }
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
