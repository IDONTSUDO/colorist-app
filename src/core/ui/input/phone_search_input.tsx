import React from "react";

// 10 цифр после +7 → "+7 (999) 123-45-67" (частичный ввод тоже форматируется)
export const formatPhoneDigits = (digits: string): string => {
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  let s = "+7 (" + d.slice(0, 3);
  if (d.length >= 3) s += ")";
  if (d.length > 3) s += " " + d.slice(3, 6);
  if (d.length > 6) s += "-" + d.slice(6, 8);
  if (d.length > 8) s += "-" + d.slice(8, 10);
  return s;
};

// Из того, что ввёл/вставил пользователь, достаём до 10 цифр номера без кода страны
export const phoneDigitsFromInput = (text: string): string => {
  let d = text.replace(/\D/g, "");
  // "+7 (" из маски или номер, вставленный целиком с 7/8 в начале
  if (text.trim().startsWith("+7") || (d.length === 11 && /^[78]/.test(d))) {
    d = d.slice(1);
  }
  return d.slice(0, 10);
};

export const PhoneSearchInput: React.FC<{
  value?: string; // только цифры
  onChange: (digits: string) => void;
  onEnter?: () => void;
  style?: React.CSSProperties;
}> = ({ value = "", onChange, onEnter, style }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  return (
    <input
      type="tel"
      inputMode="tel"
      autoComplete="off"
      placeholder="+7 (___) ___-__-__"
      value={formatPhoneDigits(value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onChange={(e) => {
        const next = phoneDigitsFromInput(e.target.value);
        // Backspace по ")", " " или "-" не меняет цифры — удаляем последнюю цифру
        const prevFormatted = formatPhoneDigits(value);
        if (
          next === value &&
          e.target.value.length < prevFormatted.length
        ) {
          onChange(value.slice(0, -1));
          return;
        }
        onChange(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEnter?.();
      }}
      style={Object.assign(
        {
          width: "100%",
          height: 46,
          boxSizing: "border-box",
          padding: "0 10px",
          borderRadius: 5,
          fontSize: 16,
          letterSpacing: 0.3,
          outline: "none",
          color: "var(--tx-oklch-37-2-0-044-257-287)",
          background: "var(--bg-fff)",
          border: `1px solid ${
            isFocused ? "var(--bd-cbd5e1)" : "var(--bd-oklch-92-9-0-013-255-508)"
          }`,
          transition: "border-color 0.15s",
        } as React.CSSProperties,
        style,
      )}
    />
  );
};
