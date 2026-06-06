import { defineEntity } from "@indexeddb-orm/idb-orm";
import { IsNumber, IsString, IsArray } from "class-validator";
import { ValidationModel } from "../../core/model/validation_model";
import makeAutoObservable from "mobx-store-inheritance";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";


export class RecipesViewModel extends ValidationModel {
    constructor() {
        super();
        makeAutoObservable(this);
    }
    comment!: string;
    components!: string; //Компоненты
    componentsArray?: PaintComponentViewModel[] = []; //Компонент
    @IsArray()
    componentsIds: number[] = []; //Компоненты

    @IsNumber()
    weightOfIngredientsAccordingToTheRecipe!: number; //Вес компонентов по рецепту
    @IsNumber()
    weightOfTheCan!: number; // Вес банки
    @IsNumber()
    actualWeightOfComponents!: number; // Реальный вес компонентов
    @IsNumber()
    weightOfComponentsAfterDusting!: number; // Вес компонентов после отпыла
    @IsString()
    auto!: string; // авто
    @IsString()
    cardIndexNumber!: string; // Номер в картотеке
    toServerModel() {
        this.components = JSON.stringify(this.componentsArray);

        this.componentsArray?.map((el) => {
            this.componentsIds.push(el.id ?? 0);
        });
        this.weightOfIngredientsAccordingToTheRecipe =
            this.componentsArray?.reduce((acc, el) => {
                return acc + (el.weight ?? 0);
            }, 0) ?? 0;
        this.componentsArray = undefined;
    }
}

defineEntity(RecipesViewModel, {
    tableName: "recipes-model",
    columns: {
        comment: { indexed: true },
        components: { indexed: true },
        componentsArray: { indexed: true },
        componentsIds: { indexed: true },
        weightOfIngredientsAccordingToTheRecipe: { indexed: true },
        weightOfTheCan: { indexed: true },
        actualWeightOfComponents: { indexed: true },
        weightOfComponentsAfterDusting: { indexed: true },
        auto: { indexed: true },
        cardIndexNumber: { indexed: true },
    },
}); 
