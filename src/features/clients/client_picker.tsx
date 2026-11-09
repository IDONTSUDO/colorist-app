import { useEffect, useMemo, useState } from "react";
import { InputV3 } from "../../core/ui/input/input_v3";
import { Button } from "../../core/ui/button/Button";
import { ClientsDbRepository } from "./clients_db_repository";
import type { ClientViewModel } from "./clients_db_model";

export const clientFullName = (c: ClientViewModel) =>
  [c.family, c.name, c.surName].filter((el) => el && el.trim()).join(" ");

const digits = (s: string | undefined) => (s ?? "").replace(/\D/g, "");

const formatPhone = (phone?: string) => (phone ? phone.phoneMapper() : "");

const border = "1px solid var(--bd-oklch-92-9-0-013-255-508)";
const muted = "var(--tx-8fa1b9)";

// репозиторий создается лениво: на этапе импорта модуля db из main.tsx
// еще не инициализирован (циклический импорт main → routers → ... → сюда)
const loadClients = async () => {
  const repository = new ClientsDbRepository();
  return (await repository.db
    .getRepository(repository.entity)
    .toArray()) as ClientViewModel[];
};

/**
 * Выбор клиента: одно поле, поиск по ФИО или телефону по мере ввода.
 * Выбранный клиент показывается карточкой с кнопкой «Изменить».
 */
export const ClientPicker: React.FC<{
  value?: number;
  onChange: (client: ClientViewModel | undefined) => void;
  label?: string;
}> = ({ value, onChange, label = "Клиент" }) => {
  const [clients, setClients] = useState<ClientViewModel[]>([]);
  const [query, setQuery] = useState("");

  const reload = () => loadClients().then(setClients).catch(console.error);
  useEffect(() => {
    reload();
  }, []);

  const selected = clients.find((c) => c.id === value);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qDigits = digits(q);
    return clients
      .filter(
        (c) =>
          clientFullName(c).toLowerCase().includes(q) ||
          (qDigits.length > 0 && digits(c.numberPhone).includes(qDigits)),
      )
      .slice(0, 8);
  }, [clients, query]);

  const onQueryChange = (text: string) => {
    // подхватываем клиентов, добавленных пока экран был открыт
    if (!query.trim() && text.trim()) reload();
    setQuery(text);
  };

  return (
    <div>
      <div style={{ marginBottom: 6 }}>{label}</div>
      {value !== undefined && value !== 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 14px",
            border: "1px solid oklch(0.208 0.042 265.755)",
            borderRadius: 6,
            background: "var(--bg-oklch-97-0-01-255)",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>
              ✓ {selected ? clientFullName(selected) || "Без имени" : "Клиент"}
            </div>
            {selected && (
              <div style={{ color: muted, fontSize: 13 }}>
                {formatPhone(selected.numberPhone)}
              </div>
            )}
          </div>
          <Button
            text="Изменить"
            onClick={() => {
              setQuery("");
              onChange(undefined);
            }}
          />
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <InputV3
            style={{ width: "100%", height: 46 }}
            placeHolderType=""
            placeholder="Начните вводить ФИО или телефон"
            value={query}
            onChange={onQueryChange}
          />
          {matches.length > 0 && (
            <div style={dropdown}>
              {matches.map((client) => (
                <div
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: border,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-oklch-97-0-01-255)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => onChange(client)}
                  onKeyDown={(e) => e.key === "Enter" && onChange(client)}
                >
                  <div>{clientFullName(client) || "Без имени"}</div>
                  <div style={{ color: muted, fontSize: 13 }}>
                    {formatPhone(client.numberPhone)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {query.trim() && matches.length === 0 && (
            <div style={{ color: muted, marginTop: 6 }}>Клиенты не найдены</div>
          )}
        </div>
      )}
    </div>
  );
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  background: "var(--bg-fff)",
  border,
  borderRadius: 6,
  marginTop: 4,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  maxHeight: 320,
  overflowY: "auto",
};
