import React from "react";
import { TextV2 } from "../text/text";

export enum ButtonType {
  gray,
  default,
  blue,
  delete,
}
const getColorBorder = (type: ButtonType): string => {
  if (type === ButtonType.default) {
    return "#e2e8f1";
  }
  if (type === ButtonType.delete) {
    return "#ffccd2";
  }
  if (type === ButtonType.blue) {
    return "#1d4ed8";
  }
  return "";
};
const getBgColor = (type: ButtonType) => {
  // (color ?? type === ButtonType.gray) ? "oklch(0.208 0.042 265.755)" : "white";
  if (type === ButtonType.gray) {
    return "oklch(0.208 0.042 265.755)";
  }
  if (type === ButtonType.blue) {
    return "#2563eb";
  }
  return "white";
};
const getTextColor = (type: ButtonType): string => {
  if (type === ButtonType.blue) {
    return "white";
  }
  if (type === ButtonType.gray) {
    return "white";
  }
  if (type === ButtonType.delete) {
    return "oklch(64.5% 0.246 16.439)";
  }
  if (type === ButtonType.default) {
    return "oklch(37.2% 0.044 257.287)";
  }
  return "";
};
export const Button: React.FC<{
  text?: string;
  color?: string;
  height?: number;
  width?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  textColor?: string;
  type?: ButtonType;
}> = ({
  text,
  color,
  height,
  width,
  onClick,
  style,
  textColor,
  type = ButtonType.default,
}) => (
  <div
    onClick={() => onClick?.()}
    style={Object.assign(
      {
        backgroundColor: getBgColor(type),
        height: "min-content",
        border: `1px solid ${getColorBorder(type)}`,
        alignContent: "center",
        justifyItems: "center",
        borderRadius: 6,
        cursor: "pointer",
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
      },
      style,
    )}
  >
    <TextV2 text={text} color={getTextColor(type)} />
  </div>
);
