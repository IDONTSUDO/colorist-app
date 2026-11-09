import { IsString, IsInt, } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import makeAutoObservable from "mobx-store-inheritance";
import { defineEntity } from "@indexeddb-orm/idb-orm";
import type { RecipesViewModel } from "../recipes/recipes_store";
import type { ConsumablesViewModel } from "../consumables/consumables_db_model";

// export class OrderViewModel extends ValidationModel {


//     selectReceptPaintFinal: string;
//     orderCreate: number;
//     @IsString({ message: "Поле авто является обязательным" })
//     auto!: string; //АВТО
//     @IsString({ message: "Поле код краски является обязательным" })
//     codePaint!: string; //КОД КРАСКИ
//     @IsString({ message: "Поле цвет краски является обязательным" })
//     color!: string; //ЦВЕТ
//     financeStatus = 'Ожидает расчета';
//     @IsInt({
//         message: "Поле обьем краски которую хочет клиент является обязательным",
//     })
//     theVolumeOfPainTheCustomerWant!: number; //ОБЬЕМ КРАСКИ КОТОРУЮ ХОЧЕТ КЛИЕНТ в граммах
//     @IsInt({ message: "Выберите клиента" })
//     client!: number; //ID model Client
//     statusOrder: string = "Начат"; //НАЧАТ,ЗАКОНЧЕН

// }

export class OrderViewModel extends ValidationModel {
    constructor() {
        super();
        makeAutoObservable(this);
        this.orderCreate = new Date().getTime();
    }
    selectReceptWeight?: number | undefined | null;
    selectReceptIndex?: number | null = undefined;
    markup?: number;
    orderCreate: number;

    weightContainers?: number;
    @IsString({ message: "Поле авто является обязательным" })
    auto!: string; //АВТО
    @IsString({ message: "Поле код краски является обязательным" })
    codePaint!: string; //КОД КРАСКИ
    @IsString({ message: "Поле цвет краски является обязательным" })
    color!: string; //ЦВЕТ
    @IsString({
        message: "Поле обьем краски которую хочет клиент является обязательным",
    })
    theVolumeOfPainTheCustomerWant!: string; //ОБЬЕМ КРАСКИ КОТОРУЮ ХОЧЕТ КЛИЕНТ в граммах
    @IsInt({ message: "Выберите клиента" })
    client!: number; //ID model Client
    statusOrder: string = "Начат"; //НАЧАТ,ЗАКОНЧЕН
    // дата готовности (ms): ставится при переходе статуса в «Готов».
    // Без индекса специально: новая колонка в columns при selective-стратегии
    // сбросила бы всю таблицу orders.
    readyAt?: number | null = undefined;
    orderProcess?: string;
    recipeJSON?: string;
    recipe?: RecipesViewModel;
    addingComponentsTableJson?: string;
    orderCharacteristics?: string = "NEW_RECEPT";
    financeStatus = 'Ожидает оплаты';
    consumables?: { consumables: ConsumablesViewModel; count: number }[] = [];
    consumablesJson?: string;
    componentsAddInReceptJson?: string;
    selectReceptPaintFinal: string;
    createdAt = new Date().getTime()
}
export const ORDER_STATUS_READY = "Готов";

// смена производственного статуса: при переходе в «Готов» пишем дату готовности,
// при уходе из «Готов» — сбрасываем (null, т.к. undefined не попадает в JSON)
export const applyOrderStatus = (order: OrderViewModel, status: string) => {
    const wasReady = order.statusOrder === ORDER_STATUS_READY;
    order.statusOrder = status;
    if (status === ORDER_STATUS_READY) {
        if (!wasReady || !order.readyAt) order.readyAt = new Date().getTime();
    } else {
        order.readyAt = null;
    }
};
// DateRangePicker
defineEntity(OrderViewModel, {
    tableName: "orders",
    columns: {
        auto: { indexed: true },
        codePaint: { indexed: true },
        theVolumeOfPainTheCustomerWant: { indexed: true },
        client: { indexed: true },
        statusOrder: { indexed: true },
        markup: { indexed: true },
        financeStatus: { indexed: true },
        color: { indexed: true },
        orderProcess: { indexed: true },
        recipeJSON: { indexed: true },
        recipe: { indexed: true },
        orderCharacteristics: { indexed: true },
        consumables: { indexed: true },
        consumablesJson: { indexed: true },
        componentsAddInReceptJson: { indexed: true },
        selectReceptIndex: { indexed: true },
        selectReceptWeight: { indexed: true },
        orderCreate: { indexed: true },
        createdAt: { indexed: true },
        weightContainers: { indexed: true }
    },
});


