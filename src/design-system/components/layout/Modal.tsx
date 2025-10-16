import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg";
type DrawerSize = "sm" | "md" | "lg" | "full";
type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  hideCloseButton?: boolean;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  size?: DrawerSize;
  position?: DrawerPosition;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
}

const Overlay = styled("div")(({ theme }) => ({
  position: "fixed",
  inset: 0,
  zIndex: theme.tokens.token.zIndex.overlay,
  backgroundColor:
    theme.tokens.token.color.background.overlay.default[theme.mode],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContainer = styled("div")<{
  size: ModalSize;
}>(({ theme, size }) => {
  const sizeMap: Record<ModalSize, string> = {
    sm: "420px",
    md: "640px",
    lg: "840px",
  };

  return {
    width: "90%",
    maxWidth: sizeMap[size],
    maxHeight: "90vh",
    backgroundColor:
      theme.tokens.token.color.background.primary.default[theme.mode],
    borderRadius: theme.tokens.token.borderRadius.lg,
    boxShadow: theme.tokens.token.shadow.overlay.raised[theme.mode],
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    overflow: "hidden",
  };
});

const DrawerContainer = styled("div")<{
  size: DrawerSize;
  position: DrawerPosition;
}>(({ theme, size, position }) => {
  const sizeMap: Record<DrawerSize, string> = {
    sm: "320px",
    md: "480px",
    lg: "640px",
    full: "100%",
  };

  const base = {
    position: "fixed" as const,
    backgroundColor:
      theme.tokens.token.color.background.primary.default[theme.mode],
    boxShadow: theme.tokens.token.shadow.overlay.raised[theme.mode],
    zIndex: theme.tokens.token.zIndex.modal,
    display: "flex",
    flexDirection: "column" as const,
  };

  const dimension = sizeMap[size];

  switch (position) {
    case "left":
      return {
        ...base,
        top: 0,
        bottom: 0,
        left: 0,
        width: dimension,
      };
    case "right":
      return {
        ...base,
        top: 0,
        bottom: 0,
        right: 0,
        width: dimension,
      };
    case "top":
      return {
        ...base,
        top: 0,
        left: 0,
        right: 0,
        height: dimension,
      };
    case "bottom":
    default:
      return {
        ...base,
        bottom: 0,
        left: 0,
        right: 0,
        height: dimension,
      };
  }
});

const Header = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${theme.tokens.token.spacing.md} ${theme.tokens.token.spacing.lg}`,
  gap: theme.tokens.token.spacing.sm,
}));

const Body = styled("div")(({ theme }) => ({
  padding: `0 ${theme.tokens.token.spacing.lg}`,
  overflowY: "auto",
  color: theme.tokens.token.color.text.primary.default[theme.mode],
}));

const Footer = styled("footer")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.tokens.token.spacing.sm,
  padding: `${theme.tokens.token.spacing.md} ${theme.tokens.token.spacing.lg}`,
}));

const CloseButton = styled("button")(({ theme }) => ({
  border: "none",
  background: "transparent",
  color: theme.tokens.token.color.text.primary.default[theme.mode],
  cursor: "pointer",
  fontSize: theme.tokens.token.font.size.md,
}));

function useModalLifecycle(
  isOpen: boolean,
  onClose: () => void,
  options: {
    initialFocusRef?: React.RefObject<HTMLElement>;
    finalFocusRef?: React.RefObject<HTMLElement>;
    closeOnEsc?: boolean;
  },
) {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;

    const focusTarget =
      options.initialFocusRef?.current ??
      (document.querySelector("[data-modal-root] header button") as HTMLElement);

    requestAnimationFrame(() => {
      focusTarget?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && options.closeOnEsc !== false) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => {
        options.finalFocusRef?.current?.focus();
        previouslyFocusedElement.current?.focus();
      });
    };
  }, [isOpen, onClose, options.initialFocusRef, options.finalFocusRef, options.closeOnEsc]);
}

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  hideCloseButton = false,
  children,
  initialFocusRef,
  finalFocusRef,
  closeOnEsc = true,
  closeOnOverlayClick = true,
}: ModalProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  useModalLifecycle(isOpen, onClose, {
    initialFocusRef,
    finalFocusRef,
    closeOnEsc,
  });

  if (!isOpen) {
    return null;
  }

  const content = (
    <Overlay
      role="presentation"
      onMouseDown={(event) => {
        if (
          closeOnOverlayClick &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <ModalContainer
        ref={containerRef}
        size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        data-modal-root
      >
        <Header>
          {title && (
            <h2 id="modal-title" style={{ margin: 0 }}>
              {title}
            </h2>
          )}
          {!hideCloseButton && (
            <CloseButton
              type="button"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </CloseButton>
          )}
        </Header>
        <Body>{children}</Body>
        <Footer />
      </ModalContainer>
    </Overlay>
  );

  return mountToPortal(content);
}

export function Drawer({
  isOpen,
  onClose,
  size = "md",
  position = "right",
  children,
  initialFocusRef,
  finalFocusRef,
  closeOnEsc = true,
  closeOnOverlayClick = true,
}: DrawerProps): JSX.Element | null {
  useModalLifecycle(isOpen, onClose, {
    initialFocusRef,
    finalFocusRef,
    closeOnEsc,
  });

  if (!isOpen) {
    return null;
  }

  const content = (
    <Overlay
      role="presentation"
      onMouseDown={(event) => {
        if (
          closeOnOverlayClick &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <DrawerContainer
        size={size}
        position={position}
        role="dialog"
        aria-modal="true"
        data-modal-root
      >
        {children}
      </DrawerContainer>
    </Overlay>
  );

  return mountToPortal(content);
}

function mountToPortal(node: React.ReactNode): JSX.Element {
  if (typeof document === "undefined") {
    return <>{node}</>;
  }

  let portalRoot = document.getElementById("modal-root");
  if (!portalRoot) {
    portalRoot = document.createElement("div");
    portalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(portalRoot);
  }

  return createPortal(node, portalRoot);
}

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

Drawer.Header = Header;
Drawer.Body = Body;
Drawer.Footer = Footer;
