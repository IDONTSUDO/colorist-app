import React, { useState, useEffect, useRef } from "react";

interface RussianPhoneInputDivProps {
  initialValue?: string;
  onChange?: (text: string) => void;
}

const PhoneInput: React.FC<RussianPhoneInputDivProps> = ({
  initialValue = "",
  onChange,
}) => {
  const [value, setValue] = useState<string>("");
  const divRef = useRef<HTMLDivElement | null>(null);

  // Максимум 10 цифр после +7
  const MAX_DIGITS = 10;

  const formatPhone = (input: string): string => {
    const digits = input.replace(/\D/g, "").substring(0, 1 + MAX_DIGITS); // +7 + 10 цифр = 11 цифр всего
    let formatted = "+7 ";

    if (digits.length > 1) formatted += "(" + digits.substring(1, 4);
    if (digits.length >= 4) formatted += ") " + digits.substring(4, 7);
    if (digits.length >= 7) formatted += "-" + digits.substring(7, 9);
    if (digits.length >= 9) formatted += "-" + digits.substring(9, 11);

    return formatted;
  };

  const cleanInput = (text: string): string => {
    let digitsOnly = text.replace(/\D/g, "");
    if (digitsOnly.startsWith("8")) {
      digitsOnly = "7" + digitsOnly.substring(1);
    }
    if (!digitsOnly.startsWith("7")) {
      digitsOnly = "7" + digitsOnly;
    }
    // Ограничиваем 1 + 10 цифр
    return "+" + digitsOnly;
  };

  useEffect(() => {
    if (initialValue) {
      const cleaned = cleanInput(initialValue);
      setValue(formatPhone(cleaned));
    }
  }, [initialValue]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    let input = e.currentTarget.innerText;
    input = cleanInput(input);
    const formatted = formatPhone(input);
    setValue(formatted);
    onChange?.(formatted);
  };

  useEffect(() => {
    if (divRef.current && divRef.current.innerText !== value) {
      divRef.current.innerText = value;
      // Помещаем курсор в конец
      const range = document.createRange();
      const sel = window.getSelection();
      if (sel) {
        range.selectNodeContents(divRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [value]);

  return (
    <div
      ref={divRef}
      contentEditable
      onInput={handleInput}
      style={{
        border: "1px solid",
        borderRadius: "4px",
        padding: "16px 10px",
        width: "220px",
        backgroundColor: "rgb(245, 245, 245)",
        fontSize: "16px",
        minHeight: "30px",
        outline: "none",
        userSelect: "text",
      }}
      spellCheck={false}
      data-placeholder="+7 (___) ___-__-__"
    />
  );
};

export default PhoneInput;

// 2000+2000+
// -2000-16500
