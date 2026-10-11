export const SelectV2: React.FC<{
  currentValue?: string;
  onChange?: (text: string) => void;
  options: string[];
  noSelectedText?: string;
  label?: string;
  style?: React.CSSProperties;
}> = ({
  currentValue: value,
  onChange,
  options,
  noSelectedText,
  label,
  style,
}) => {
  return (
    <div style={style}>
      <label
        style={Object.assign({
          fontSize: "12px",
          fontWeight: 600,
          color: "#4a5568",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: "6px",
          display: "block",
        })}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: "15px",

          height: 46,
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          backgroundColor: "#ffffff",
          color: "#1a202c",

          outline: "none",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <option value="" disabled hidden>
          {noSelectedText}
        </option>
        {options.map((el) => {
          return <option value={el}>{el}</option>;
        })}
      </select>
    </div>
  );
};
