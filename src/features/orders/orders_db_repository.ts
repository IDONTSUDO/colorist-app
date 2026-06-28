import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { OrderViewModel } from "./orders_db_model";
import type { ReportsViewModel } from "../reports/reports_db_model";

export class OrdersDbRepository extends CrudIndexedDbRepository<OrderViewModel> {
    entity: ClassConstructor<OrderViewModel> = OrderViewModel;
    f = async (viewModel: ReportsViewModel) => {
        this.db.getRepository(this.entity);
        if (viewModel.endDate && viewModel.startDate) {
            // query.where('createdAt', viewModel.startDate.getTime(), viewModel.endDate.getTime()) // по индексу

        }
        // return Result.ok(await this.db.getRepository(this.entity).where().equals(value).toArray());

    }
} 