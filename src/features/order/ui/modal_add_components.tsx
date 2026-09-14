import { observer } from "mobx-react-lite";
import { Button } from "../../../core/ui/button/Button";
import { InputV3 } from "../../../core/ui/input/input_v3";
import { ModalV2 } from "../../../core/ui/modal/modal";
import { TextV2 } from "../../../core/ui/text/text";
import type { OrderStore } from "../order_store";

export const M: React.FC<{ store: OrderStore }> = observer(({ store }) => {
  return (
    <>
      <ModalV2
        isOpen={store.isOpenComponentsModal}
        onClose={() => store.closeComponentsModal()}
        children={
          <>
            <div
              style={{ display: "flex", width: "75vw", alignItems: "flex-end" }}
            >
              <InputV3
                style={{ width: "100%" }}
                label="Поиск компонента по номеру в картотеке"
                onChange={(text) => store.updateComponentsField(text)}
              />

              <Button
                text="поиск"
                textStyle={{ position: "relative", top: -3 }}
                style={{ width: 100, height: 40 }}
                onClick={() => store.findComponents()}
              />
            </div>
            <div style={{ height: 10 }}></div>
            <div>
              {store.components.map((el, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    height: 80,
                    alignItems: "center",
                    background: "rgb(250, 250, 250)",
                    border: "1px solid rgb(226, 232, 240)",
                    borderRadius: 8,
                    width: "100%",
                    padding: 12,
                    marginTop: 3,
                    marginBottom: 3,
                  }}
                >
                  <TextV2
                    text={`номер: ${el.privateNumber}`}
                    style={{ alignContent: "center", width: "100%" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyItems: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <InputV3
                      label="Вес в рецепте"
                      style={{ width: "max-content" }}
                      //   initialValue={el.id?.toString()}
                      validation={Number().isValid}
                      onChange={(val) => {
                        store.updateWeights(Number(val), i);
                      }}
                    />
                    <Button
                      textStyle={{ position: "relative", top: -3 }}
                      style={{ width: 100, height: 40 }}
                      onClick={() => store.addComponents(i)}
                      text="добавить"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        }
      />
    </>
  );
});
