import { useEffect, useRef, forwardRef } from "react";
import styled from "@emotion/styled";
import { createPortal } from "react-dom";
import { css, Theme } from "@emotion/react";

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
  zIndex: 1000, // M3 uses defined z-index tokens, using a common value here.
  backgroundColor: `color-mix(in srgb, ${theme.colors.scrim} 40%, transparent)`,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.elevation.level3,
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
    backgroundColor: theme.colors.surface,
    boxShadow: theme.elevation.level3,
    zIndex: 1100,
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
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.colors.outlineVariant}`,
}));

const Body = styled("div")(({ theme }) => ({
  padding: theme.spacing(3),
  overflowY: "auto",
  color: theme.colors.onSurface,
}));

const Footer = styled("footer")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  borderTop: `1px solid ${theme.colors.outlineVariant}`,
}));

const CloseButton = styled("button")(({ theme }) => ({
  border: "none",
  background: "transparent",
  color: theme.colors.onSurfaceVariant,
  cursor: "pointer",
  ...theme.typography.titleLarge,
  padding: theme.spacing(1),
  borderRadius: theme.borderRadius.full,
  "&:hover": {
    backgroundColor: `color-mix(in srgb, ${theme.colors.onSurface} 8%, transparent)`,
  }
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
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
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useModalLifecycle(isOpen, onClose, {
      initialFocusRef: initialFocusRef ?? containerRef,
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
          ref={ref ?? containerRef}
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
        </ModalContainer>
      </Overlay>
    );

    return mountToPortal(content);
  }
);

Modal.displayName = "Modal";

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      isOpen,
      onClose,
      size = "md",
      position = "right",
      children,
      initialFocusRef,
      finalFocusRef,
      closeOnEsc = true,
      closeOnOverlayClick = true,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useModalLifecycle(isOpen, onClose, {
      initialFocusRef: initialFocusRef ?? containerRef,
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
          ref={ref ?? containerRef}
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
);

Drawer.displayName = "Drawer";

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