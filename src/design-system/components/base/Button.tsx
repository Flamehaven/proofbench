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
  const { tokens } = theme;
  const spacing = tokens.token.spacing;
  const fontSizes = tokens.token.font.size;

  const paddings = sizeMap[size];

  const baseStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: tokens.token.borderRadius.md,
    fontWeight: tokens.token.font.weight.medium,
    fontSize: fontSizes[size === "sm" ? "sm" : size === "md" ? "md" : "lg"],
    lineHeight: 1.2,
    padding:
      variant === "icon-only"
        ? `${spacing.xs}`
        : `${spacing.xs} ${paddings.padding.split(" ")[1]}`,
    height: size === "sm" ? "32px" : size === "md" ? "36px" : "44px",
    minWidth: variant === "icon-only" ? heightBySize(size) : "auto",
    cursor: isLoading ? "wait" : "pointer",
    transition: `background-color ${tokens.token.motion.duration.fast} ${tokens.token.motion.easing.standard},
      color ${tokens.token.motion.duration.fast} ${tokens.token.motion.easing.standard},
      box-shadow ${tokens.token.motion.duration.fast} ${tokens.token.motion.easing.standard}`,
    border: "1px solid transparent",
    textDecoration: "none",
    userSelect: "none" as const,
    position: "relative" as const,
  };

  const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
    "icon-only": css({
      padding: spacing.xs,
      width: heightBySize(size),
    }),
    primary: css({
      backgroundColor:
        tokens.token.color.background.interactive.default[theme.mode],
      color: tokens.token.color.background.primary.default.light,
      "&:hover": {
        backgroundColor:
          tokens.token.color.background.interactive.hover[theme.mode],
      },
      "&:disabled": {
        backgroundColor: tokens.token.color.background.interactive.default.light,
        opacity: tokens.token.opacity.disabled,
        cursor: "not-allowed",
      },
    }),
    secondary: css({
      backgroundColor: "transparent",
      color: tokens.token.color.background.interactive.default[theme.mode],
      borderColor: tokens.token.color.background.interactive.default[theme.mode],
      "&:hover": {
        backgroundColor: tokens.token.color.background.primary.subtle[theme.mode],
      },
      "&:disabled": {
        borderColor: tokens.token.color.text.primary.muted[theme.mode],
        color: tokens.token.color.text.primary.muted[theme.mode],
        cursor: "not-allowed",
      },
    }),
    ghost: css({
      backgroundColor: "transparent",
      color: tokens.token.color.text.primary.default[theme.mode],
      "&:hover": {
        backgroundColor: tokens.token.color.background.primary.subtle[theme.mode],
      },
      "&:disabled": {
        color: tokens.token.color.text.primary.muted[theme.mode],
        cursor: "not-allowed",
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
