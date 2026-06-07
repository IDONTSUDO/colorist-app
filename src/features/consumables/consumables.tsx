import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { Button } from "../../core/ui/button/Button";
import { InputV3 } from "../../core/ui/input/input_v3";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Select } from "../../core/ui/select/select";
import { ConsumablesStore } from "./consumables_store";
import { ConsumablesViewModel } from "./consumables_db_model";

export const ConsumablesPath = "/consumables";
export const Consumables = observer(() => {
  const store = useStore(ConsumablesStore);
  return (
    <CrudPage
      isEditable={true}
      store={store}
      missingKey={["id"]}
      pageName="Расходники"
      instanceModel={ConsumablesViewModel}
      createButton={true}
      replacedColumns={[
        { name: "costPrice", replace: "себестоймость за еденицу измрения" },
        { name: "description", replace: "название" },
        { name: "currentBalance", replace: "текущий баланс" },
        { name: "unitOfMeasurement", replace: "единица измерения" },
      ]}
      editableComponent={
        <>
          <InputV3
            validation={(e) => Number(e).isPositive()}
            error="только числа"
            label="цена за единицу измеренеия"
            value={store.viewModel.costPrice?.toString()}
            onChange={(text) =>
              store.updateForm({
                costPrice: Number(text),
              })
            }
          />
          <div style={{ height: 10 }} />
          <InputV3
            validation={(e) => Number(e).isPositive()}
            label="описание"
            value={store.viewModel.description?.toString()}
            onChange={(text) =>
              store.updateForm({
                description: text,
              })
            }
          />
          <div style={{ height: 10 }} />
          {/* <InputV3
            validation={(e) => Number(e).isPositive()}
            error="только числа"
            label="текущий остаток"
            value={store.viewModel.currentBalance?.toString()}
            onChange={(text) =>
              store.updateForm({
                currentBalance: Number(text),
              })
            }
          /> */}
          <div style={{ height: 10 }} />
          {/* <InputV3
            validation={(e) => Number(e).isPositive()}
            label="еденица измерения"
            value={store.viewModel.unitOfMeasurement?.toString()}
            onChange={(text) =>
              store.updateForm({
                unitOfMeasurement: text,
              })
            }
          /> */}
          <Select
            options={["Граммы", "Милилитры", "Штуки"].map((el) => {
              return {
                value: el,
                label: el,
              };
            })}
            value={store.viewModel.unitOfMeasurement}
            onChange={(text) => store.updateForm({ unitOfMeasurement: text })}
          />
          <div style={{ height: 10 }} />
          <Button
            text="Сохранить"
            width={100}
            onClick={() => {
              store.createOrUpdate();
            }}
          />
        </>
      }
    />
  );
});
