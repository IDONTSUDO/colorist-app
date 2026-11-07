import { makeAutoObservable } from "mobx";

export interface SnapshotHistoryState {
  past: string[];
  future: string[];
  current?: string;
}

/**
 * Линейная история снимков состояния (строки JSON) для undo/redo.
 * current — текущее состояние; past/future — стеки для отмены и повтора.
 */
export class SnapshotHistory {
  private past: string[] = [];
  private future: string[] = [];
  private current?: string;

  constructor(private readonly limit = 100) {
    makeAutoObservable(this);
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  get state(): SnapshotHistoryState {
    return {
      past: [...this.past],
      future: [...this.future],
      current: this.current,
    };
  }

  // восстановление сохраненной истории; если состояние заказа с тех пор
  // изменилось (импорт, другая вкладка) — текущее становится новым шагом
  load(state: SnapshotHistoryState, actual: string) {
    this.past = state.past.slice(-this.limit);
    this.future = state.future;
    this.current = state.current;
    this.record(actual);
  }

  reset(snapshot: string) {
    this.past = [];
    this.future = [];
    this.current = snapshot;
  }

  // новое состояние: кладем прежнее в past, ветку redo сбрасываем
  // возвращает true, если история изменилась
  record(snapshot: string): boolean {
    if (this.current === undefined) {
      this.current = snapshot;
      return true;
    }
    if (snapshot === this.current) return false;
    this.past.push(this.current);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
    this.current = snapshot;
    return true;
  }

  undo(): string | undefined {
    const prev = this.past.pop();
    if (prev === undefined) return undefined;
    this.future.push(this.current!);
    this.current = prev;
    return prev;
  }

  redo(): string | undefined {
    const next = this.future.pop();
    if (next === undefined) return undefined;
    this.past.push(this.current!);
    this.current = next;
    return next;
  }
}
