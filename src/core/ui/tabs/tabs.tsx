import { useState } from "react";

export const Tabs: React.FC<{
  tabs: { name: string; jsx: React.ReactNode; width?: number }[];
  // скрыть плашку с названиями вкладок (активная вкладка остаётся видна)
  hideHeader?: boolean;
}> = ({ tabs, hideHeader }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: hideHeader ? "none" : "flex",
          gap: 6,
          background: "var(--bg-f0f2f5)",
          padding: 4,
          borderRadius: 8,
          marginBottom: 28,
          overflowX: "auto",
          width: "min-content",
        }}
      >
        {tabs.map((el, i) => (
          // <Button
          //   width={el.width ?? 140}
          //   text={el.name}
          //   style={{
          //     backgroundColor:
          //       i === activeIndex ? "rgb(60, 80, 224)" : "rgb(137 137 137)",
          //   }}
          // />
          <div
            onClick={() => setActiveIndex(i)}
            key={i}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              color: i === activeIndex ? "var(--tx-4f46e5)" : "var(--tx-718096)",
              cursor: "pointer",
              border: "none",

              backgroundColor: i === activeIndex ? "var(--bg-ffffff)" : "transparent",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {el.name}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: "100%" }}>{tabs.at(activeIndex)?.jsx}</div>
      </div>
    </div>
  );
};
