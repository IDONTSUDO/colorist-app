import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { Button } from "../../core/ui/button/Button";
import PhoneInput from "../../core/ui/input/phone_input";

import { CrudPage } from "../../core/ui/page/crud_page";
import { TextV2 } from "../../core/ui/text/text";
import { ClientsStore } from "./clients_store";
import { ClientViewModel } from "./clients_db_model";
import { InputV3 } from "../../core/ui/input/input_v3";
export const ClientsPath = "/clients";
export const Clients = observer(() => {
  const store = useStore(ClientsStore);
  return (
    <CrudPage
      feature={ClientsPath}
      isEditable={true}
      instanceModel={ClientViewModel}
      store={store}
      pageName="Клиенты"
      replacedColumns={[
        { name: "name", replace: "Имя" },
        { name: "family", replace: "Фамилия" },
        { name: "surName", replace: "Отчество" },
        { name: "numberPhone", replace: "Номер телефона" },
        { name: "createDate", replace: "Дата создания" },
      ]}
      mappedColumns={[
        {
          name: "createDate",
          mapper: (date) => new Date(date).formatDate(),
        },
      ]}
      missingKey={["id"]}
      editableComponent={
        <div>
          <InputV3
            label="Фамиля"
            value={store.viewModel.family}
            initialValue={store.viewModel.family}
            validation={Number().isValid}
            onChange={(text) => store.updateForm({ family: text })}
          />
          <div style={{ height: 10 }} />
          <InputV3
            label="Имя"
            value={store.viewModel.name}
            initialValue={store.viewModel.name}
            validation={Number().isValid}
            onChange={(text) => store.updateForm({ name: text })}
          />
          <div style={{ height: 10 }} />

          <InputV3
            label="Отчество"
            value={store.viewModel.surName}
            initialValue={store.viewModel.surName}
            validation={Number().isValid}
            onChange={(text) => store.updateForm({ surName: text })}
          />
          <div style={{ height: 10 }} />

          <TextV2 text={"Номер телефона"} />
          <PhoneInput
            initialValue={store.viewModel.numberPhone}
            onChange={(text) => store.updateForm({ numberPhone: text })}
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
