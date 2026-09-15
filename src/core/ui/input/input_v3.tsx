import * as React from "react";

export enum CoreInputType {
  small = "small",
  default = "default",
  big = "big",
}

export const InputV3 = (props: {
  style?: React.CSSProperties;
  placeholder?: string;
  labelStyle?: React.CSSProperties;
  initialValue?: string;
  value?: string;
  subLabel?: React.ReactNode;
  onChange?: (value: string) => void;
  validation?: (value: string) => boolean;
  error?: string;
  type?: CoreInputType;
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

    if (props.trim) {
      newValue = newValue.trim();
    }

    if (props.validation && !props.validation(newValue)) {
      return;
    }

    // Обновляем локальный стейт ВСЕГДА, чтобы точка не исчезала
    setValue(newValue);

    // Отправляем в стор (там выполнится ваш Number(text))
    props.onChange?.(newValue);
  };
  React.useEffect(() => {
    if (props.value !== undefined && !isFocused) {
      setValue(props.value);
    }
  }, [props.value, isFocused]); // добавили isFocused в зависимости
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
        value={value}
        onChange={handleChange}
        placeholder={
          props.placeHolderType !== undefined ? props.placeholder : undefined
        }
        style={Object.assign(
          {
            height: 40,
            color: "#8fa1b9",
            borderRadius: 5,
            border: "1px solid oklch(92.9% 0.013 255.508)",
          },
          props.style,
        )}
        // type="text"
      />

      {props.error && (
        <span style={{ color: "red", fontSize: "12px" }}>{props.error}</span>
      )}
      {props.subLabel && <div>{props.subLabel}</div>}
    </div>
  );
};
