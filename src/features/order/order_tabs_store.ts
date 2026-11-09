import { makeAutoObservable } from "mobx";

export interface OrderTab {
  id: number;
}

const STORAGE_KEY = "order-tabs";

const load = (): OrderTab[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t && Number.isInteger(t.id) && t.id > 0,
    ) as OrderTab[];
  } catch {
    return [];
  }
};

// Открытые вкладки заказов (как вкладки браузера). Само состояние заказа
// и история undo/redo лежат в БД, поэтому вкладка — это только id.
class OrderTabsStore {
  tabs: OrderTab[] = load();

  constructor() {
    makeAutoObservable(this);
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tabs));
    } catch {
      // хранилище недоступно — вкладки просто не переживут перезагрузку
    }
  }

  has(id: number) {
    return this.tabs.some((t) => t.id === id);
  }

  // добавить вкладку; afterId — вставить справа от этой вкладки
  open(id: number, afterId?: number) {
    if (!Number.isInteger(id) || id <= 0 || this.has(id)) return;
    const index =
      afterId === undefined ? -1 : this.tabs.findIndex((t) => t.id === afterId);
    if (index === -1) this.tabs.push({ id });
    else this.tabs.splice(index + 1, 0, { id });
    this.persist();
  }

  // закрыть вкладку; возвращает id соседней вкладки (куда перейти), если есть
  close(id: number): number | undefined {
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    this.tabs.splice(index, 1);
    this.persist();
    const next = this.tabs[index] ?? this.tabs[index - 1];
    return next?.id;
  }

  closeOthers(id: number) {
    this.tabs = this.tabs.filter((t) => t.id === id);
    this.persist();
  }

  move(fromId: number, toId: number) {
    const from = this.tabs.findIndex((t) => t.id === fromId);
    const to = this.tabs.findIndex((t) => t.id === toId);
    if (from === -1 || to === -1 || from === to) return;
    const [tab] = this.tabs.splice(from, 1);
    this.tabs.splice(to, 0, tab);
    this.persist();
  }
}

export const orderTabsStore = new OrderTabsStore();

// клик по ссылке на заказ: Ctrl/Cmd/средняя кнопка — открыть во вкладке
// в фоне, обычный клик — перейти в заказ
export const isBackgroundOpen = (e: React.MouseEvent) =>
  e.ctrlKey || e.metaKey || e.button === 1;
