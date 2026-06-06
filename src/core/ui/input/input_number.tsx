import { useEffect, useRef, useState } from "react";
import { TextV2 } from "../text/text";
import { Icon, IconType } from "../icon/icon";

export const InputNumber: React.FC<{
  initialValue?: number;
  icon?: IconType;
  label?: string;
  error?: string;
}> = ({ initialValue, label, icon, error }) => {
  const [value, _] = useState(initialValue ?? 0);
  const [hasFocus, setFocus] = useState(false);
  const [display, setDisplay] = useState("block");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setDisplay(getDisplay());
  }, [value, hasFocus]);
  useEffect(() => {
    ref.current?.addEventListener("focus", () => {
      setFocus(true);
    });

    ref.current?.addEventListener("blur", () => {
      setFocus(false);
    });
  });
  const getDisplay = () => {
    if (value === 0) {
      return "block";
    }

    if (value.toString().length !== 0 && value.toString().length !== 1) {
      return "none";
    }

    if (hasFocus) {
      return "none";
    }

    return "block";
  };
  return (
    <div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 12, left: 10 }}>
          {icon != undefined ? (
            <Icon
              type={icon}
              color={error != undefined ? "#F44336" : undefined}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <TextV2
          style={{
            position: "absolute",
            top: 10,
            left: icon != undefined ? 40 : 10,
            pointerEvents: "none",
            display: display,
          }}
          text={label}
          color={error != undefined ? "#F44336" : "#64748B"}
        />
      </div>
      <TextV2
        color="#64748B"
        currentRef={ref}
        onChange={(_) => {}}
        text={initialValue?.toString()}
        isEditable={true}
        style={{
          border: "1.5px solid #E2E8F0",
          borderRadius: 4,
          height: 40,
          background: "#FFFFFF",
          width: 470,
          paddingTop: 8,

          paddingLeft: icon != undefined ? 40 : 10,
          overflow: "auto",
        }}
      />
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", bottom: -20 }}>
          <TextV2 text={error} color="#F44336" style={{ paddingLeft: 10 }} />
        </div>
      </div>
    </div>
  );
};
