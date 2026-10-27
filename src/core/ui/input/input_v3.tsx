import * as React from "react";

export type CoreInputTypeV2 = "text" | "number" | "password";
export const InputV3 = (props: {
  style?: React.CSSProperties;
  autoCompleteChildren?: string[];
  onClickAutoCompleteChildren?: (index: number) => void;
  placeholder?: string;
  labelStyle?: React.CSSProperties;
  initialValue?: string;
  value?: string;
  subLabel?: React.ReactNode;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
  validation?: (value: string) => boolean;
  error?: string;
  type?: CoreInputTypeV2;
  trim?: boolean;
  styleContentEditable?: React.CSSProperties;
  isFormBuilder?: boolean;
  label?: string;
  placeHolderType?: string;
}) => {
  const [value, setValue] = React.useState<string>(
    () => props.value ?? props.initialValue ?? "",
  );

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;

    newValue = newValue.replace(/,/g, ".");

    if (props.trim) {
      newValue = newValue.trim();
    }

    if (props.validation && !props.validation(newValue)) {
      return;
    }

    setValue(newValue);
    props.onChange?.(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      props.onEnter?.(value);
    }
  };

  React.useEffect(() => {
    if (props.value !== undefined && !isFocused) {
      setValue(props.value);
    }
  }, [props.value, isFocused]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {props.label && <div style={props.labelStyle}>{props.label}</div>}
      {props.placeHolderType === undefined ? (
        <>
          <div style={{ fontSize: 10 }}>{props.placeholder}</div>
        </>
      ) : (
        <></>
      )}

      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        value={value}
        onChange={handleChange}
        type={props.type === "number" ? "text" : props.type}
        inputMode={props.type === "number" ? "decimal" : undefined} // Вызовет правильную клавиатуру на смартфонах
        placeholder={
          props.placeHolderType !== undefined ? props.placeholder : undefined
        }
        style={Object.assign(
          {
            height: 40,
            color: "#8fa1b9",
            borderRadius: 5,
            border: "1px solid oklch(92.9% 0.013 255.508)",
            padding: "0 10px",
          },
          props.style,
        )}
      />

      {props.error && (
        <span style={{ color: "red", fontSize: "12px" }}>{props.error}</span>
      )}
      {props.subLabel && <div>{props.subLabel}</div>}

      <div style={{ position: "relative" }}>
        {props.autoCompleteChildren !== undefined ? (
          <div
            style={{
              position: "absolute",
              backgroundColor: "white",
              width: "100%",
              boxShadow: "#9a9a9a 0px 5px 5px",
              borderRadius: 5,
              zIndex: 10,
            }}
          >
            {props.autoCompleteChildren.map((el, i) => (
              <div
                key={i}
                onClick={() => props.onClickAutoCompleteChildren?.(i)}
                className="hover-box"
                style={{ padding: 10, cursor: "pointer" }}
              >
                {el}
              </div>
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
