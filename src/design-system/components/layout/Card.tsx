import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { createContext, useContext } from "react";

type CardVariant = "default" | "kpi" | "step-result";
type CardStatus = "default" | "pass" | "review" | "fail" | "loading";

interface CardContextValue {
  variant: CardVariant;
}

const CardContext = createContext<CardContextValue>({ variant: "default" });

export interface CardProps {
  variant?: CardVariant;
  status?: CardStatus;
  isHoverable?: boolean;
  children: React.ReactNode;
}

const BaseCard = styled("article")<{
  variant: CardVariant;
  status: CardStatus;
  isHoverable: boolean;
}>(({ theme, variant, status, isHoverable }) => {
  const { tokens } = theme;

  const background =
    tokens.token.color.background.primary.default[theme.mode];
  const borderColor =
    variant === "step-result" && status !== "default"
      ? tokens.token.color.status[
          status === "pass"
            ? "success"
            : status === "review"
              ? "warning"
              : status === "fail"
                ? "error"
                : "info"
        ][theme.mode]
      : tokens.token.color.background.primary.subtle[theme.mode];

  const variantStyles: Record<CardVariant, ReturnType<typeof css>> = {
    default: css({
      padding: tokens.token.spacing.lg,
      backgroundColor: background,
      border: `1px solid ${borderColor}`,
      borderRadius: tokens.token.borderRadius.lg,
      boxShadow: tokens.token.shadow.card.default[theme.mode],
    }),
    kpi: css({
      padding: tokens.token.spacing.lg,
      backgroundColor: tokens.token.color.background.primary.subtle[theme.mode],
      borderRadius: tokens.token.borderRadius.lg,
      border: "none",
      color: tokens.token.color.text.primary.default[theme.mode],
    }),
    "step-result": css({
      padding: tokens.token.spacing.lg,
      backgroundColor: background,
      borderRadius: tokens.token.borderRadius.lg,
      border: `1px solid ${borderColor}`,
      boxShadow: tokens.token.shadow.card.default[theme.mode],
    }),
  };

  return [
    {
      display: "flex",
      flexDirection: "column",
      gap: tokens.token.spacing.md,
      transition: `box-shadow ${tokens.token.motion.duration.fast} ${tokens.token.motion.easing.standard}`,
    },
    variantStyles[variant],
    isHoverable &&
      css({
        "&:hover": {
          boxShadow: tokens.token.shadow.card.interactive.hover[theme.mode],
        },
      }),
  ];
});

const SectionBase = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.tokens.token.spacing.sm,
}));

const ActionsBase = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.tokens.token.spacing.sm,
}));

export const Card = ({
  variant = "default",
  status = "default",
  isHoverable = false,
  children,
}: CardProps): JSX.Element => (
  <CardContext.Provider value={{ variant }}>
    <BaseCard variant={variant} status={status} isHoverable={isHoverable}>
      {children}
    </BaseCard>
  </CardContext.Provider>
);

export const CardHeader = styled("header")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.tokens.token.spacing.sm,
  fontSize: theme.tokens.token.font.size.md,
  fontWeight: theme.tokens.token.font.weight.semibold,
}));

export const CardBody = styled(SectionBase)(({ theme }) => ({
  fontSize: theme.tokens.token.font.size.sm,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
}));

export const CardFooter = styled("footer")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.tokens.token.spacing.sm,
}));

export const CardSection = SectionBase;

export const CardActions = ActionsBase;

export const useCardVariant = () => useContext(CardContext).variant;
