import { useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

type AlertVariant = "toast" | "banner";
type AlertBannerLayout = "page" | "inline";
type AlertStatus = "success" | "warning" | "error" | "info";

export interface AlertProps {
  variant?: AlertVariant;
  layout?: AlertBannerLayout;
  status?: AlertStatus;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isDismissible?: boolean;
  duration?: number;
  onDismiss?: () => void;
  roleOverride?: "status" | "alert";
}

const statusIconFallback: Record<AlertStatus, string> = {
  success: "✔",
  warning: "!",
  error: "✖",
  info: "ℹ",
};

const AlertRoot = styled("div")<{
  variant: AlertVariant;
  layout: AlertBannerLayout;
  status: AlertStatus;
}>(({ theme, variant, layout, status }) => {
  const { tokens } = theme;
  const background =
    tokens.token.color.status[status][theme.mode] + "20"; // add alpha
  const borderColor = tokens.token.color.status[status][theme.mode];

  const common = {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: tokens.token.spacing.sm,
    padding: `${tokens.token.spacing.sm} ${tokens.token.spacing.md}`,
    borderRadius: tokens.token.borderRadius.md,
    border: `1px solid ${borderColor}`,
    backgroundColor: background,
    color: tokens.token.color.text.primary.default[theme.mode],
    alignItems: "center",
  };

  if (variant === "toast") {
    return [
      common,
      css({
        boxShadow: tokens.token.shadow.overlay.raised[theme.mode],
        minWidth: "320px",
      }),
    ];
  }

  return [
    common,
    layout === "page" &&
      css({
        width: "100%",
      }),
  ];
});

const IconWrapper = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: theme.tokens.token.font.size.lg,
}));

const ContentWrapper = styled("div")({
  display: "grid",
  gap: "4px",
});

const Title = styled("p")(({ theme }) => ({
  fontWeight: theme.tokens.token.font.weight.semibold,
  margin: 0,
}));

const Description = styled("p")(({ theme }) => ({
  margin: 0,
  fontSize: theme.tokens.token.font.size.sm,
}));

const DismissButton = styled("button")(({ theme }) => ({
  border: "none",
  background: "transparent",
  color: theme.tokens.token.color.text.primary.default[theme.mode],
  cursor: "pointer",
  fontSize: theme.tokens.token.font.size.sm,
}));

export function Alert({
  variant = "banner",
  layout = "page",
  status = "info",
  title,
  children,
  icon,
  isDismissible = false,
  duration,
  onDismiss,
  roleOverride,
}: AlertProps): JSX.Element {
  useEffect(() => {
    if (variant !== "toast" || !duration || duration === Infinity) {
      return;
    }
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, variant]);

  const role =
    roleOverride ??
    (status === "error" || status === "warning" ? "alert" : "status");

  return (
    <AlertRoot
      variant={variant}
      layout={layout}
      status={status}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
    >
      <IconWrapper aria-hidden>
        {icon ?? statusIconFallback[status]}
      </IconWrapper>
      <ContentWrapper>
        {title && <Title>{title}</Title>}
        {children && <Description>{children}</Description>}
      </ContentWrapper>
      {isDismissible && (
        <DismissButton
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          ×
        </DismissButton>
      )}
    </AlertRoot>
  );
}
