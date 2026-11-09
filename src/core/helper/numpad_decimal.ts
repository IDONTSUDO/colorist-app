// Клавиша «Del / .» на цифровом блоке в русской раскладке вводит «,» вместо точки.
// Перехватываем её глобально и вставляем «.» в любое поле ввода
// (input, textarea, contentEditable) — как будто нажали точку.
const isEditable = (el: EventTarget | null): el is HTMLElement => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    return (
      !el.readOnly &&
      !el.disabled &&
      ["text", "search", "tel", "number", ""].includes(el.type)
    );
  }
  return false;
};

export const enableNumpadDecimalPoint = () => {
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.code !== "NumpadDecimal" || event.key === ".") return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (!isEditable(event.target)) return;
      event.preventDefault();
      // insertText вызывает обычное событие input — React onChange/onInput сработают
      document.execCommand("insertText", false, ".");
    },
    true,
  );
};
