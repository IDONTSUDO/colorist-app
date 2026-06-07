import makeAutoObservable from "mobx-store-inheritance";
import { ValidationModel } from "../../core/model/validation_model";
import { IsNumber, IsString } from "class-validator";
import { defineEntity } from "@indexeddb-orm/idb-orm";


export class ConsumablesViewModel extends ValidationModel {
    constructor() {
        super();
        makeAutoObservable(this);
    }
    @IsNumber(
        {},
        { message: "Поле цена за единицу измеренеия является обязательным" }
    )
    costPrice: number; //цена за единицу измеренеия
    @IsString({ message: "Поле описание является обязательным" })
    description: string; // описание
    @IsString({ message: "Поле еденица измерения является обязательным" })
    unitOfMeasurement: string = "Граммы"; //еденица измерения
}
defineEntity(ConsumablesViewModel, {
    tableName: "consumables",
    columns: {
        costPrice: { indexed: true },
        description: { indexed: true },
        currentBalance: { indexed: true },
        privateNumber: { indexed: true },
        unitOfMeasurement: { indexed: true },
    },
});