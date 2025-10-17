import styled from "@emotion/styled";
import { css, Theme } from "@emotion/react";
import { createContext, useContext, forwardRef } from "react";

type CardVariant = "default" | "kpi" | "step-result";
type CardStatus = "default" | "pass" | "review" | "fail" | "loading";

interface CardContextValue {
  variant: CardVariant;
}

const CardContext = createContext<CardContextValue>({ variant: "default" });

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  status?: CardStatus;
  isHoverable?: boolean;
  children: React.ReactNode;
}

const getStatusBorderColor = (theme: Theme, status: CardStatus) => {
  const { colors } = theme;
  switch (status) {
    case "pass":
      return colors.success;
    case "review":
      return colors.warning;
    case "fail":
      return colors.error;
    default:
      return colors.outlineVariant;
  }
};

const BaseCard = styled("article")<{
  variant: CardVariant;
  status: CardStatus;
  isHoverable: boolean;
}>(({ theme, variant, status, isHoverable }) => {
  const { colors, spacing, borderRadius, elevation, transitions } = theme;

  const background = colors.surface;
  const borderColor = getStatusBorderColor(theme, status);

  const variantStyles: Record<CardVariant, ReturnType<typeof css>> = {
    default: css({
      backgroundColor: background,
      border: `1px solid ${borderColor}`,
      boxShadow: elevation.level1,
    }),
    kpi: css({
      backgroundColor: colors.surfaceContainer,
      border: "none",
      color: colors.onSurface,
    }),
    "step-result": css({
      backgroundColor: background,
      border: `1px solid ${borderColor}`,
      boxShadow: elevation.level1,
    }),
  };

  return [
    {
      display: "flex",
      flexDirection: "column",
      gap: spacing(2),
      padding: spacing(3),
      borderRadius: borderRadius.lg,
      transition: `box-shadow ${transitions.duration.short} ${transitions.easing.easeInOut}`,
    },
    variantStyles[variant],
    isHoverable &&
      css({
        "&:hover": {
          boxShadow: elevation.level2,
        },
      }),
  ];
});

const SectionBase = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      variant = "default",
      status = "default",
      isHoverable = false,
      children,
      ...rest
    },
    ref
  ) => (
    <CardContext.Provider value={{ variant }}>
      <BaseCard
        ref={ref}
        variant={variant}
        status={status}
        isHoverable={isHoverable}
        {...rest}
      >
        {children}
      </BaseCard>
    </CardContext.Provider>
  )
);

Card.displayName = "Card";

export const CardHeader = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  ...theme.typography.titleMedium,
  color: theme.colors.onSurface,
}));

export const CardBody = styled(SectionBase)(({ theme }) => ({
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurfaceVariant,
}));

export const CardFooter = styled("footer")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

export const CardSection = SectionBase;

export const CardActions = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing(1),
}));

export const useCardVariant = () => useContext(CardContext).variant;