import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { CarsStore } from "./cars_store";
import { CarsViewModel } from "./cars_model";
import { CrudPage } from "../../core/ui/page/crud_page";
import { InputV3 } from "../../core/ui/input/input_v3";
import { Button } from "../../core/ui/button/Button";

export const CarsScreenPath = "/cars";

export const CarsScreen = observer(() => {
  const store = useStore(CarsStore);
  return (
    <>
      <CrudPage
        feature={CarsScreenPath}
        isEditable={true}
        instanceModel={CarsViewModel}
        store={store}
        pageName="Авто"
        replacedColumns={[{ name: "name", replace: "Имя" }]}
        mappedColumns={[]}
        missingKey={["id"]}
        editableComponent={
          <div>
            <InputV3
              placeholder="название "
              onChange={(text) => store.updateForm({ name: text })}
              value={store.viewModel.name}
            />
            <div style={{ height: 10 }}></div>
            <Button
              text="Сохранить"
              width={100}
              onClick={() => store.createOrUpdate()}
            />
          </div>
        }
      />
    </>
  );
});
