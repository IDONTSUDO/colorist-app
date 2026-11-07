import makeAutoObservable from "mobx-store-inheritance";
import { message } from "antd";
import { observable } from "mobx";
import type { NavigateFunction } from "react-router-dom";
import { NavigateState } from "../../core/store/base_store";
import { db } from "../../main";

export interface ExportTableInfo {
  name: string;
  label: string;
  count: number;
}

const tableLabels: Record<string, string> = {
  clients: "Клиенты",
  orders: "Заказы",
  "paint-components": "Компоненты",
  consumables: "Расходники",
  cars: "Авто",
  "recipes-model": "Рецепты",
  "order-history": "История изменений заказов",
};

// служебные таблицы ORM — не выгружаем и не импортируем
const internalTables = new Set(["migrationMetadata"]);

export type ImportMode = "replace" | "merge";

export interface ImportTableInfo {
  name: string;
  label: string;
  count: number;
}

export class SettingsStore extends NavigateState {
  tables: ExportTableInfo[] = [];
  selected: string[] = [];
  isExporting = false;

  importFileName?: string;
  importData?: Record<string, unknown[]>;
  importTables: ImportTableInfo[] = [];
  importSelected: string[] = [];
  importMode: ImportMode = "replace";
  isImporting = false;

  constructor() {
    super();
    // importData хранится как есть: глубокий observable превращает записи в Proxy,
    // а IndexedDB не может их клонировать (DataCloneError)
    makeAutoObservable(this, { importData: observable.ref });
  }

  async init(navigate?: NavigateFunction): Promise<any> {
    await super.init(navigate);
    await this.loadTables();
  }

  loadTables = async () => {
    this.isLoading = true;
    try {
      const tables = await Promise.all(
        db.tables
          .filter((table) => !internalTables.has(table.name))
          .map(async (table) => ({
            name: table.name,
            label: tableLabels[table.name] ?? table.name,
            count: await table.count(),
          })),
      );
      this.tables = tables;
      this.selected = tables.map((t) => t.name);
    } catch (error) {
      console.error(error);
      message.error("Не удалось прочитать базу данных");
    } finally {
      this.isLoading = false;
    }
  };

  isSelected = (name: string) => this.selected.includes(name);

  toggle = (name: string) => {
    this.selected = this.isSelected(name)
      ? this.selected.filter((el) => el !== name)
      : [...this.selected, name];
  };

  get isAllSelected() {
    return (
      this.tables.length > 0 && this.selected.length === this.tables.length
    );
  }

  toggleAll = () => {
    this.selected = this.isAllSelected ? [] : this.tables.map((t) => t.name);
  };

  exportSelected = async () => {
    if (this.selected.length === 0) {
      message.warning("Выберите хотя бы одну таблицу");
      return;
    }
    this.isExporting = true;
    try {
      const data: Record<string, unknown[]> = {};
      for (const name of this.selected) {
        data[name] = await db.table(name).toArray();
      }
      const payload = {
        database: db.name,
        version: db.verno,
        exportedAt: new Date().toISOString(),
        tables: data,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${db.name}-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      message.success("База данных выгружена");
    } catch (error) {
      console.error(error);
      message.error("Ошибка при выгрузке");
    } finally {
      this.isExporting = false;
    }
  };

  loadImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const tables = parsed?.tables;
      if (!tables || typeof tables !== "object" || Array.isArray(tables)) {
        throw new Error("Нет поля tables");
      }
      const existing = new Set(db.tables.map((t) => t.name));
      const data: Record<string, unknown[]> = {};
      const skipped: string[] = [];
      for (const [name, rows] of Object.entries(tables)) {
        if (internalTables.has(name)) continue;
        if (!existing.has(name) || !Array.isArray(rows)) {
          skipped.push(name);
          continue;
        }
        data[name] = rows;
      }
      if (Object.keys(data).length === 0) {
        throw new Error("Нет подходящих таблиц");
      }
      if (skipped.length > 0) {
        message.warning(`Пропущены неизвестные таблицы: ${skipped.join(", ")}`);
      }
      this.importFileName = file.name;
      this.importData = data;
      this.importTables = Object.entries(data).map(([name, rows]) => ({
        name,
        label: tableLabels[name] ?? name,
        count: rows.length,
      }));
      this.importSelected = this.importTables.map((t) => t.name);
    } catch (error) {
      console.error(error);
      message.error("Файл не похож на выгрузку базы данных");
      this.resetImport();
    }
  };

  resetImport = () => {
    this.importFileName = undefined;
    this.importData = undefined;
    this.importTables = [];
    this.importSelected = [];
  };

  isImportSelected = (name: string) => this.importSelected.includes(name);

  toggleImport = (name: string) => {
    this.importSelected = this.isImportSelected(name)
      ? this.importSelected.filter((el) => el !== name)
      : [...this.importSelected, name];
  };

  setImportMode = (mode: ImportMode) => {
    this.importMode = mode;
  };

  importSelectedTables = async () => {
    if (!this.importData || this.importSelected.length === 0) {
      message.warning("Выберите хотя бы одну таблицу");
      return;
    }
    const data = this.importData;
    const names = [...this.importSelected];
    const mode = this.importMode;
    this.isImporting = true;
    try {
      const tables = names.map((name) => db.table(name));
      // одна транзакция: при ошибке ни одна таблица не изменится
      await db.transaction("rw", tables, async () => {
        for (const table of tables) {
          if (mode === "replace") await table.clear();
          await table.bulkPut(data[table.name]);
        }
      });
      message.success("База данных импортирована");
      this.resetImport();
      await this.loadTables();
    } catch (error) {
      console.error(error);
      message.error("Ошибка при импорте, данные не изменены");
    } finally {
      this.isImporting = false;
    }
  };
}
