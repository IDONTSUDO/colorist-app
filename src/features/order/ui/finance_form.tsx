import React, { useState } from "react";
import type { OrderStore } from "../order_store";
import { observer } from "mobx-react-lite";
import { ModalV2 } from "../../../core/ui/modal/modal";

export const FinancialAccountingForm: React.FC<{ store: OrderStore }> =
  observer(({ store }) => {
    console.log(store.viewModel.markup);
    // Состояния для полей формы
    const [financialStatus, __] = useState<string>("");
    const [markup, _] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    // Проверка на ввод только числовых значений
    const isInvalid = markup !== "" && isNaN(Number(markup));

    // Базовые стили для лейблов
    const labelStyle: React.CSSProperties = {
      fontSize: "12px",
      fontWeight: 600,
      color: "#4a5568",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "6px",
      display: "block",
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          backgroundColor: "#fafafa",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          maxWidth: "500px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          Управление статусом финансов
        </h3>

        {/* Выпадающий список (Селект) */}
        <div>
          <label style={labelStyle}>Статус</label>
          <select
            value={store.viewModel.financeStatus}
            onChange={(e) => {
              store.updateForm({ financeStatus: e.target.value });
              store.updateOrder();
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: "#ffffff",
              color: financialStatus ? "#1a202c" : "#718096",
              outline: "none",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            <option value="" disabled hidden>
              Выберите статус...
            </option>
            <option value="Оплачено">Оплачено</option>
            <option value="Ожидает оплаты">Ожидает оплаты</option>
            <option value="Долг">Долг</option>
          </select>
        </div>

        {/* Информационная строка себестоимости */}
        <div
          style={{
            fontSize: "14px",
            color: "#4a5568",
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => store.openReportComponentsModal()}
        >
          <span>Себестоймость компонентов:</span>
          <strong style={{ color: "#1a202c" }}>
            {store.getCostComponents().shortToDecimalPlaces(2)} ₽
          </strong>
        </div>

        {/* Поле ввода: Наценка */}
        <div>
          <label style={labelStyle}>Наценка</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={store.viewModel.markup?.toString()}
              onChange={(e) => {
                store.updateForm({ markup: Number(e.target.value) });
                store.updateOrder();
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Введите сумму..."
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "15px",
                border: "1px solid",
                borderColor: isInvalid
                  ? "#ef4444"
                  : isFocused
                    ? "#4f46e5"
                    : "#cbd5e1",
                borderRadius: "6px",
                backgroundColor: "#ffffff",
                color: "#1a202c",
                outline: "none",
                boxSizing: "border-box",
                boxShadow: isInvalid
                  ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
                  : isFocused
                    ? "0 0 0 3px rgba(79, 70, 229, 0.1)"
                    : "none",
                transition: "all 0.2s",
              }}
            />
          </div>
          {/* Сообщение об ошибке валидации */}
          {isInvalid && (
            <span
              style={{
                fontSize: "12px",
                color: "#ef4444",
                marginTop: "6px",
                display: "block",
              }}
            >
              Предупреждение: допускаются только числа
            </span>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          type="button"
          disabled={isInvalid}
          style={{
            padding: "11px 20px",
            backgroundColor: isInvalid ? "#cbd5e1" : "#4f46e5",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: isInvalid ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => {
            if (!isInvalid) e.currentTarget.style.backgroundColor = "#4338ca";
          }}
          onMouseLeave={(e) => {
            if (!isInvalid) e.currentTarget.style.backgroundColor = "#4f46e5";
          }}
        >
          Сохранить
        </button>

        {/* Итоговый результат */}
        <div
          style={{
            marginTop: "8px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#4a5568" }}>
            Итоговая стоимость для клиента:
          </span>
          <strong
            style={{ fontSize: "20px", fontWeight: 700, color: "#4f46e5" }}
          >
            {(
              store.getOrderCost() + (store.viewModel.markup ?? 0)
            ).shortToDecimalPlaces(2)}
            ₽
          </strong>
        </div>
        <ModalV2
          isOpen={store.reportComponentsModalIsOpen}
          onClose={() => store.closeReportComponentsModal()}
          children={
            <>
              {store.getOrderStatisticComponents().map((el, i) => {
                return (
                  <div
                    key={i}
                    style={{ border: "1px solid", padding: 10, margin: 10 }}
                  >
                    {/* <div>{el.privateNumber}</div> */}
                    <TextBar
                      left={el.privateNumber}
                      right="приватный компонент"
                    />
                    <TextBar
                      left={el.costPrice.shortToDecimalPlaces(2)}
                      right="цена за грамм компонента"
                    />
                    <TextBar
                      left={el.weightInTheRecipe.shortToDecimalPlaces(2)}
                      right="вес в рецепте"
                    />
                    <TextBar
                      left={el.finalCostOfTheComponent.shortToDecimalPlaces(2)}
                      right="финальная себе стоймость компонента"
                    />
                  </div>
                );
              })}
            </>
          }
        />
      </div>
    );
  });
const TextBar: React.FC<{ left: string | number; right: string | number }> = ({
  left,
  right,
}) => {
  return (
    <div style={{ display: "flex" }}>
      <div>{right} :</div>
      <div>{left}</div>
    </div>
  );
};
