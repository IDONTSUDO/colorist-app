import { observer } from "mobx-react-lite";
import { useStore } from "../../core/helper/use_store";
import { CrudPage } from "../../core/ui/page/crud_page";
import { TextV2 } from "../../core/ui/text/text";
import { RecipesStore, RecipesViewModel } from "./recipes_store";
import { ModalV2 } from "../../core/ui/modal/modal";
import { InputV2 } from "../../core/ui/input/input_v2";
import { Button } from "../../core/ui/button/Button";
import { Icon, IconType } from "../../core/ui/icon/icon";
import { InputV3 } from "../../core/ui/input/input_v3";

export const RecipesPath = "/recipes";
export const Recipes = observer(() => {
  const store = useStore(RecipesStore);
  return (
    <>
      <CrudPage
        pageName="Рецепты"
        isEditable={true}
        instanceModel={RecipesViewModel}
        missingKey={[
          "componentsIds",
          "components",
          "id",
          "weightOfIngredientsAccordingToTheRecipe",
          "weightOfTheCan ",
          "actualWeightOfComponents",
          "weightOfTheCan",
          "comment",
        ]}
        store={store}
        replacedColumns={[
          { name: "auto", replace: "Авто" },
          { name: "cardIndexNumber", replace: "Номер в картотеке" },
          {
            name: "weightOfComponentsAfterDusting",
            replace: "Вес после отпыла",
          },
        ]}
        modalStyle={{ overflow: "auto", maxHeight: "100%" }}
        editableComponent={
          <div>
            <InputV3
              label="Вес банки"
              value={store.viewModel.weightOfTheCan?.toString()}
              onChange={(text) =>
                store.updateForm({
                  weightOfTheCan: Number(text),
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              label="Реальный вес компонентов"
              value={store.viewModel.actualWeightOfComponents?.toString()}
              onChange={(text) =>
                store.updateForm({
                  actualWeightOfComponents: Number(text),
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              label="Вес компонентов после отпыла"
              value={store.viewModel.weightOfComponentsAfterDusting?.toString()}
              onChange={(text) =>
                store.updateForm({
                  weightOfComponentsAfterDusting: Number(text),
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              label="Номер в картотеке"
              value={store.viewModel.cardIndexNumber}
              onChange={(text) =>
                store.updateForm({
                  cardIndexNumber: text,
                })
              }
            />
            <div style={{ height: 5 }} />
            <InputV3
              label="авто"
              value={store.viewModel.auto}
              onChange={(text) =>
                store.updateForm({
                  auto: text,
                })
              }
            />
            <div style={{ height: 5 }} />

            <div style={{ display: "flex" }}>
              <TextV2 text={"Компоненты рецепта"} />
              <div style={{ width: 50 }} />
              <TextV2
                text={"Добавить новый компонент"}
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => store.modalAddComponentsShow()}
              />
            </div>
            <div>
              {store.viewModel.componentsArray?.map((el, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: 5,
                      padding: 5,
                      backgroundColor: "#dedede",
                    }}
                  >
                    <div>{el.privateNumber}</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div>{el.weight} гр</div>
                      <div onClick={() => store.removeComponent(index)}>
                        <Icon type={IconType.delete} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 5 }}></div>

            <InputV3
              label="Коментарий"
              value={store.viewModel.comment?.toString()}
              onChange={(text) =>
                store.updateForm({
                  comment: text,
                })
              }
            />
            <div style={{ height: 20 }}></div>
            <Button
              text="Сохранить"
              width={100}
              onClick={() => {
                store.viewModel.toServerModel();
                store.createOrUpdate();
              }}
            />
          </div>
        }
      />
      <ModalV2
        isOpen={store.isModalAddComponentsOpen}
        onClose={() => store.modalAddComponentsCancel()}
        style={{ overflow: "auto", maxHeight: "100%" }}
        children={
          <>
            <div style={{ display: "flex" }}>
              <InputV2
                style={{ width: 400 }}
                label="поиск по приватному номеру"
                onChange={(text) => {
                  store.searchInput = text;
                }}
              />
              <Button
                style={{ width: 150 }}
                text="Поиск"
                color="cornflowerblue"
                onClick={() => store.onClickButtonFindInPrivateNumber()}
              />
            </div>
            <div>
              {store.paintComponents.map((el, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#8db6ff",
                    margin: 5,
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    justifyItems: "center",
                    alignItems: "center",
                  }}
                >
                  <div>{el.privateNumber}</div>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 150 }}>
                      {/*TODO ONLY NUMBER  */}
                      <InputV2
                        label="вес в рецепте"
                        onChange={(text) => store.updateWeights(text)}
                      />
                    </div>
                    <Button
                      text="Добавить"
                      style={{ width: 100 }}
                      onClick={() => store.addNewComponentsToRecept(index)}
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
