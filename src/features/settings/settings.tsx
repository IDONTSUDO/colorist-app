import { observer } from "mobx-react-lite";
import { Checkbox, Radio } from "antd";
import { useRef } from "react";
import { useStore } from "../../core/helper/use_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { Button, ButtonType } from "../../core/ui/button/Button";
import { TextV2 } from "../../core/ui/text/text";
import { Loader } from "../../core/ui/loader/loader";
import { SettingsStore } from "./settings_store";

export const SettingsPath = "/settings";

export const Settings = observer(() => {
  const store = useStore(SettingsStore);
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <CrudPage
      feature={SettingsPath}
      pageName="Настройки"
      // CrudPage only touches modal/loading fields when isNeedTable=false
      store={store as any}
      isNeedTable={false}
      body={
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={cardStyle}>
            <TextV2 style={{ fontSize: 18 }} text="Выгрузка базы данных" />
            <div style={{ height: 6 }} />
            <TextV2
              color="#8fa1b9"
              text="Выберите таблицы, которые нужно выгрузить в JSON"
            />
            <div style={{ height: 16 }} />
            {store.isLoading ? (
              <Loader />
            ) : (
              <>
                <Checkbox
                  checked={store.isAllSelected}
                  indeterminate={
                    store.selected.length > 0 && !store.isAllSelected
                  }
                  onChange={() => store.toggleAll()}
                >
                  Выбрать все
                </Checkbox>
                <div
                  style={{
                    borderBottom: "1px solid oklch(92.9% 0.013 255.508)",
                    margin: "10px 0",
                  }}
                />
                {store.tables.map((table) => (
                  <div
                    key={table.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                    }}
                  >
                    <Checkbox
                      checked={store.isSelected(table.name)}
                      onChange={() => store.toggle(table.name)}
                    >
                      {table.label}
                    </Checkbox>
                    <span style={{ color: "#8fa1b9" }}>
                      {table.count} записей
                    </span>
                  </div>
                ))}
                <div style={{ height: 16 }} />
                <Button
                  text={store.isExporting ? "Выгрузка..." : "Выгрузить JSON"}
                  type={
                    store.selected.length === 0
                      ? ButtonType.default
                      : ButtonType.gray
                  }
                  style={{ width: "max-content" }}
                  onClick={() => {
                    if (!store.isExporting) store.exportSelected();
                  }}
                />
              </>
            )}
          </div>

          <div style={cardStyle}>
            <TextV2 style={{ fontSize: 18 }} text="Импорт базы данных" />
            <div style={{ height: 6 }} />
            <TextV2
              color="#8fa1b9"
              text="Загрузите JSON-файл, ранее выгруженный из приложения"
            />
            <div style={{ height: 16 }} />
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) store.loadImportFile(file);
                e.target.value = "";
              }}
            />
            <Button
              text={
                store.importFileName
                  ? "Выбрать другой файл"
                  : "Выбрать JSON-файл"
              }
              style={{ width: "max-content" }}
              onClick={() => fileInput.current?.click()}
            />
            {store.importFileName !== undefined && (
              <>
                <div style={{ height: 16 }} />
                <TextV2 text={`Файл: ${store.importFileName}`} />
                <div
                  style={{
                    borderBottom: "1px solid oklch(92.9% 0.013 255.508)",
                    margin: "10px 0",
                  }}
                />
                {store.importTables.map((table) => (
                  <div
                    key={table.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                    }}
                  >
                    <Checkbox
                      checked={store.isImportSelected(table.name)}
                      onChange={() => store.toggleImport(table.name)}
                    >
                      {table.label}
                    </Checkbox>
                    <span style={{ color: "#8fa1b9" }}>
                      {table.count} записей
                    </span>
                  </div>
                ))}
                <div style={{ height: 12 }} />
                <Radio.Group
                  value={store.importMode}
                  onChange={(e) => store.setImportMode(e.target.value)}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <Radio value="replace">
                      Заменить — удалить текущие записи выбранных таблиц
                    </Radio>
                    <Radio value="merge">
                      Объединить — добавить, записи с тем же id перезаписать
                    </Radio>
                  </div>
                </Radio.Group>
                <div style={{ height: 16 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    text={store.isImporting ? "Импорт..." : "Импортировать"}
                    type={
                      store.importSelected.length === 0
                        ? ButtonType.default
                        : ButtonType.gray
                    }
                    style={{ width: "max-content" }}
                    onClick={() => {
                      if (store.isImporting) return;
                      if (
                        store.importMode === "replace" &&
                        !window.confirm(
                          "Текущие данные выбранных таблиц будут удалены. Продолжить?",
                        )
                      )
                        return;
                      store.importSelectedTables();
                    }}
                  />
                  <Button
                    text="Отмена"
                    style={{ width: "max-content" }}
                    onClick={() => store.resetImport()}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      }
    />
  );
});

const cardStyle: React.CSSProperties = {
  maxWidth: 520,
  border: "1px solid oklch(92.9% 0.013 255.508)",
  borderRadius: 8,
  padding: 20,
};
