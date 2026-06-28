import makeAutoObservable from "mobx-store-inheritance";
import { ValidationModel } from "../../core/model/validation_model";

export class ReportsViewModel extends ValidationModel {
    // numberPhone?: string;
    clientId?: number;
    auto?: string
    car?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    constructor() {
        super();
        makeAutoObservable(this);
    }
} 
