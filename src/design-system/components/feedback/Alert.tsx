import { useEffect } from "react";
import styled from "@emotion/styled";
import { css, Theme } from "@emotion/react";
import { forwardRef } from "react";

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

const getStatusColors = (theme: Theme, status: AlertStatus) => {
  const { colors } = theme;
  switch (status) {
    case "success":
      return {
        background: colors.successContainer,
        borderColor: colors.success,
        textColor: colors.onSuccessContainer,
      };
    case "warning":
      return {
        background: colors.warningContainer,
        borderColor: colors.warning,
        textColor: colors.onWarningContainer,
      };
    case "error":
      return {
        background: colors.errorContainer,
        borderColor: colors.error,
        textColor: colors.onErrorContainer,
      };
    case "info":
    default:
      return {
        background: colors.secondaryContainer,
        borderColor: colors.secondary,
        textColor: colors.onSecondaryContainer,
      };
  }
};

const AlertRoot = styled("div")<{
  variant: AlertVariant;
  layout: AlertBannerLayout;
  status: AlertStatus;
}>(({ theme, variant, layout, status }) => {
  const { spacing, borderRadius, elevation } = theme;
  const statusColors = getStatusColors(theme, status);

  const common = {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: spacing(2),
    padding: `${spacing(2)} ${spacing(2.5)}`,
    borderRadius: borderRadius.lg,
    border: `1px solid ${statusColors.borderColor}`,
    backgroundColor: statusColors.background,
    color: statusColors.textColor,
    alignItems: "center",
  };

  if (variant === "toast") {
    return [
      common,
      css({
        boxShadow: elevation.level2,
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
  fontSize: theme.typography.titleLarge.fontSize,
}));

const ContentWrapper = styled("div")({
  display: "grid",
  gap: "4px",
});

const Title = styled("p")(({ theme }) => ({
  ...theme.typography.titleMedium,
  margin: 0,
}));

const Description = styled("p")(({ theme }) => ({
  ...theme.typography.bodyMedium,
  margin: 0,
}));

const DismissButton = styled("button")(({ theme }) => ({
  border: "none",
  background: "transparent",
  color: theme.colors.onSurfaceVariant,
  cursor: "pointer",
  fontSize: theme.typography.bodyLarge.fontSize,
  padding: theme.spacing(1),
  borderRadius: theme.borderRadius.full,
  "&:hover": {
    backgroundColor: `color-mix(in srgb, ${theme.colors.onSurface} 8%, transparent)`,
  }
}));

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
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
    },
    ref
  ) => {
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
        ref={ref}
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
);

Alert.displayName = "Alert";