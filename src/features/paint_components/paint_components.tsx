import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { CrudPage } from "../../core/ui/page/crud_page";

import { PaintComponentStore } from "./paint_components_store";
import { Input } from "../../core/ui/input/input";
import { TextV2 } from "../../core/ui/text/text";
import { InputNumber } from "antd";
import { Button } from "../../core/ui/button/Button";
import { PaintComponentViewModel } from "./paint_components_db_model";

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
          <TextV2 text={"Вес в граммах"} />
          <InputNumber
            value={store.viewModel.weight}
            onChange={(text) =>
              store.updateForm({ weight: text === null ? undefined : text })
            }
          />
          <TextV2 text={"Цена"} />
          <InputNumber
            value={store.viewModel.costPrice}
            onChange={(text) =>
              store.updateForm({ costPrice: text === null ? undefined : text })
            }
          />
          {/* <TextV2 text={"Текущий остаток в граммах"} />
          <InputNumber
            value={store.viewModel.currentBalance}
            onChange={(text) =>
              store.updateForm({
                currentBalance: text === null ? undefined : text,
              })
            }
          /> */}
          <TextV2 text={"Приватный номер"} />
          <Input
            initialValue={store.viewModel.privateNumber}
            onChange={(text) =>
              store.updateForm({
                privateNumber: text,
              })
            }
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
