import JSZip from "jszip";

// Разбор Excel-карточки заказа (формат «ЛИСТ№ 3000»): один лист — один заказ.
// В шапке: ФИО, А/м, КодКраски, VIN, Госномер, Система, Цвет, Объем, Цена,
// Деталь. Ниже таблица «ПОДБОР»: компоненты, СТАНДАРТ и до 8 подборов
// (ВЕС КОМП. / ОСТАТОК / ДОБАВКА), строки «Вес остатка», «Вес тары» и
// «гр.» — слив по каждому подбору.

export interface ExcelOrderComponent {
  privateNumber: string;
  standard: number;
}

export interface ExcelOrderStep {
  // вес каждого компонента (по индексам components)
  weights: number[];
  // «Вес остатка» с тарой, как в Excel; undefined — ещё не взвешивали
  remainderGross?: number;
  // добавка после этого подбора (по индексам components)
  additions: (number | undefined)[];
  // сколько грамм слили по этому подбору
  drain?: number;
}

export interface ExcelOrder {
  sheetName: string;
  clientName: string;
  auto: string;
  codePaint: string;
  color: string;
  volume: string;
  vin: string;
  plate: string;
  system: string;
  price: string;
  part: string;
  tare: number;
  components: ExcelOrderComponent[];
  steps: ExcelOrderStep[];
}

export interface ExcelSheetResult {
  sheetName: string;
  order?: ExcelOrder;
  error?: string;
}

type Grid = Map<string, string>;

const decodeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");

// текст ячейки/строки: все <t> подряд (rich text разбит на <r><t>)
const joinText = (xml: string) =>
  decodeXml(
    Array.from(xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g))
      .map((m) => m[1])
      .join(""),
  );

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

const colToIndex = (col: string) =>
  col.split("").reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0);

const indexToCol = (index: number) => {
  let s = "";
  let n = index;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

const ref = (col: number, row: number) => `${indexToCol(col)}${row}`;

const parseSheet = (xml: string, sharedStrings: string[]): Grid => {
  const grid: Grid = new Map();
  const cellRe = /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  for (const m of xml.matchAll(cellRe)) {
    const tag = ` ${m[1]}`;
    const inner = m[2] ?? "";
    const r = attr(tag, "r");
    if (r === undefined) continue;
    const type = attr(tag, "t");
    let value: string | undefined;
    if (type === "inlineStr") {
      value = joinText(inner);
    } else {
      const v = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (v === undefined) continue;
      value = type === "s" ? sharedStrings[Number(v)] ?? "" : decodeXml(v);
      // ошибки формул (#DIV/0! и т.п.) считаем пустыми
      if (type === "e") continue;
    }
    grid.set(r, value);
  }
  return grid;
};

const text = (grid: Grid, col: number, row: number) =>
  (grid.get(ref(col, row)) ?? "").trim();

const number = (grid: Grid, col: number, row: number): number | undefined => {
  const raw = text(grid, col, row).replace(",", ".");
  if (raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const norm = (s: string) => s.toLowerCase().replace(/[\s.:№]/g, "");

// клетка с подписью в первых строках таблицы
const findLabel = (grid: Grid, label: string, maxRow = 60) => {
  const target = norm(label);
  for (const [r, v] of grid) {
    if (norm(v) !== target) continue;
    const m = r.match(/^([A-Z]+)(\d+)$/)!;
    const row = Number(m[2]);
    if (row > maxRow) continue;
    return { col: colToIndex(m[1]), row };
  }
  return undefined;
};

// значение шапки — в ячейке сразу справа от подписи (начало объединения)
const headerValue = (grid: Grid, label: string) => {
  const cell = findLabel(grid, label, 4);
  return cell === undefined ? "" : text(grid, cell.col + 1, cell.row);
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseOrder = (grid: Grid, sheetName: string): ExcelOrder => {
  const header = findLabel(grid, "СТАНДАРТ");
  if (header === undefined) {
    throw new Error("не найдена таблица подбора (колонка «СТАНДАРТ»)");
  }
  const componentCol = header.col - 1;
  const totalRow = findLabel(grid, "Вес (гр)")?.row ?? header.row + 16;

  // строки компонентов: номер в первой колонке, «0» — пустая строка
  const rows: number[] = [];
  const components: ExcelOrderComponent[] = [];
  for (let row = header.row + 1; row < totalRow; row++) {
    const privateNumber = text(grid, componentCol, row);
    if (privateNumber === "" || privateNumber === "0") continue;
    if (components.some((el) => el.privateNumber === privateNumber)) {
      throw new Error(`компонент ${privateNumber} указан дважды`);
    }
    rows.push(row);
    components.push({
      privateNumber,
      standard: round2(number(grid, header.col, row) ?? 0),
    });
  }
  if (components.length === 0) throw new Error("в листе нет компонентов");

  // колонки подборов: «ВЕС КОМП.», за ней «ОСТАТОК» и «ДОБАВКА»
  const stepCols: number[] = [];
  for (let col = header.col + 1; col < header.col + 60; col++) {
    if (norm(text(grid, col, header.row)) === norm("ВЕС КОМП.")) stepCols.push(col);
  }

  const tareCell = findLabel(grid, "Вес тары");
  const tare = tareCell ? number(grid, tareCell.col, tareCell.row + 1) ?? 0 : 0;
  // «Вес остатка» стоит в той же строке, что и подпись «Вес тары»
  const remainderRow = tareCell?.row ?? totalRow + 2;

  // слив: строка «гр.» под таблицей «Пигмент 1..8»
  const pigment = findLabel(grid, "Пигмент");
  const drainLabel = findLabel(grid, "гр");
  const drainOf = (step: number) =>
    pigment && drainLabel ? number(grid, pigment.col + step, drainLabel.row) : undefined;

  const steps: ExcelOrderStep[] = [];
  for (let i = 0; i < stepCols.length; i++) {
    const col = stepCols[i];
    const weights = rows.map((row) => round2(number(grid, col, row) ?? 0));
    // дальше подборов не было: формулы Excel дают нули
    if (weights.reduce((acc, w) => acc + w, 0) <= 0) break;
    const additions = rows.map((row) => {
      const a = number(grid, col + 2, row);
      return a === undefined || a === 0 ? undefined : round2(a);
    });
    const remainderGross = number(grid, col, remainderRow);
    const drain = drainOf(i + 1);
    steps.push({
      weights,
      additions,
      remainderGross: remainderGross === undefined ? undefined : round2(remainderGross),
      drain: drain && drain > 0 ? round2(drain) : undefined,
    });
    // остаток не взвешен — это последний подбор
    if (remainderGross === undefined) break;
  }
  if (steps.length === 0) {
    // подборов нет — заказ начинается со стандарта
    steps.push({
      weights: components.map((el) => el.standard),
      additions: components.map(() => undefined),
    });
  }

  return {
    sheetName,
    clientName: headerValue(grid, "ФИО"),
    auto: headerValue(grid, "А/м"),
    codePaint: headerValue(grid, "КодКраски"),
    color: headerValue(grid, "Цвет"),
    volume: headerValue(grid, "Объем"),
    vin: headerValue(grid, "VIN"),
    plate: headerValue(grid, "Госномер"),
    system: headerValue(grid, "Система"),
    price: headerValue(grid, "Цена"),
    part: headerValue(grid, "Деталь"),
    tare: round2(tare),
    components,
    steps,
  };
};

export const parseExcelOrders = async (
  data: ArrayBuffer | Uint8Array,
): Promise<ExcelSheetResult[]> => {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    throw new Error("Файл не похож на Excel (.xlsx)");
  }
  const read = (path: string) => zip.file(path)?.async("string");
  const workbook = await read("xl/workbook.xml");
  const rels = await read("xl/_rels/workbook.xml.rels");
  if (workbook === undefined || rels === undefined) {
    throw new Error("Файл не похож на Excel (.xlsx)");
  }
  const sharedXml = (await read("xl/sharedStrings.xml")) ?? "";
  const sharedStrings = Array.from(sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)).map((m) =>
    joinText(m[1]),
  );
  const targets = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\s[^>]*>/g)) {
    const id = attr(` ${m[0]}`, "Id");
    const target = attr(` ${m[0]}`, "Target");
    if (id && target) {
      targets.set(id, target.startsWith("/") ? target.slice(1) : `xl/${target}`);
    }
  }

  const results: ExcelSheetResult[] = [];
  for (const m of workbook.matchAll(/<sheet\s[^>]*>/g)) {
    const tag = ` ${m[0]}`;
    const sheetName = decodeXml(attr(tag, "name") ?? "");
    const path = targets.get(attr(tag, "r:id") ?? "");
    const xml = path ? await read(path) : undefined;
    if (xml === undefined) continue;
    try {
      results.push({ sheetName, order: parseOrder(parseSheet(xml, sharedStrings), sheetName) });
    } catch (error) {
      results.push({ sheetName, error: (error as Error).message });
    }
  }
  return results;
};
