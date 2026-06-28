import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { ReportsStore } from "./reports_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Calendar } from "../../core/ui/callendar/callendar";
import PhoneInput from "../../core/ui/input/phone_input";
import { InputV3 } from "../../core/ui/input/input_v3";
import { Button } from "../../core/ui/button/Button";

export const ReportsPath = "/reports";

export const Reports = observer(() => {
  const store = useStore(ReportsStore);
  return (
    <CrudPage
      feature={ReportsPath}
      pageName="Отчеты"
      store={store}
      editableComponent={
        <>
          <div>
            <div style={{ fontSize: 20 }}>Период</div>
            <Calendar
            // onChange={(range) =>
            //   store.update({
            //     startDate: range.startDate,
            //     endDate: range.endDate,
            //   })
            // }
            />

            <div style={{ height: 10 }}> </div>
            <InputV3 label="Машина" />
            <div style={{ fontSize: 10 }}>Клиент</div>

            <div style={{ display: "flex" }}>
              <PhoneInput
                initialValue={store.numberPhone}
                onChange={(text) => store.updateNumber(text)}
              />
              <Button
                text="поиск"
                style={{ width: 100 }}
                onClick={() => store.findClients()}
              />
            </div>
            <div>
              {store.clients.map((el) => {
                return (
                  <div
                    style={{
                      margin: 20,
                      border: `1px solid ${el.id === store.viewModel.clientId ? "red" : "black"}`,
                      padding: 20,
                    }}
                    onClick={() => store.selectClient(el.id)}
                  >
                    <div>имя - {el.name}</div>
                    <div>фамилия - {el.family}</div>
                    <div>отчество - {el.surName}</div>
                    <div>номер телефона - {el.numberPhone}</div>
                  </div>
                );
              })}
            </div>
            <Button text="создать отчет" onClick={() => store.createReport()} />
          </div>
        </>
      }
    />
  );
});
