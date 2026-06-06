import React from "react";
import { TextV2 } from "../text/text";

export const Button: React.FC<{
  text?: string;
  color?: string;
  height?: number;
  width?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}> = ({ text, color, height, width, onClick, style }) => (
  <div
    onClick={() => onClick?.()}
    style={Object.assign(
      {
        backgroundColor: color ?? "rgb(0 0 0)",
        height: height ?? 58,
        width: width ?? 470,
        alignContent: "center",
        justifyItems: "center",
        cursor: "pointer",
      },
      style,
    )}
  >
    <TextV2 text={text} color="white" />
  </div>
);
