import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import type { ClientViewModel } from "../../clients/clients_db_model";

// Интерфейс для данных формы клиента
interface ClientFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
}

export const ClientForm: React.FC<{ orderViewModel: ClientViewModel }> =
  observer(({ orderViewModel }) => {
    // Инициализируем состояние значениями со скриншота
    const [formData, setFormData] = useState<ClientFormData>({
      firstName: orderViewModel.name,
      lastName: orderViewModel.family,
      middleName: orderViewModel.surName,
      phone: orderViewModel.numberPhone.phoneMapper(),
    });

    // Отслеживаем активное поле для эффекта фокуса
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Метод генерации динамических стилей для инпутов
    const getInputStyle = (fieldName: string): React.CSSProperties => ({
      width: "100%",
      padding: "10px 12px",
      fontSize: "15px",
      border: "1px solid",
      borderColor: focusedField === fieldName ? "#4f46e5" : "#cbd5e1",
      borderRadius: "6px",
      backgroundColor: "#ffffff",
      color: "#1a202c",
      outline: "none",
      boxSizing: "border-box",
      boxShadow:
        focusedField === fieldName
          ? "0 0 0 3px rgba(79, 70, 229, 0.1)"
          : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
    });

    // Общий стиль для лейблов
    const labelStyle: React.CSSProperties = {
      fontSize: "12px",
      fontWeight: 600,
      color: "#4a5568",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    };

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          backgroundColor: "#fafafa",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "24px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Поле: Имя */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Имя</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onFocus={() => setFocusedField("firstName")}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle("firstName")}
            placeholder="Введите имя..."
          />
        </div>

        {/* Поле: Фамилия */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Фамилия</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onFocus={() => setFocusedField("lastName")}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle("lastName")}
            placeholder="Введите фамилию..."
          />
        </div>

        {/* Поле: Отчество */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Отчество</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            onFocus={() => setFocusedField("middleName")}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle("middleName")}
            placeholder="Введите отчество..."
          />
        </div>

        {/* Поле: Номер телефона */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>Номер телефона</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onFocus={() => setFocusedField("phone")}
            onBlur={() => setFocusedField(null)}
            style={getInputStyle("phone")}
            placeholder="Введите номер телефона..."
          />
        </div>
      </div>
    );
  });
