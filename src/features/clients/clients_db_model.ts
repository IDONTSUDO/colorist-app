import { defineEntity } from "@indexeddb-orm/idb-orm";
import { IsNotEmpty, IsString } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
export class ClientViewModel extends ValidationModel {
    @IsNotEmpty({ message: "Поле фамиля не может быть пустым" })
    @IsString({ message: "Поле фамилия обязательно" })
    family: string;
    @IsNotEmpty({ message: "Поле имя не может быть пустым" })
    @IsString({ message: "Поле имя обязательно" })
    name: string;
    @IsNotEmpty({ message: "Поле номер телефона не может быть пустым" })
    @IsString({ message: "Поле номер телефона обязательно" })
    numberPhone: string;
    @IsNotEmpty({ message: "Поле отчество не может быть пустым" })
    @IsString({ message: "Поле отчество обязательно" })
    surName: string;
}

defineEntity(ClientViewModel, {
    tableName: "clients",
    columns: {
        name: { indexed: true },
        family: { indexed: true },
        numberPhone: { indexed: true, unique: true },
        surName: { indexed: true },
    },
});