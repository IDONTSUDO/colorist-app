import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { InputV3 } from "../../core/ui/input/input_v3";
import { CarsDbRepository } from "./cars_db_repository";
import { CarsViewModel } from "./cars_model";

const border = "1px solid var(--bd-oklch-92-9-0-013-255-508)";
const muted = "var(--tx-8fa1b9)";

// репозиторий создается лениво: на этапе импорта модуля db из main.tsx
// еще не инициализирован (как в ClientPicker)
const loadCars = async () => {
  const repository = new CarsDbRepository();
  return (
    (await repository.db
      .getRepository(repository.entity)
      .toArray()) as CarsViewModel[]
  )
    .map((el) => el.name)
    .filter((name): name is string => !!name && name.trim() !== "");
};

// для поиска: регистр, ё/е, дефисы и лишние пробелы не важны
export const normalizeCarName = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[-_.,/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Поле «Авто»: поиск по справочнику авто по мере ввода, как у клиентов.
 * Каждое слово запроса ищется в любом месте названия. Можно ввести своё
 * название и добавить его в справочник.
 */
export const CarPicker: React.FC<{
  value?: string;
  onChange: (name: string) => void;
  label?: string;
  // для строки поиска: без пункта «добавить в справочник»
  allowAdd?: boolean;
  placeholder?: string;
  onEnter?: () => void;
}> = ({
  value,
  onChange,
  label = "Авто",
  allowAdd = true,
  placeholder = "Начните вводить марку или модель",
  onEnter,
}) => {
  const [cars, setCars] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const reload = () => loadCars().then(setCars).catch(console.error);
  useEffect(() => {
    reload();
  }, []);

  const query = value ?? "";
  const q = normalizeCarName(query);

  const matches = useMemo(() => {
    if (!q) return [];
    const words = q.split(" ");
    const unique = [...new Set(cars)];
    return (
      unique
        .map((name) => ({ name, n: normalizeCarName(name) }))
        .filter(({ n }) => words.every((w) => n.includes(w)))
        // сначала начинающиеся с запроса, потом по алфавиту
        .sort(
          (a, b) =>
            Number(b.n.startsWith(q)) - Number(a.n.startsWith(q)) ||
            a.name.localeCompare(b.name, "ru"),
        )
        .slice(0, 8)
        .map((el) => el.name)
    );
  }, [cars, q]);

  const exact = cars.some((name) => normalizeCarName(name) === q);

  const select = (name: string) => {
    onChange(name);
    setIsOpen(false);
  };

  const addToCatalog = async () => {
    const name = query.trim();
    if (!name || exact) return;
    const m = new CarsViewModel();
    m.name = name;
    (await new CarsDbRepository().addModel(m)).fold(
      () => {
        message.success(`«${name}» добавлено в справочник авто`);
        reload();
      },
      (err) => message.error(err as any),
    );
    setIsOpen(false);
  };

  const canAdd = allowAdd && !exact;
  const showDropdown = isOpen && q !== "" && (matches.length > 0 || canAdd);

  return (
    <div style={{ width: "100%" }}>
      {label ? <div style={{ marginBottom: 6 }}>{label}</div> : null}
      <div
        style={{ position: "relative" }}
        onFocus={() => setIsOpen(true)}
        // закрываем, когда фокус ушёл из поля и списка
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setIsOpen(false);
        }}
      >
        <InputV3
          style={{ width: "100%", height: 46 }}
          placeHolderType=""
          placeholder={placeholder}
          value={query}
          onChange={(text) => {
            // подхватываем авто, добавленные пока экран был открыт
            if (!query.trim() && text.trim()) reload();
            onChange(text);
            setIsOpen(true);
          }}
          onEnter={() => {
            if (isOpen && matches.length > 0 && !exact) {
              select(matches[0]);
              return;
            }
            setIsOpen(false);
            onEnter?.();
          }}
        />
        {showDropdown && (
          <div style={dropdown}>
            {matches.map((name) => (
              <div
                key={name}
                role="button"
                tabIndex={0}
                style={item}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--bg-oklch-97-0-01-255)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(name)}
                onKeyDown={(e) => e.key === "Enter" && select(name)}
              >
                {name}
              </div>
            ))}
            {canAdd && (
              <div
                role="button"
                tabIndex={0}
                style={{ ...item, color: "var(--tx-4f46e5)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--bg-oklch-97-0-01-255)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={addToCatalog}
                onKeyDown={(e) => e.key === "Enter" && addToCatalog()}
              >
                + добавить «{query.trim()}» в справочник
                {matches.length === 0 && (
                  <div style={{ color: muted, fontSize: 13 }}>
                    в справочнике такого авто нет
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const item: React.CSSProperties = {
  padding: "8px 12px",
  cursor: "pointer",
  borderBottom: border,
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
