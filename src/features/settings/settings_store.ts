import makeAutoObservable from "mobx-store-inheritance";
import { ClientViewModel } from "../clients/clients_db_model";
import { PaintComponentViewModel } from "../paint_components/paint_components_db_model";
import { OrderViewModel } from "../orders/orders_db_model";
import { NavigateState } from "../../core/store/base_store";




export class SettingsStore extends NavigateState {
    tables = [{ table: ClientViewModel, name: 'клиенты' }, { table: PaintComponentViewModel, name: 'компоненты' }, { table: OrderViewModel, name: 'заказы' }];
    constructor() {
        super();
        makeAutoObservable(this)
    }

}