import React from "react";

export const ModalV2: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ isOpen, onClose, children, style }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#10101087",
        //  themeStore.theme.fon,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => onClose()}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={Object.assign(
          {
            backgroundColor: "white",
            border: `1px solid white`,
            padding: 20,
            borderRadius: 5,
            // width: 400,
            position: "relative",
            maxHeight: 600,
            overflow: "auto",
          },
          style,
        )}
      >
        {children}
      </div>
    </div>
  );
};
