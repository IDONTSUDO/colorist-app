import { Result } from "../../core/helper/result";
import { ClientsDbRepository } from "../clients/clients_db_repository";
import { ConsumablesDbRepository } from "../consumables/consumables_db_repository";
import type { OrderViewModel } from "../orders/orders_db_model";
import { OrdersDbRepository } from "../orders/orders_db_repository";
import { PaintComponentsDbRepository } from "../paint_components/paint_components_db_repository";
import { RecipesDbRepository } from "../recipes/recipes_db_repository";

export class IOrderDbRepository extends OrdersDbRepository {
  clientDbRepository = new ClientsDbRepository();
  recipesDbRepository = new RecipesDbRepository();
  consumablesDbRepository = new ConsumablesDbRepository();

  paintComponentsDbRepository = new PaintComponentsDbRepository();
  findComponents = async (componentsField: string) => (await this.paintComponentsDbRepository.findModel('privateNumber', componentsField)).map((el) => {
    return Result.ok(el)
  });
  findConsumables = (consumablesField: string) => this.consumablesDbRepository.findModel('description', consumablesField);
  getConsumables = async () =>
    (
      await this.consumablesDbRepository.getPage(1)
    ).map((el) => el.data);
  findRecept = (receptField: string) => this.recipesDbRepository.findModel('cardIndexNumber', receptField);
  getClientById = async (id: number) => (await this.clientDbRepository.findModel('id', id as any)).map((el) => Result.ok(el.at(0)));
  getOrderById = async (id: string) =>
    (await this.findModel('id', id)).map((el) => Result.ok(el.at(0)));
  updateOrder = (order: OrderViewModel) => this.edit(order);
}
