import { useStore } from "../../core/helper/use_store";
import { Icon, IconType } from "../../core/ui/icon/icon";
import { SettingsStore } from "./settings_store";

export const SettingsPath = "/settings";
export const Settings: React.FC<{}> = () => {
  const store = useStore(SettingsStore);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Icon type={IconType.leftArrow} size={30} />
        <div style={{ fontSize: 40, fontWeight: 100 }}>Настройки</div>
      </div>
      <div>импорт базы данных</div>

      <div>экспорт базы данных</div>
    </>
  );
};
