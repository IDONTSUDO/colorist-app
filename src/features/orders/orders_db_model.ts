import { IsString, IsInt, } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import makeAutoObservable from "mobx-store-inheritance";
import { defineEntity } from "@indexeddb-orm/idb-orm";

export class OrderViewModel extends ValidationModel {
    constructor() {
        super();
        makeAutoObservable(this);
    }
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

}
defineEntity(OrderViewModel, {
    tableName: "orders",
    columns: {
        auto: { required: true, indexed: true },

        codePaint: { required: true, indexed: true },
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
    },
});