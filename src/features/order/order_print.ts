import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  LineRuleType,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { OrderMapper, OrderStore } from "./order_store";
import { clientFullName } from "../clients/client_picker";

// Выгрузка таблицы рецептов заказа в .docx.
// Таблица собирается из данных стора, а не копируется с экрана: на экране ячейки —
// поля ввода, они в Word не переносятся.

const r2 = (n: number) => (isFinite(n) ? n.shortToDecimalPlaces(2) : 0);

const sumBy = (m: OrderMapper, pick: "weight" | "weightCalcRecept") =>
  m.balance.reduce((acc, el) => acc + (el?.[pick] ?? 0), 0);

// «остаток» по компоненту — та же формула, что в колонке на экране
const remainderOf = (m: OrderMapper, i: number, store: OrderStore) => {
  const total = r2(sumBy(m, "weight"));
  if (total === 0) return 0;
  const paint = m.balance[i];
  return r2(
    ((paint?.weightCalcRecept ?? 0) / total) *
      (total - r2(m.getBalance(store))),
  );
};

const fromDrainOf = (m: OrderMapper) =>
  m.fromDrain !== undefined && m.fromDrain !== null ? m.fromDrain : undefined;

const isDrainApplied = (store: OrderStore, m: OrderMapper, index: number) =>
  m.drainAppliedTo !== undefined &&
  m.drainAppliedTo !== null &&
  store.componentsAddInRecept.at(m.drainAppliedTo)?.fromDrain === index;

// ---- описание ячейки и её отрисовка ----

interface Cell {
  text?: string | number;
  span?: number;
  bold?: boolean;
  fill?: string; // hex без #
  color?: string;
  small?: boolean;
  center?: boolean;
  empty?: boolean; // без рамки (пустое место / разделитель)
}

const BLACK = "000000";
const GREEN = "BBF7D0";
const HEADER = "F0F2F5";

// пустое место без рамки (например, под колонкой «добавка» в строках итогов)
const gap: Cell = { empty: true };
const blank = (span = 1): Cell => ({ empty: true, span });
const num = (text?: string | number): Cell => ({
  text,
  bold: true,
  fill: BLACK,
  color: "FFFFFF",
});

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: BLACK };

// ---- масштаб: всё в twips (1/1440 дюйма), шрифт — в полупунктах ----
// Word не умеет «вписать на страницу», поэтому считаем размеры таблицы сами
// и, если она не влезает в лист, пропорционально уменьшаем шрифт, ширину
// колонок, высоту строк и отступы.

const BASE_FONT = 16; // 8pt
const BASE_SMALL = 14; // 7pt
const BASE_COMP_W = 750; // колонки «компоненты»
const BASE_CELL_W = 1000; // ячейки рецептов
const BASE_PAD_V = 20;
const BASE_PAD_H = 40;
// высота строки текста ≈ 1.2 × кегль: pt·20·1.2 = полупункты·12
const lineTw = (font: number) => font * 12;
// ширина символа с запасом (≈0.6 em, жирный Arial): pt·20·0.6 = полупункты·6
const charTw = (font: number) => font * 6;

interface Layout {
  widths: number[];
  font: number;
  small: number;
  padV: number;
  padH: number;
}

const cellText = (c: Cell) =>
  c.text === undefined || c.text === null ? "" : String(c.text);
const spanWidth = (widths: number[], col: number, span: number) =>
  widths.slice(col, col + span).reduce((a, b) => a + b, 0);

// сколько строк займёт текст ячейки (с переносом)
const cellLines = (c: Cell, width: number, l: Layout) => {
  const text = cellText(c);
  if (text === "") return 1;
  const font = c.small ? l.small : l.font;
  const inner = Math.max(width - l.padH * 2, 1);
  return Math.max(1, Math.ceil((text.length * charTw(font)) / inner));
};

const rowLines = (cells: Cell[], l: Layout) => {
  let col = 0;
  let lines = 1;
  cells.forEach((c) => {
    const span = c.span ?? 1;
    lines = Math.max(lines, cellLines(c, spanWidth(l.widths, col, span), l));
    col += span;
  });
  return lines;
};

const rowHeight = (cells: Cell[], l: Layout) =>
  rowLines(cells, l) * lineTw(l.font) + l.padV * 2;

const scaledLayout = (steps: number, scale: number): Layout => ({
  widths: [
    BASE_COMP_W * scale,
    BASE_COMP_W * scale,
    ...Array.from({ length: steps }).flatMap(() => [
      BASE_CELL_W * scale,
      BASE_CELL_W * scale,
      BASE_CELL_W * scale,
    ]),
  ].map((w) => Math.floor(w)),
  // шрифт округляем вниз (Word принимает целые полупункты), минимум 1pt
  font: Math.max(2, Math.floor(BASE_FONT * scale)),
  small: Math.max(2, Math.floor(BASE_SMALL * scale)),
  padV: Math.floor(BASE_PAD_V * scale),
  padH: Math.floor(BASE_PAD_H * scale),
});

// масштаб ≤ 1, при котором таблица влезает в availW × availH
const fitScale = (
  grid: Cell[][],
  steps: number,
  availW: number,
  availH: number,
) => {
  const base = scaledLayout(steps, 1);
  const width = base.widths.reduce((a, b) => a + b, 0);
  // переносы от масштаба не зависят: ширины и шрифт меняются пропорционально
  const height = grid.reduce((acc, cells) => acc + rowHeight(cells, base), 0);
  return Math.min(1, availW / width, availH / height);
};

const renderCell = (c: Cell, l: Layout, col: number) => {
  const span = c.span ?? 1;
  const width = spanWidth(l.widths, col, span);
  const b = c.empty ? NO_BORDER : BORDER;
  const font = c.small ? l.small : l.font;
  return new TableCell({
    columnSpan: span > 1 ? span : undefined,
    width: { size: width, type: WidthType.DXA },
    borders: { top: b, bottom: b, left: b, right: b },
    shading: c.fill
      ? { type: ShadingType.CLEAR, color: "auto", fill: c.fill }
      : undefined,
    margins: { top: l.padV, bottom: l.padV, left: l.padH, right: l.padH },
    children: [
      new Paragraph({
        alignment: c.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          before: 0,
          after: 0,
          line: lineTw(l.font),
          lineRule: LineRuleType.EXACT,
        },
        children: [
          new TextRun({
            text: cellText(c),
            bold: c.bold,
            color: c.color,
            size: font,
            font: "Arial",
          }),
        ],
      }),
    ],
  });
};

// ---- сборка таблицы ----

const buildGrid = (store: OrderStore): Cell[][] => {
  const steps = store.componentsAddInRecept
    .map((m, index) => ({ m, index }))
    .filter((el) => el.index !== 0);
  const uniq = store.getComponentsReceptUniq();
  const rows = Math.max(uniq.length, ...steps.map((s) => s.m.balance.length));
  const grid: Cell[][] = [];

  // строка под каждый рецепт: 3 ячейки на рецепт, без разделителей
  const perStep = (render: (m: OrderMapper, index: number) => Cell[]) => [
    blank(2),
    ...steps.flatMap(({ m, index }) => render(m, index)),
  ];

  // номера рецептов
  grid.push(
    perStep((m, index) => {
      const from = fromDrainOf(m);
      return [
        {
          text: `Рецепт ${index}${from !== undefined ? ` (из ${from} слива)` : ""}`,
          span: 3,
          bold: true,
          center: true,
          fill: from !== undefined ? GREEN : HEADER,
        },
      ];
    }),
  );
  // шапка колонок
  grid.push([
    { text: "компоненты", span: 2, bold: true, center: true, fill: HEADER },
    ...steps.flatMap(({ m }) => {
      const fill = fromDrainOf(m) !== undefined ? GREEN : HEADER;
      return [
        { text: "вес комп.", bold: true, small: true, fill },
        { text: "остаток", bold: true, small: true, fill },
        { text: "добавка", bold: true, small: true, fill },
      ];
    }),
  ]);
  // компоненты
  for (let i = 0; i < rows; i++) {
    const c = uniq[i];
    grid.push([
      num(c?.privateNumber),
      { text: c ? r2(c.weightCalcRecept ?? 0) : "" },
      ...steps.flatMap(({ m }) => {
        const paint = m.balance[i];
        if (!paint) return [{}, {}, {}];
        const add = m.addingComponents[i]?.weight;
        return [
          { text: r2(paint.weightCalcRecept ?? 0) },
          { text: remainderOf(m, i, store) },
          { text: add !== undefined && add !== null ? add : "-" },
        ];
      }),
    ]);
  }
  // итоги, вес остатка, отпыл
  grid.push(
    perStep((m) => [
      { text: m.getCommonW(), bold: true, fill: BLACK, color: "FFFFFF" },
      { text: m.getCommonL(store), bold: true, fill: BLACK, color: "FFFFFF" },
      gap,
    ]),
  );
  grid.push(
    perStep((m) => [
      { text: "вес остатка", small: true },
      { text: m.dust !== undefined && m.dust !== "" ? m.dust : "..." },
      gap,
    ]),
  );
  grid.push(
    perStep((m) => [
      { text: "отпыл расх", small: true },
      { text: r2(m.getBalance(store)) },
      gap,
    ]),
  );
  // пустая строка перед сливами
  grid.push(perStep(() => [blank(), blank(), blank()]));
  // сливы
  grid.push(
    perStep((m, index) => {
      const applied = isDrainApplied(store, m, index);
      return [
        {
          text: `${index} слив${applied ? " ✓ в рецепте" : ""}`,
          span: 2,
          bold: true,
          center: true,
          fill: applied ? GREEN : HEADER,
        },
        gap,
      ];
    }),
  );
  grid.push(
    perStep((m) => [
      { text: "грамм по рецепту", small: true },
      { text: m.drainWeight ? r2(m.drainWeight) : "" },
      gap,
    ]),
  );
  for (let i = 0; i < rows; i++) {
    grid.push(
      perStep((m) => {
        const d = m.getDrain()[i];
        if (!d) return [blank(), blank(), blank()];
        return [
          num(d.privateNumber),
          { text: m.drainWeight ? r2(d.weight) : "" },
          gap,
        ];
      }),
    );
  }
  return grid;
};

// A4 альбом, поля 1.5 см
const PAGE_W = 16838;
const PAGE_H = 11906;
const MARGIN = 850;
// место под заголовок и строку с данными заказа (до 2 строк)
const HEADER_H = 1300;

export const buildOrderDocx = (store: OrderStore): Document => {
  const order = store.viewModel;
  const stepsCount = Math.max(store.componentsAddInRecept.length - 1, 0);
  const grid = buildGrid(store);

  const availW = PAGE_W - MARGIN * 2;
  // небольшой запас по высоте: Word может немного иначе мерить строки
  const availH = (PAGE_H - MARGIN * 2 - HEADER_H) * 0.97;
  const layout = scaledLayout(
    stepsCount,
    fitScale(grid, stepsCount, availW, availH),
  );

  const table = new Table({
    layout: TableLayoutType.FIXED,
    columnWidths: layout.widths,
    width: {
      size: layout.widths.reduce((a, b) => a + b, 0),
      type: WidthType.DXA,
    },
    rows: grid.map((cells) => {
      let col = 0;
      return new TableRow({
        cantSplit: true,
        height: { value: rowHeight(cells, layout), rule: HeightRule.EXACT },
        children: cells.map((c) => {
          const cell = renderCell(c, layout, col);
          col += c.span ?? 1;
          return cell;
        }),
      });
    }),
  });

  const client = store.client ? clientFullName(store.client) : "";
  const created = order.createdAt ?? order.orderCreate;
  const info: [string, string][] = (
    [
      ["Дата", created ? new Date(created).toLocaleDateString() : ""],
      ["Клиент", client],
      ["Авто", order.auto],
      ["Цвет", order.color],
      ["Код краски", order.codePaint],
      ["Тип краски", order.paintConsistency ?? undefined],
      ["Вес тары", `${r2(store.weightContainers)} г`],
    ] as [string, string | undefined][]
  ).filter((el): el is [string, string] => !!el[1] && el[1].trim() !== "");

  return new Document({
    creator: "Colorist App",
    title: `Заказ ${order.id ?? ""}`,
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: {
              top: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
              right: MARGIN,
            },
          },
        },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: `Рецепт заказа${order.id !== undefined ? ` №${order.id}` : ""}`,
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
          }),
          // данные заказа одной строкой, чтобы оставить место таблице
          new Paragraph({
            spacing: { before: 0, after: 120 },
            children: info.flatMap(([k, v], i) => [
              new TextRun({
                text: `${i === 0 ? "" : "   ·   "}${k}: `,
                bold: true,
                size: 18,
                font: "Arial",
              }),
              new TextRun({ text: v, size: 18, font: "Arial" }),
            ]),
          }),
          table,
        ],
      },
    ],
  });
};

export const downloadOrderDoc = async (store: OrderStore) => {
  const blob = await Packer.toBlob(buildOrderDocx(store));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `заказ-${store.viewModel.id ?? "новый"}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
