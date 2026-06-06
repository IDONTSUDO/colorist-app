import { useState } from "react";

export const TextV2: React.FC<{
  isEditable?: boolean;
  text?: string | String;
  currentRef?: any;
  color?: string;
  initialValue?: string | String;
  size?: number;
  onChange?: (text: string) => void;
  style?: React.CSSProperties;
  onClick?: () => void;
}> = ({
  isEditable,
  text,
  color,
  size,
  style,
  onChange,
  currentRef,
  onClick,
  initialValue,
}) => {
  const [val, _] = useState(initialValue);
  return (
    <div
      onClick={() => onClick?.()}
      ref={currentRef}
      onInput={(event) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        onChange?.(event.target.innerText);
      }}
      suppressContentEditableWarning={true}
      contentEditable={isEditable ?? false}
      style={Object.assign(
        {
          fontFamily: `'system-ui'`,
          fontStyle: "normal",
          fontWeight: 500,
          fontSize: size ?? 16,

          color: color ?? "black",
        },
        style ?? {},
      )}
    >
      {val ?? text}
    </div>
  );
};
