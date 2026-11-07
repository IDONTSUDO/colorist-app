import { db } from "../../main";
import { OrderHistoryViewModel } from "./order_history_db_model";
import type { SnapshotHistoryState } from "./snapshot_history";

const table = () => db.getTableForEntity(OrderHistoryViewModel);

export class OrderHistoryDbRepository {
  // записи идут строго по очереди, чтобы быстрые undo/redo не перетерли друг друга
  private queue: Promise<unknown> = Promise.resolve();

  load = async (orderId: number): Promise<SnapshotHistoryState | undefined> => {
    try {
      const row = await table().where("orderId").equals(orderId).first();
      if (!row) return undefined;
      return { past: row.past ?? [], future: row.future ?? [], current: row.current };
    } catch (error) {
      console.error("Не удалось загрузить историю заказа", error);
      return undefined;
    }
  };

  save = (orderId: number, state: SnapshotHistoryState) => {
    this.queue = this.queue
      .then(async () => {
        const existing = await table().where("orderId").equals(orderId).first();
        await table().put({
          ...(existing?.id !== undefined ? { id: existing.id } : {}),
          orderId,
          past: state.past,
          future: state.future,
          current: state.current,
          updatedAt: Date.now(),
        } as OrderHistoryViewModel);
      })
      .catch((error) => console.error("Не удалось сохранить историю заказа", error));
    return this.queue;
  };

  delete = async (orderId: number) => {
    try {
      await table().where("orderId").equals(orderId).delete();
    } catch (error) {
      console.error("Не удалось удалить историю заказа", error);
    }
  };
}
