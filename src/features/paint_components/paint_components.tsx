import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { PaintComponentStore } from "./paint_components_store";
import { Button } from "../../core/ui/button/Button";
import { PaintComponentViewModel } from "./paint_components_db_model";
import { InputV3 } from "../../core/ui/input/input_v3";

export const PaintsComponentPath = "/components";
export const PaintsComponent = observer(() => {
  const store = useStore(PaintComponentStore);
  return (
    <CrudPage
      isEditable={true}
      instanceModel={PaintComponentViewModel}
      store={store}
      pageName="Компоненты"
      replacedColumns={[
        { name: "weight", replace: "Вес" },
        { name: "costPrice", replace: "Цена" },
        { name: "privateNumber", replace: "Приватный номер" },
        { name: "currentBalance", replace: "Текущий баланс" },
      ]}
      missingKey={["id"]}
      editableComponent={
        <div>
          <InputV3
            label="Цена за грамм"
            value={store.viewModel.costPrice?.toString()}
            initialValue={store.viewModel.costPrice?.toString()}
            validation={Number().isValid}
            onChange={(text) =>
              store.updateForm({
                costPrice: text === "" ? undefined : Number(text),
              })
            }
          />
          <div style={{ height: 10 }} />
          <InputV3
            value={store.viewModel.privateNumber}
            onChange={(text) =>
              store.updateForm({
                privateNumber: text,
              })
            }
            label={"Приватный номер"}
          />
          <div style={{ height: 20 }}></div>
          <Button
            text="Сохранить"
            width={100}
            onClick={() => store.createOrUpdate()}
          />
        </div>
      }
    />
  );
});
