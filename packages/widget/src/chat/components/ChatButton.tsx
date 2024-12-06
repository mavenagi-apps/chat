import { HelpIcon } from "./icons/HelpIcon";
import { CloseIcon } from "./icons/CloseIcon";

interface ChatButtonProps {
  bgColor: string;
  textColor: string;
  horizontalPosition: "left" | "right";
  verticalPosition: "top" | "bottom";
  isOpen: boolean;
  onClick: () => void;
}

export function ChatButton({
  bgColor,
  textColor,
  horizontalPosition,
  verticalPosition,
  isOpen,
  onClick,
}: ChatButtonProps) {
  const buttonStyle = {
    zIndex: 1000,
    paddingLeft: "0.75rem",
    paddingRight: "0.75rem",
    height: "3rem",
    width: "fit-content",
    position: "fixed",
    left: horizontalPosition === "left" ? "1rem" : "auto",
    right: horizontalPosition === "right" ? "1rem" : "auto",
    top: verticalPosition === "top" ? "1rem" : "auto",
    bottom: verticalPosition === "bottom" ? "1rem" : "auto",
    borderRadius: "9999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 10px 0px",
    backgroundColor: bgColor,
    color: textColor,
    "-webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "-khtml-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    userSelect: "none",
  } as React.CSSProperties;

  return (
    <div style={buttonStyle} onClick={onClick}>
      {!isOpen ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <HelpIcon />
          <span style={{ marginLeft: "0.5rem", marginRight: "0.25rem" }}>
            Get Help
          </span>
        </div>
      ) : (
        <div style={{ display: "flex" }}>
          <CloseIcon />
        </div>
      )}
    </div>
  );
}
