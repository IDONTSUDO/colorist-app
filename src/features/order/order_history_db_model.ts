import { defineEntity } from "@indexeddb-orm/idb-orm";
import { ValidationModel } from "../../core/model/validation_model";

// История undo/redo производства заказа: одна запись на заказ.
// Снимки — строки JSON состояния производства (см. OrderStore.takeSnapshot).
export class OrderHistoryViewModel extends ValidationModel {
  orderId: number;
  past: string[] = [];
  future: string[] = [];
  current?: string;
  updatedAt: number;
}

defineEntity(OrderHistoryViewModel, {
  tableName: "order-history",
  columns: {
    orderId: { indexed: true, unique: true },
  },
});
