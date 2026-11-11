import type { PaintComponentViewModel } from "../../paint_components/paint_components_db_model";
import type { OrderViewModel } from "../orders_db_model";
import type { ExcelOrder } from "./excel_order_parser";

// Перевод листа Excel в рецепт заказа (OrderMapper[] в componentsAddInReceptJson):
// шаг 0 — СТАНДАРТ, шаги 1..N — подборы Excel. У каждого подбора:
//   balance          — «ВЕС КОМП.»
//   addingComponents — «ДОБАВКА» после этого подбора
//   dust             — «Вес остатка» без тары (в приложении тара отдельно)
//   drainWeight      — слив («гр.» под таблицей пигментов)

export const componentKey = (privateNumber: string) =>
  String(privateNumber ?? "").trim().toLowerCase();

const round2 = (n: number) => Math.round(n * 100) / 100;

type Plain = Record<string, unknown>;

const copyWith = (component: PaintComponentViewModel, weight: number | undefined): Plain => {
  const c = JSON.parse(JSON.stringify(component)) as Plain;
  c.weight = weight;
  c.weightCalcRecept = weight;
  return c;
};

// компоненты листа в том же порядке, взятые из картотеки
const resolveComponents = (
  order: ExcelOrder,
  catalog: Map<string, PaintComponentViewModel>,
) =>
  order.components.map((el) => {
    const found = catalog.get(componentKey(el.privateNumber));
    if (found === undefined) {
      throw new Error(`Компонент ${el.privateNumber} не найден в картотеке`);
    }
    return found;
  });

export const buildOrderRecept = (
  order: ExcelOrder,
  catalog: Map<string, PaintComponentViewModel>,
): Pick<
  OrderViewModel,
  | "componentsAddInReceptJson"
  | "addingComponentsTableJson"
  | "selectReceptPaintFinal"
  | "selectReceptWeight"
  | "weightContainers"
> => {
  const components = resolveComponents(order, catalog);

  const standard = components.map((c, i) => copyWith(c, order.components[i].standard));
  const steps: Plain[] = [{ add: standard[0], balance: standard, addingComponents: [] }];

  const drained: Plain[] = components.map((c) => copyWith(c, 0));
  let drainTotal = 0;

  order.steps.forEach((step) => {
    const balance = components.map((c, i) => copyWith(c, step.weights[i]));
    const hasAdding = step.additions.some((a) => a !== undefined);
    const mapper: Plain = {
      add: balance[0],
      balance,
      addingComponents: hasAdding
        ? components.map((c, i) => copyWith(c, step.additions[i]))
        : [],
      isAdding: false,
    };
    if (step.remainderGross !== undefined) {
      mapper.dust = String(round2(Math.max(step.remainderGross - order.tare, 0)));
    }
    if (step.drain !== undefined) {
      mapper.drainWeight = step.drain;
      mapper.showDrain = true;
      // слив раскладывается по компонентам пропорционально рецепту
      const total = step.weights.reduce((acc, w) => acc + w, 0);
      drainTotal += step.drain;
      step.weights.forEach((w, i) => {
        const part = total === 0 ? 0 : (w / total) * step.drain!;
        drained[i].weightCalcRecept = Number(drained[i].weightCalcRecept) + part;
      });
    }
    steps.push(mapper);
  });

  return {
    componentsAddInReceptJson: JSON.stringify(steps),
    addingComponentsTableJson: JSON.stringify(standard),
    selectReceptPaintFinal: JSON.stringify(drainTotal > 0 ? drained : []),
    selectReceptWeight: drainTotal > 0 ? round2(drainTotal) : null,
    weightContainers: order.tare,
  };
};

// общий вес сливов — подсказка для «объёма краски, который хочет клиент»
export const excelDrainTotal = (order: ExcelOrder) =>
  round2(order.steps.reduce((acc, s) => acc + (s.drain ?? 0), 0));
