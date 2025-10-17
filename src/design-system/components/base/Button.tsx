import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon-only";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const pulse = keyframes({
  "0%": { opacity: 0.3 },
  "50%": { opacity: 0.6 },
  "100%": { opacity: 0.3 },
});

const sizeMap: Record<ButtonSize, { padding: string; fontSize: string }> = {
  sm: { padding: "0 12px", fontSize: "14px" },
  md: { padding: "0 16px", fontSize: "15px" },
  lg: { padding: "0 20px", fontSize: "16px" },
};

const BaseButton = styled("button")<{
  variant: ButtonVariant;
  size: ButtonSize;
  isLoading: boolean;
}>(({ theme, variant, size, isLoading }) => {
  // NEW M3 THEME STRUCTURE
  const { colors, spacing, borderRadius, typography, transitions, elevation } = theme;

  const sizeStyles = {
    sm: {
      ...typography.labelLarge,
      height: '32px',
      padding: `0 ${spacing(2)}`, // 16px
    },
    md: {
      ...typography.labelLarge,
      height: '40px',
      padding: `0 ${spacing(3)}`, // 24px
    },
    lg: {
      ...typography.titleMedium,
      height: '48px',
      padding: `0 ${spacing(4)}`, // 32px
    },
  };

  const baseStyles = {
    ...sizeStyles[size],
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1), // 8px
    borderRadius: borderRadius.full, // Pill shape
    fontWeight: typography.labelLarge.fontWeight, // from theme
    border: "1px solid transparent",
    cursor: isLoading ? "wait" : "pointer",
    transition: `background-color ${transitions.duration.short} ${transitions.easing.easeInOut}, color ${transitions.duration.short} ${transitions.easing.easeInOut}, box-shadow ${transitions.duration.short} ${transitions.easing.easeInOut}`,
    textDecoration: "none",
    userSelect: "none" as const,
    position: "relative" as const,
    "&:disabled": {
      backgroundColor: `color-mix(in srgb, ${colors.onSurface} 12%, transparent)`,
      color: `color-mix(in srgb, ${colors.onSurface} 38%, transparent)`,
      borderColor: 'transparent',
      cursor: "not-allowed",
    },
  };

  const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
    "icon-only": css({
      padding: spacing(1.5), // 12px
      width: sizeStyles[size].height,
      minWidth: sizeStyles[size].height,
    }),
    primary: css({
      backgroundColor: colors.primary,
      color: colors.onPrimary,
      "&:hover:not(:disabled)": {
        boxShadow: elevation.level1,
        backgroundColor: `color-mix(in srgb, ${colors.primary} 92%, black)`,
      },
    }),
    secondary: css({
      backgroundColor: "transparent",
      color: colors.primary,
      borderColor: colors.outline,
      "&:hover:not(:disabled)": {
        backgroundColor: `color-mix(in srgb, ${colors.primary} 8%, transparent)`,
      },
    }),
    ghost: css({
      backgroundColor: "transparent",
      color: colors.primary,
      "&:hover:not(:disabled)": {
        backgroundColor: `color-mix(in srgb, ${colors.primary} 8%, transparent)`,
      },
    }),
  };

  return [
    baseStyles,
    variantStyles[variant],
    isLoading &&
      css({
        animation: `${pulse} 1.2s ease-in-out infinite`,
        pointerEvents: "none",
      }),
  ];
});

const IconWrapper = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

function heightBySize(size: ButtonSize): string {
  switch (size) {
    case "sm":
      return "32px";
    case "md":
      return "36px";
    case "lg":
    default:
      return "44px";
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      iconLeft,
      iconRight,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => (
    <BaseButton
      ref={ref}
      variant={variant}
      size={size}
      isLoading={isLoading}
      disabled={disabled || isLoading}
      {...rest}
    >
      {iconLeft && <IconWrapper aria-hidden>{iconLeft}</IconWrapper>}
      {children && <span>{children}</span>}
      {iconRight && <IconWrapper aria-hidden>{iconRight}</IconWrapper>}
    </BaseButton>
  ),
);

Button.displayName = "Button";
