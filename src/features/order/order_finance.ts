import type { OrderViewModel } from "../orders/orders_db_model";

// Расчет стоимости заказа по сохраненным в нем JSON-полям.
// OrderStore использует эти же функции, так что расчет в форме заказа
// и в отчетах всегда совпадает.

export interface OrderFinance {
  componentsCost: number; // себестоимость слива компонентов
  manufactureCost: number; // себестоимость производства
  markup: number; // стоймость работ
  total: number; // итоговая стоимость для клиента
}

interface CostItem {
  privateNumber?: string;
  weight?: number | null;
  weightCalcRecept?: number | null;
  costPrice?: number | null;
}

export interface ReceptStep {
  add?: CostItem | null;
  isAdding?: boolean;
  balance?: (CostItem | null | undefined)[];
  addingComponents?: (CostItem | null | undefined)[];
}

const round2 = (n: number) => (Number.isInteger(n) ? n : Number(n.toFixed(2)));

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const itemCost = (weight: unknown, el?: CostItem | null) =>
  num(weight) * num(el?.costPrice);

// Шаг добавлен через «добавить компонент» (модалка): добавленная краска
// лежит в step.add. У старых заказов флага isAdding нет — определяем по
// данным: компонент новый (баланс вырос) или его вес в балансе больше
// добавленного веса (добавили к уже имеющемуся).
const isAddingStep = (step: ReceptStep, prev?: ReceptStep) => {
  if (step.isAdding !== undefined) return step.isAdding;
  const add = step.add;
  if (!add || !prev) return false;
  const balance = step.balance ?? [];
  if (balance.length > (prev.balance ?? []).length) return true;
  const inBalance = balance.find(
    (el) => el?.privateNumber === add.privateNumber,
  );
  return (
    inBalance !== undefined &&
    inBalance !== null &&
    num(inBalance.weightCalcRecept) - num(add.weight) > 0.0001
  );
};

// Себестоимость производства по рецептам (шагам).
// Рецепт 1 — исходный рецепт + его добавки; рецепт N (N ≥ 2) — компонент,
// добавленный через «добавить компонент» (создал этот шаг), + добавки из
// колонки «добавка» этого рецепта. Добавки последнего шага еще не применены
// (применяются по Enter/«сохранить» и создают новый шаг) — их не считаем.
export const calculateManufactureCostBySteps = (
  steps: ReceptStep[],
): { step: number; cost: number }[] => {
  if (steps.length === 0) return [];
  const result: { step: number; cost: number }[] = [];
  const last = steps.length - 1;
  for (let i = 1; i < Math.max(steps.length, 2); i++) {
    const step = steps[i] ?? steps[0];
    let cost = 0;
    if (i === 1) {
      // шаги 0 и 1 — исходный рецепт; вес правится в шаге 1
      cost += (step?.balance ?? []).reduce(
        (acc, el) => acc + itemCost(el?.weightCalcRecept, el),
        0,
      );
    } else if (isAddingStep(step, steps[i - 1])) {
      cost += itemCost(step.add?.weight, step.add);
    }
    if (i !== last && steps[i] !== undefined) {
      (step?.addingComponents ?? []).forEach((el) => {
        cost += itemCost(el?.weight, el);
      });
    }
    result.push({ step: i, cost: round2(cost) });
  }
  return result;
};

// рецепт исключен из себестоимости производства (галочки в «Финансовом учете»).
// Старый флаг ignoreManufactureCost = исключены все рецепты.
export const isManufactureStepExcluded = (
  order: Pick<
    OrderViewModel,
    "ignoreManufactureCost" | "manufactureExcludedSteps"
  >,
  step: number,
) =>
  !!order.ignoreManufactureCost ||
  (order.manufactureExcludedSteps ?? []).includes(step);

// Себестоимость производства: стоимость всей краски, которая ушла в работу —
// исходный рецепт + все последующие добавки, кроме исключенных рецептов.
export const calculateManufactureCost = (
  steps: ReceptStep[],
  isExcluded: (step: number) => boolean = () => false,
): number =>
  round2(
    calculateManufactureCostBySteps(steps)
      .filter((el) => !isExcluded(el.step))
      .reduce((acc, el) => acc + el.cost, 0),
  );

const parseArray = <T>(json?: string | null): T[] => {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const calculateOrderFinance = (order: OrderViewModel): OrderFinance => {
  const finalRecept = parseArray<CostItem>(order.selectReceptPaintFinal);
  const componentsCost = finalRecept.reduce(
    (acc, el) => acc + (el?.weightCalcRecept ?? 0) * (el?.costPrice ?? 0),
    0,
  );

  // рецепты, отмеченные «не учитывать», в себестоимость производства не идут
  const manufactureCost = calculateManufactureCost(
    parseArray<ReceptStep>(order.componentsAddInReceptJson),
    (step) => isManufactureStepExcluded(order, step),
  );

  const markup = Number(order.markup) || 0;
  const total = round2(
    round2(componentsCost) + round2(manufactureCost) + markup,
  );

  return {
    componentsCost: round2(componentsCost),
    manufactureCost: round2(manufactureCost),
    markup,
    total,
  };
};
