import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { ReportsStore } from "./reports_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Calendar } from "antd";

export const ReportsPath = "/reports";

export const Reports = observer(() => {
  const store = useStore(ReportsStore);
  return (
    <CrudPage
      pageName="Отчеты"
      store={store}
      editableComponent={
        <>
          <div style={{width:400,height:400}}>
            <Calendar />
          </div>
        </>
      }
    />
  );
});
