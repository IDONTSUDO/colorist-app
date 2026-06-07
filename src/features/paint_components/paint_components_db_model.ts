import { defineEntity } from "@indexeddb-orm/idb-orm";
import { IsNumber, IsNotEmpty, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import makeAutoObservable from "mobx-store-inheritance";


export class PaintComponentViewModel extends ValidationModel {
    @IsNumber({}, { message: "Поле вес в граммах обязательно" })
    weight?: number;
    weightCalcRecept?: number;
    @IsNumber({}, { message: "Поле цена обязательно" })
    costPrice: number;
    @IsNotEmpty({ message: "Поле приватный номер не может быть пустым" })
    @IsString({ message: "Поле приватный номер обязательно" })
    privateNumber: string;


    constructor() {
        super();
        makeAutoObservable(this);
    }
}

defineEntity(PaintComponentViewModel, {
    tableName: "paint-components",
    columns: {
        weight: { indexed: true },
        weightCalcRecept: { indexed: true },
        costPrice: { indexed: true },
        privateNumber: { indexed: true },
        currentBalance: { indexed: true },
    },
}); 
