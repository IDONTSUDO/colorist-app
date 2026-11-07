import type { OrderViewModel } from "../orders/orders_db_model";

// Расчет стоимости заказа по сохраненным в нем JSON-полям.
// Формулы повторяют OrderStore (getCostComponents,
// getCostComponentsManufacturePrice) и итог из FinancialAccountingForm —
// при изменении расчета там нужно поменять и здесь.

export interface OrderFinance {
  componentsCost: number; // себестоимость слива компонентов
  manufactureCost: number; // себестоимость производства
  markup: number; // наценка
  total: number; // итоговая стоимость для клиента
}

interface CostItem {
  weight?: number | null;
  weightCalcRecept?: number | null;
  costPrice?: number | null;
}

interface ReceptStep {
  balance?: CostItem[];
  addingComponents?: (CostItem | null | undefined)[];
}

const round2 = (n: number) => (Number.isInteger(n) ? n : Number(n.toFixed(2)));

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

  const steps = parseArray<ReceptStep>(order.componentsAddInReceptJson);
  const initial = (steps[0]?.balance ?? []).reduce(
    (acc, el) => acc + (el.weightCalcRecept ?? 1) * (el.costPrice ?? 1),
    0,
  );
  const adding = steps.reduce(
    (acc, step) =>
      acc +
      (step?.addingComponents ?? []).reduce(
        (sub, el) =>
          el === undefined || el === null
            ? sub
            : sub + (el.weight ?? 1) * (el.costPrice ?? 1),
        0,
      ),
    0,
  );
  const manufactureCost = initial + round2(adding);

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
