import { useNavigate } from "react-router-dom";
import { OrdersPath } from "../../../features/orders/orders";
import { TextV2 } from "../text/text";

export const Menu: React.FC<{
  child: React.ReactNode;
  right: React.ReactNode;
}> = ({ child, right }) => {
  const n = useNavigate();
  return (
    <div style={{ height: "100vh", backgroundColor: "var(--bg-secondary)" }}>
      <div style={{ height: 48 }}></div>
      <div
        className="app"
        style={{
          marginLeft: 20,
          marginRight: 20,
          minHeight: "90%",
          height: 10,
        }}
      >
        <div
          className="topbar"
          style={{
            // backgroundColor: "#000000",
            height: 50,
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
        <div style={{ padding: 20, overflowX: "auto", height: "100%" }}>
          {child}
        </div>
      </div>
    </div>
  );
};
