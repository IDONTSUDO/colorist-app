import type { ClassConstructor } from "class-transformer";
import { CrudIndexedDbRepository } from "../../core/repository/indexed_db_repository";
import { OrderViewModel } from "./orders_db_model";
import type { ReportsViewModel } from "../reports/reports_db_model";

export class OrdersDbRepository extends CrudIndexedDbRepository<OrderViewModel> {
    entity: ClassConstructor<OrderViewModel> = OrderViewModel;
    getOrdersByPeriod = async (viewModel: ReportsViewModel): Promise<OrderViewModel[]> => {
        const repo = this.db.getRepository(this.entity);

        // 1. Создаем базовую коллекцию. 
        // Если есть даты — берем диапазон. Если нет — берем вообще все документы.
        let collection = (viewModel.startDate && viewModel.endDate)
            ? repo.where('createdAt').between(
                viewModel.startDate.getTime(),
                viewModel.endDate.getTime(),
                true,
                true
            )
            : repo.toCollection(); // превращаем в коллекцию для дальнейшей фильтрации

        // 2. Накладываем дополнительные фильтры через функцию .filter()
        collection = collection.filter((order: any) => {
            if (viewModel.auto && order.auto !== viewModel.auto) {
                return false;
            }
            if (viewModel.clientId && order.client !== viewModel.clientId) {
                return false;
            }
            return true;
        });

        // 3. Выполняем запрос к IndexedDB
        return await collection.toArray();
    }

    // Заказы за период [from, to] включительно, от новых к старым.
    // Дата заказа: createdAt, у старых записей — orderCreate.
    getOrdersInPeriod = async (from: Date, to: Date, clientId?: number): Promise<OrderViewModel[]> => {
        const start = new Date(from);
        start.setHours(0, 0, 0, 0);
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        const repo = this.db.getRepository(this.entity);
        const collection = clientId === undefined
            ? repo.toCollection()
            : repo.where('client').equals(clientId);
        const orders = await collection
            .filter((order: OrderViewModel) => {
                const ts = orderDate(order);
                return ts >= start.getTime() && ts <= end.getTime();
            })
            .toArray();
        return orders.sort((a, b) => orderDate(b) - orderDate(a));
    }
}

export const orderDate = (order: OrderViewModel) => order.createdAt ?? order.orderCreate;
