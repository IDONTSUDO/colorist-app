import type { OrderViewModel } from "../orders/orders_db_model";

// Расчет стоимости заказа по сохраненным в нем JSON-полям.
// OrderStore использует эти же функции, так что расчет в форме заказа
// и в отчетах всегда совпадает.

export interface OrderFinance {
  componentsCost: number; // себестоимость слива компонентов
  manufactureCost: number; // себестоимость производства
  markup: number; // наценка
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
  const inBalance = balance.find((el) => el?.privateNumber === add.privateNumber);
  return (
    inBalance !== undefined &&
    inBalance !== null &&
    num(inBalance.weightCalcRecept) - num(add.weight) > 0.0001
  );
};

// Себестоимость производства: стоимость всей краски, которая ушла в работу —
// исходный рецепт + все последующие добавки (через таблицу добавок
// и через «добавить компонент»).
export const calculateManufactureCost = (steps: ReceptStep[]): number => {
  if (steps.length === 0) return 0;

  // Шаги 0 и 1 — исходный рецепт; вес правится в шаге 1.
  const base = steps[1] ?? steps[0];
  const initial = (base?.balance ?? []).reduce(
    (acc, el) => acc + itemCost(el?.weightCalcRecept, el),
    0,
  );

  let adding = 0;
  steps.forEach((step, i) => {
    if (i < 2) return;
    if (isAddingStep(step, steps[i - 1])) {
      adding += itemCost(step.add?.weight, step.add);
    }
  });
  // Добавки из таблицы применяются по Enter (recalculate), после чего
  // появляется новый шаг. У последнего шага они еще не применены.
  steps.forEach((step, i) => {
    if (i === 0 || i === steps.length - 1) return;
    (step.addingComponents ?? []).forEach((el) => {
      adding += itemCost(el?.weight, el);
    });
  });

  return round2(initial + adding);
};

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

  // галочка «не учитывать себестоимость производства» — итог только по сливам
  const manufactureCost = order.ignoreManufactureCost
    ? 0
    : calculateManufactureCost(
        parseArray<ReceptStep>(order.componentsAddInReceptJson),
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
