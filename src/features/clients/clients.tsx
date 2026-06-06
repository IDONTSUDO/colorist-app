import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { Button } from "../../core/ui/button/Button";
import { Input } from "../../core/ui/input/input";
import PhoneInput from "../../core/ui/input/phone_input";

import { CrudPage } from "../../core/ui/page/crud_page";
import { TextV2 } from "../../core/ui/text/text";
import { ClientsStore } from "./clients_store";
import { ClientViewModel } from "./clients_db_model";
export const ClientsPath = "/clients";
export const Clients = observer(() => {
  const store = useStore(ClientsStore);
  return (
    <CrudPage
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
          <TextV2 text={"Фамиля"} />
          <Input
            initialValue={store.viewModel.family}
            onChange={(text) => store.updateForm({ family: text })}
          />
          <TextV2 text={"Имя"} />
          <Input
            initialValue={store.viewModel.name}
            onChange={(text) => store.updateForm({ name: text })}
          />
          <TextV2 text={"Отчество"} />
          <Input
            initialValue={store.viewModel.surName}
            onChange={(text) => store.updateForm({ surName: text })}
          />
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
