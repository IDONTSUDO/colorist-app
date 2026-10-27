import { defineEntity } from "@indexeddb-orm/idb-orm";
import { IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";

export class CarsViewModel extends ValidationModel {
    @IsString()
    name: string
}
defineEntity(CarsViewModel, {
    tableName: "cars",
    columns: {
        name: { indexed: true, unique: true },
    },
});