import { TextV2 } from "./text";

export const TextPointer: React.FC<{
  rightText: string;
  leftText: string;
}> = ({ rightText, leftText }) => {
  return (
    <div style={{ display: "flex" }}>
      <TextV2 text={`${rightText}:`} />
      <div style={{ width: 5 }} />
      <TextV2 text={leftText} />
    </div>
  );
};
