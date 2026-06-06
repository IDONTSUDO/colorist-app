import { useState } from "react";
import { Button } from "../button/Button";

export const Tabs: React.FC<{
  tabs: { name: string; jsx: React.ReactNode; width?: number }[];
}> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div style={{width:'100%'}}>
      <div style={{ display: "flex" }}>
        {tabs.map((el, i) => (
          <Button
            width={el.width ?? 140}
            text={el.name}
            onClick={() => setActiveIndex(i)}
            key={i}
            style={{
              backgroundColor:
                i === activeIndex ? "rgb(60, 80, 224)" : "rgb(137 137 137)",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{width:'100%'}}>{tabs.at(activeIndex)?.jsx}</div>
      </div>
    </div>
  );
};
