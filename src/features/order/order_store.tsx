import makeAutoObservable from "mobx-store-inheritance";
import { FormState } from "../../core/store/base_store";
import { ValidationModel } from "../../core/model/validation_model";
import { IOrderDbRepository } from "./order_db_repository";
import { IsInt, IsString } from "class-validator";
import { message } from "antd";
import type { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import type { ConsumablesViewModel } from "../consumables/consumables_db_model";
import type { RecipesViewModel } from "../recipes/recipes_db_model";
import { ClientViewModel } from "../clients/clients_db_model";
import { plainToClass } from "class-transformer";

export class OrderViewModel extends ValidationModel {
  markup?: number;
  financeStatus!: string;
  @IsString({ message: "Поле авто является обязательным" })
  auto!: string; //АВТО
  @IsString({ message: "Поле код краски является обязательным" })
  codePaint!: string; //КОД КРАСКИ
  @IsString({ message: "Поле цвет краски является обязательным" })
  color!: string; //ЦВЕТ
  @IsInt({
    message: "Поле обьем краски которую хочет клиент является обязательным",
  })
  theVolumeOfPainTheCustomerWant!: number; //ОБЬЕМ КРАСКИ КОТОРУЮ ХОЧЕТ КЛИЕНТ в граммах
  @IsInt({ message: "Выберите клиента" })
  client!: number; //ID model Client
  statusOrder: string = "Начат"; //НАЧАТ,ЗАКОНЧЕН
  orderProcess?: string;
  recipeJSON?: string;
  recipe?: RecipesViewModel;
  addingComponentsTableJson?: string;
  orderCharacteristics?: string = "NEW_RECEPT";
  consumables?: { consumables: ConsumablesViewModel; count: number }[] = [];
  consumablesJson?: string;
  componentsAddInReceptJson?: string;
}
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
export class OrderStore extends FormState<OrderViewModel> {
  rrrfdasf(): void {
    if (this.selectReceptIndex === undefined) {
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
  }
  updateSelectReceptWeight = (arg0: number): void => {
    this.selectReceptWeight = arg0;
  };
  selectReceptPaintFinal: PaintComponentViewModel[] = [];
  selectReceptMode: SelectReceptMode = SelectReceptMode.one;
  selectReceptWeight?: number = undefined;
  selectReceptIndex?: number = undefined;
  weihgs: number[] = [];
  aabab = async () => {
    await this.mapOk("components", this.repository.findComponents("3"));
  };
  orderCharacteristics = "NEW_RECEPT";
  isNewReceptModal = false;
  additiveComponents: { componentId: number; additives: number }[][] = [];
  componentsWeights: { componentId: number; newWeights: number }[][] = [];
  // вес остастка
  currentRemainder = 0;
  // Вес отпыла
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
    this.checkDDD();
  }
  mapperBalance = (weightCalcRecept: number | undefined) => {
    return weightCalcRecept;
  };
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
  getRemainderInComponent = (el: PaintComponentViewModel) => {
    const p = el.weightCalcRecept! / this.getCom();
    return String((p * Number(this.getWeightOfTheDust())).toFixed(2));
  };
  // Остаток
  getRemainder = () => String(this.getCommonWeight() - this.currentRemainder);
  // Отпыл
  getVacation = (): string => String(this.afterDust);
  //  Вес после отпыла
  getWeightOfTheDust = () => {
    return String(this.getCom() - this.afterDust);
  };
  //общицй вес без тары
  getCom = () => {
    return this.componentsNewRecept.reduce((acc, el) => {
      return acc + el.weightCalcRecept!;
    }, 0);
  };
  // общий вес с тарой
  getCommonWeight = (): number => {
    return (
      this.componentsNewRecept.reduce((acc, el) => {
        return acc + el.weightCalcRecept!;
      }, 0) + this.weightContainers
    );
  };

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
    this.checkDDD();
  }
  checkDDD = () => {
    if (this.additiveComponents.isNotEmpty()) {
      return;
    }
    // this.additiveComponents.push(
    //    ,
    // );

    this.additiveComponents.push(
      this.componentsNewRecept.map((el) => {
        return {
          componentId: el.id ?? 0,
          additives: 0,
        };
      }),
    );
  };
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
    this.viewModel.componentsAddInReceptJson = JSON.stringify(
      this.componentsAddInRecept,
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
    // TODO DELETE
    this.mapOk("components", this.repository.findComponents("5"));
    if (this.viewModel.addingComponentsTableJson) {
      this.addingComponentsTable = JSON.parse(
        this.viewModel.addingComponentsTableJson,
      );
    }
    if (this.viewModel.recipeJSON !== undefined) {
      this.componentsNewRecept = JSON.parse(this.viewModel.recipeJSON) as any;
    }
    if (this.viewModel.componentsAddInReceptJson !== undefined) {
      this.componentsAddInRecept = (
        JSON.parse(this.viewModel.componentsAddInReceptJson) as any[]
      ).map((el) => plainToClass(OrderMapper, el)) as any;
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

  receptToOrderMapper = (): PaintComponentViewModel[] => {
    // const recipe = JSON.parse(this.viewModel.recipeJSON ?? "");
    // recipe.components = JSON.parse(recipe.components);

    // if (recipe?.components !== null && recipe?.components !== undefined) {
    //   const components = recipe?.components as PaintComponentViewModel[];
    //   const sumAllPigments = components.reduce((acc, el) => {
    //     return acc + el.weight!;
    //   }, 0);

    //   components.map((el) => {
    //     el.weight =
    //       (el.weight! / sumAllPigments) *
    //       this.viewModel.theVolumeOfPainTheCustomerWant;
    //     return el;
    //   });

    //   return components;
    // }

    return [];
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
    this.viewModel.consumables?.map((el) => {
      cost += el.consumables.costPrice;
    });
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
  getCostComponents = () => {
    let cost = 0;

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
    // todo:

    const component = this.components.at(i)!;
    const c = JSON.parse(JSON.stringify(component));
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
    this.newReceptComponents
      .filter(
        (el, index, self) =>
          index === self.findIndex((u) => u.privateNumber === el.privateNumber),
      )
      .forEach((el) => {
        const component = el;
        const c = JSON.parse(JSON.stringify(component));
        c.weightCalcRecept = c.weight;

        const paintComponentViewModels = JSON.parse(
          JSON.stringify(
            this.componentsAddInRecept.length === 0
              ? this.componentsNewRecept
              : this.componentsAddInRecept.at(
                  this.componentsAddInRecept.length - 1,
                )?.balance,
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
              s.weightCalcRecept = c.weight;
            },
            () => {
              paintComponentViewModels.add(c);
            },
          );
        // componentsNewRecept
        this.componentsAddInRecept.push(
          new OrderMapper(c, paintComponentViewModels),
        );
      });
    // [
    //   {
    //     add: {},
    //     balance: [
    //       {
    //         weight: 2,
    //         costPrice: 1,
    //         privateNumber: "1",
    //         currentBalance: 1,
    //         id: 3,
    //         weightCalcRecept: 2,
    //       },
    //       {
    //         weight: 2,
    //         costPrice: 2,
    //         privateNumber: "2",
    //         currentBalance: 2,
    //         id: 4,
    //         weightCalcRecept: 2,
    //       },
    //       // {
    //       //   weight: 2,
    //       //   costPrice: 3,
    //       //   privateNumber: "3",
    //       //   currentBalance: 3,
    //       //   id: 5,
    //       //   weightCalcRecept: 2,
    //       // },
    //       {
    //         weight: 2,
    //         costPrice: 4,
    //         privateNumber: "4",
    //         currentBalance: 4,
    //         id: 6,
    //         weightCalcRecept: 2,
    //       },
    //       // {
    //       //   weight: 2,
    //       //   costPrice: 5,
    //       //   privateNumber: "5",
    //       //   currentBalance: 5,
    //       //   id: 7,
    //       //   weightCalcRecept: 2,
    //       // },
    //     ],
    //   },
    // ].forEach((el) => {
    //   this.componentsAddInRecept.push(plainToInstance(OrderMapper, el));
    // });
    // addingComponentsTable
    this.componentsAddInRecept[0].balance.forEach((el) => {
      this.addingComponentsTable.push(el);
    });
    // this.componentsAddInRecept = JSON.parse();
    // console.log(JSON.stringify(this.componentsAddInRecept));
    this.updateOrder();
    this.closeNewReceptModal();
  };
}
