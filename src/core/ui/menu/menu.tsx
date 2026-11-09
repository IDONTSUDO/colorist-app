import { useNavigate } from "react-router-dom";
import { OrdersPath } from "../../../features/orders/orders";
import { TextV2 } from "../text/text";

export const Menu: React.FC<{
  child: React.ReactNode;
  right: React.ReactNode;
  // содержимое полосы над карточкой (например, вкладки заказов)
  top?: React.ReactNode;
}> = ({ child, right, top }) => {
  const n = useNavigate();
  return (
    // экран ровно в высоту окна: прокручивается только область с содержимым,
    // поэтому её полосы прокрутки (и нижняя) всегда видны у края экрана
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        {top ?? <div style={{ height: 48 }}></div>}
      </div>
      <div
        className="app"
        style={{
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 12,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          // minHeight: "",
          // height: 10,
        }}
      >
        <div
          className="topbar"
          style={{
            // backgroundColor: "#000000",
            height: 50,
            flexShrink: 0,
            alignContent: "center",
            paddingLeft: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex" }}>
              <button
                style={{ cursor: "pointer" }}
                className="back-btn"
                onClick={() => n(OrdersPath)}
              >
                <i className="icon"> </i>
              </button>
              <TextV2
                text={"Новый рецепт"}
                style={{
                  fontFamily: `Manrope, sans-serif`,
                  paddingLeft: 10,
                  alignContent: "center",
                }}
              />
            </div>
            <div>
              <div>{right} </div>
            </div>
          </div>
        </div>
        <div style={{ padding: 20, overflow: "auto", flex: 1, minHeight: 0 }}>
          {child}
        </div>
      </div>
    </div>
  );
};
