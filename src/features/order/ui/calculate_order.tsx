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
          children={<></>}
        />
        <ModalV2
          isOpen={store.reportConsumablesModalIsOpen}
          onClose={() => store.closeReportConsumablesModal()}
          children={<></>}
        />
        <div>
          <div style={{ height: 10 }} />

          <Button
            text={`себестоймость расходников: ${store.getCostConsumables()}`}
            style={{ width: 300 }}
            onClick={() => store.openReportConsumablesModal()}
          />
          <div style={{ height: 10 }} />
          <Button
            text={`себестоймость компонентов: ${store.getCostComponents()}`}
            style={{ width: 300 }}
            onClick={() => store.openReportComponentsModal()}
          />
        </div>
        <div>Итог себестоймости: {store.getOrderCost()}</div>
        <div style={{ width: 500 }}>
          <InputV3
            label={"Наценка"}
            validation={(e) => Number(e).isPositive()}
            error="только числа"
            value={store.viewModel.markup?.toString()}
            onChange={(text) => store.updateForm({ markup: Number(text) })}
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
