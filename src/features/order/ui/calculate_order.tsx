import { observer } from "mobx-react-lite";
import { OrderStore } from "../order_store";
import { InputV3 } from "../../../core/ui/input/input_v3";
import { Button } from "../../../core/ui/button/Button";
import { ModalV2 } from "../../../core/ui/modal/modal";

export const CalculateOrder: React.FC<{ store: OrderStore }> = observer(
  ({ store }) => {
    return (
      <div>
        <ModalV2
          isOpen={store.reportComponentsModalIsOpen}
          onClose={() => store.closeReportComponentsModal()}
          children={
            <>
              {store.getOrderStatisticComponents().map((el, i) => {
                return (
                  <div
                    key={i}
                    style={{ border: "1px solid", padding: 10, margin: 10 }}
                  >
                    {/* <div>{el.privateNumber}</div> */}
                    <TextBar
                      left={el.privateNumber}
                      right="приватный компонент"
                    />
                    <TextBar
                      left={el.costPrice.shortToDecimalPlaces(2)}
                      right="цена за грамм компонента"
                    />
                    <TextBar
                      left={el.weightInTheRecipe.shortToDecimalPlaces(2)}
                      right="вес в рецепте"
                    />
                    <TextBar
                      left={el.finalCostOfTheComponent.shortToDecimalPlaces(2)}
                      right="финальная себе стоймость компонента"
                    />
                  </div>
                );
              })}
            </>
          }
        />

        <div>
          <div style={{ height: 10 }} />
          <Button
            text={`себестоймость компонентов: ${store.getCostComponents()}`}
            style={{ width: 300 }}
            onClick={() => store.openReportComponentsModal()}
          />
        </div>
        <div style={{ height: 10 }}></div>
        <div style={{ width: 500 }}>
          <InputV3
            label={"Наценка"}
            validation={(e) => Number(e).isPositive()}
            error="только числа"
            value={store.viewModel.markup?.toString()}
            onChange={(text) => {
              store.updateForm({ markup: Number(text) });
              store.updateOrder();
            }}
          />
        </div>
        <div style={{ height: 10 }} />
        <Button
          style={{ width: 100 }}
          text="Сохранить"
          onClick={() => store.updateOrder()}
        />
        <div style={{ fontSize: 30, fontWeight: 600 }}>
          Итоговая стоймость для клиента:
          {store.getOrderCost() + (store.viewModel.markup ?? 0)}
        </div>
      </div>
    );
  },
);

const TextBar: React.FC<{ left: string | number; right: string | number }> = ({
  left,
  right,
}) => {
  return (
    <div style={{ display: "flex" }}>
      <div>{right} :</div>
      <div>{left}</div>
    </div>
  );
};
