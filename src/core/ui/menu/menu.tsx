import { useNavigate } from "react-router-dom";
import { OrdersPath } from "../../../features/orders/orders";

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
      {/* верх страницы: «назад» + название, справа от них — вкладки */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-end",
          minHeight: 48,
          paddingLeft: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            height: 48,
          }}
        >
          <button
            style={{ cursor: "pointer" }}
            className="back-btn"
            title="К списку заказов"
            onClick={() => n(OrdersPath)}
          >
            <i className="icon"> </i>
          </button>
          {/* <TextV2
            text={"Заказ"}
            style={{
              fontFamily: `Manrope, sans-serif`,
              paddingLeft: 10,
              whiteSpace: "nowrap",
              alignContent: "center",
            }}
          /> */}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{top}</div>
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
              justifyContent: "flex-end",
            }}
          >
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
