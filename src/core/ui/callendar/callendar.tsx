import { useState, useCallback } from "react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface CalendarProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
}

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayBasedDow(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function pluralDays(n: number): string {
  if (n === 1) return "день";
  if (n >= 2 && n <= 4) return "дня";
  return "дней";
}

interface MonthGridProps {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  hovering: Date | null;
  minDate?: Date;
  maxDate?: Date;
  onDayClick: (date: Date) => void;
  onDayHover: (date: Date | null) => void;
}

export function MonthGrid({
  year,
  month,
  startDate,
  endDate,
  hovering,
  minDate,
  maxDate,
  onDayClick,
  onDayHover,
}: MonthGridProps) {
  const today = startOfDay(new Date());
  const firstDayDow = getMondayBasedDow(new Date(year, month, 1));
  const daysInMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const effectiveEnd = endDate ?? (startDate && hovering ? hovering : null);

  const rangeStart =
    startDate && effectiveEnd
      ? startOfDay(startDate < effectiveEnd ? startDate : effectiveEnd)
      : (startDate ?? null);
  const rangeEnd =
    startDate && effectiveEnd
      ? startOfDay(startDate < effectiveEnd ? effectiveEnd : startDate)
      : null;

  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstDayDow; i++) {
    cells.push(
      <div key={`prev-${i}`} style={styles.dayEmpty}>
        {daysInPrevMonth - firstDayDow + i + 1}
      </div>,
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = startOfDay(new Date(year, month, d));
    const ts = date.getTime();

    const isToday = isSameDay(date, today);
    const isDisabled =
      (minDate && date < startOfDay(minDate)) ||
      (maxDate && date > startOfDay(maxDate));

    let isStart = false;
    let isEnd = false;
    let isInRange = false;

    if (rangeStart && rangeEnd) {
      isStart = isSameDay(date, rangeStart);
      isEnd = isSameDay(date, rangeEnd);
      isInRange = ts > rangeStart.getTime() && ts < rangeEnd.getTime();
    } else if (rangeStart) {
      isStart = isSameDay(date, rangeStart);
      isEnd = isStart; // single day selected
    }

    const cellStyle: React.CSSProperties = {
      ...styles.day,
      ...(isDisabled ? styles.dayDisabled : {}),
      ...(isInRange ? styles.dayInRange : {}),
      ...(isStart && isEnd ? styles.dayStartEnd : {}),
      ...(isStart && !isEnd ? styles.dayStart : {}),
      ...(isEnd && !isStart ? styles.dayEnd : {}),
    };

    cells.push(
      <div
        key={d}
        style={cellStyle}
        onClick={() => !isDisabled && onDayClick(date)}
        onMouseEnter={() => !isDisabled && onDayHover(date)}
        aria-label={date.toLocaleDateString("ru-RU")}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && !isDisabled && onDayClick(date)}
      >
        {d}
        {isToday && !isStart && !isEnd && !isInRange && (
          <span style={styles.todayDot} aria-hidden="true" />
        )}
      </div>,
    );
  }

  // Trailing cells
  const total = cells.length;
  const trailing = (7 - (total % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    cells.push(
      <div key={`next-${i}`} style={styles.dayEmpty}>
        {i}
      </div>,
    );
  }

  return (
    <div onMouseLeave={() => onDayHover(null)}>
      <div style={styles.weekdays}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={styles.weekday}>
            {wd}
          </div>
        ))}
      </div>
      <div style={styles.daysGrid}>{cells}</div>
    </div>
  );
}

export function Calendar({ value, onChange, minDate, maxDate }: CalendarProps) {
  const [internalRange, setInternalRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [leftMonth, setLeftMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [hovering, setHovering] = useState<Date | null>(null);

  const range = value ?? internalRange;

  const setRange = useCallback(
    (next: DateRange) => {
      setInternalRange(next);
      onChange?.(next);
    },
    [onChange],
  );

  const rightMonth = addMonths(leftMonth, 1);

  const handleDayClick = (date: Date) => {
    const { startDate, endDate } = range;
    if (!startDate || endDate) {
      setRange({ startDate: date, endDate: null });
      setHovering(null);
      return;
    }
    if (isSameDay(date, startDate)) {
      setRange({ startDate: null, endDate: null });
      return;
    }
    const [s, e] = date < startDate ? [date, startDate] : [startDate, date];
    setRange({ startDate: s, endDate: e });
    setHovering(null);
  };

  const handleDayHover = (date: Date | null) => {
    if (range.startDate && !range.endDate) setHovering(date);
  };

  const clearRange = () => {
    setRange({ startDate: null, endDate: null });
    setHovering(null);
  };

  const diffDays =
    range.startDate && range.endDate
      ? Math.round(
          (range.endDate.getTime() - range.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : null;

  const hint = !range.startDate
    ? "Выберите дату начала"
    : !range.endDate
      ? "Выберите дату окончания"
      : "Диапазон выбран";

  return (
    <div style={styles.root}>
      {/* Navigation */}
      <div style={styles.header}>
        <button
          style={styles.navBtn}
          onClick={() => setLeftMonth((m) => addMonths(m, -1))}
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <div style={styles.monthLabels}>
          <span style={styles.monthLabel}>
            {MONTHS[leftMonth.getMonth()]} {leftMonth.getFullYear()}
          </span>
          <span style={styles.monthLabel}>
            {MONTHS[rightMonth.getMonth()]} {rightMonth.getFullYear()}
          </span>
        </div>
        <button
          style={styles.navBtn}
          onClick={() => setLeftMonth((m) => addMonths(m, 1))}
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      {/* Two calendars */}
      <div style={styles.grids}>
        <MonthGrid
          year={leftMonth.getFullYear()}
          month={leftMonth.getMonth()}
          startDate={range.startDate}
          endDate={range.endDate}
          hovering={hovering}
          minDate={minDate}
          maxDate={maxDate}
          onDayClick={handleDayClick}
          onDayHover={handleDayHover}
        />
        <div style={styles.divider} />
        <MonthGrid
          year={rightMonth.getFullYear()}
          month={rightMonth.getMonth()}
          startDate={range.startDate}
          endDate={range.endDate}
          hovering={hovering}
          minDate={minDate}
          maxDate={maxDate}
          onDayClick={handleDayClick}
          onDayHover={handleDayHover}
        />
      </div>

      {/* Hint */}
      <p style={styles.hint}>{hint}</p>

      {/* Result bar */}
      {range.startDate && range.endDate && diffDays !== null && (
        <div style={styles.resultBar}>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>Начало</span>
            <span style={styles.resultValue}>
              {formatDate(range.startDate)}
            </span>
          </div>
          <span style={styles.arrow}>→</span>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>Конец</span>
            <span style={styles.resultValue}>{formatDate(range.endDate)}</span>
          </div>
          <div style={styles.resultItem}>
            <span style={styles.resultLabel}>Дней</span>
            <span style={styles.resultValue}>
              {diffDays} {pluralDays(diffDays)}
            </span>
          </div>
          <button style={styles.clearBtn} onClick={clearRange}>
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BASE_DAY: React.CSSProperties = {
  height: 36,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  cursor: "pointer",
  borderRadius: 4,
  position: "relative",
  userSelect: "none",
  transition: "background 0.1s, color 0.1s",
  color: "#111",
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    maxWidth: 640,
    padding: "1.5rem",
    background: "#fff",
    border: "0.5px solid #e0e0e0",
    borderRadius: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
  },
  monthLabels: {
    display: "flex",
    gap: "4rem",
    flex: 1,
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
    minWidth: 140,
    textAlign: "center",
  },
  navBtn: {
    background: "none",
    border: "0.5px solid #ccc",
    borderRadius: 6,
    width: 32,
    height: 32,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "30px",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  grids: {
    display: "grid",
    gridTemplateColumns: "1fr 1px 1fr",
    gap: "0 24px",
  },
  divider: {
    background: "#e8e8e8",
    width: 1,
  },
  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 4,
  },
  weekday: {
    textAlign: "center",
    fontSize: 11,
    color: "#888",
    padding: "6px 0",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
  },
  day: {
    ...BASE_DAY,
  },
  dayEmpty: {
    ...BASE_DAY,
    cursor: "default",
    color: "#ccc",
  },
  dayDisabled: {
    color: "#ccc",
    cursor: "not-allowed",
  },
  dayInRange: {
    background: "#111",
    color: "#fff",
    borderRadius: 0,
  },
  dayStart: {
    background: "#111",
    color: "#fff",
    borderRadius: "4px 0 0 4px",
  },
  dayEnd: {
    background: "#111",
    color: "#fff",
    borderRadius: "0 4px 4px 0",
  },
  dayStartEnd: {
    background: "#111",
    color: "#fff",
    borderRadius: 4,
  },
  todayDot: {
    position: "absolute",
    bottom: 3,
    left: "50%",
    transform: "translateX(-50%)",
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "#888",
  },
  hint: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 12,
  },
  resultBar: {
    marginTop: "1rem",
    padding: "0.875rem 1.25rem",
    border: "0.5px solid #e0e0e0",
    borderRadius: 10,
    background: "#f7f7f7",
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
    justifyContent: "space-between",
  },
  resultItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  resultLabel: {
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
  },
  arrow: {
    fontSize: 18,
    color: "#ccc",
  },
  clearBtn: {
    background: "none",
    border: "0.5px solid #ccc",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 13,
    color: "#444",
    cursor: "pointer",
  },
};
