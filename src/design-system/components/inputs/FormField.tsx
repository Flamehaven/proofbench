import styled from "@emotion/styled";
import { css } from "@emotion/react";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";

type FieldStatus = "default" | "error" | "success" | "loading";
type FieldDensity = "default" | "compact";

interface FormFieldContextValue {
  fieldId: string;
  status: FieldStatus;
  describedBy: string[];
  isRequired: boolean;
  density: FieldDensity;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export interface FormFieldProps {
  label: string;
  id?: string;
  helpText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  isRequired?: boolean;
  status?: FieldStatus;
  density?: FieldDensity;
  children: React.ReactNode;
}

const Wrapper = styled("label")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.xs,
  fontSize: theme.tokens.token.font.size.sm,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
}));

const LabelRow = styled("span")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.tokens.token.spacing.xs,
  fontWeight: theme.tokens.token.font.weight.medium,
}));

const RequiredAsterisk = styled("span")(({ theme }) => ({
  color: theme.tokens.token.color.status.error[theme.mode],
}));

const HelperText = styled("span")(({ theme }) => ({
  color: theme.tokens.token.color.text.primary.subtle[theme.mode],
}));

const ErrorText = styled("span")(({ theme }) => ({
  color: theme.tokens.token.color.status.error[theme.mode],
  fontWeight: theme.tokens.token.font.weight.medium,
}));

const Shell = styled("div")<{
  status: FieldStatus;
  density: FieldDensity;
}>(({ theme, status, density }) => {
  const { tokens } = theme;
  const borderColor =
    status === "error"
      ? tokens.token.color.status.error[theme.mode]
      : status === "success"
        ? tokens.token.color.status.success[theme.mode]
        : tokens.token.color.text.primary.subtle[theme.mode];

  const base = {
    display: "flex",
    alignItems: "center",
    gap: tokens.token.spacing.xs,
    borderRadius: tokens.token.borderRadius.md,
    border: `1px solid ${borderColor}`,
    padding: density === "compact" ? "6px 10px" : "8px 12px",
    background: tokens.token.color.background.primary.default[theme.mode],
    transition: `border-color ${tokens.token.motion.duration.fast} ${tokens.token.motion.easing.standard}`,
  };

  return [
    base,
    css({
      "&:focus-within": {
        borderColor: tokens.token.color.status.info[theme.mode],
        boxShadow: `0 0 0 3px ${tokens.token.color.status.info[theme.mode]}22`,
      },
      "&:has(input:disabled), &:has(textarea:disabled), &:has(select:disabled)": {
        opacity: tokens.token.opacity.disabled,
        cursor: "not-allowed",
      },
    }),
  ];
});

const InputElement = styled("input")(({ theme }) => ({
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: theme.tokens.token.font.size.md,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
  "::placeholder": {
    color: theme.tokens.token.color.text.primary.subtle[theme.mode],
  },
}));

const TextAreaElement = styled("textarea")(({ theme }) => ({
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: theme.tokens.token.font.size.md,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
  resize: "vertical",
}));

const SelectElement = styled("select")(({ theme }) => ({
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: theme.tokens.token.font.size.md,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
}));

const Affix = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  color: theme.tokens.token.color.text.primary.subtle[theme.mode],
}));

export function FormField({
  label,
  id,
  helpText,
  errorMessage,
  isRequired = false,
  status = "default",
  density = "default",
  children,
}: FormFieldProps): JSX.Element {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;

  const helpId = helpText ? `${fieldId}-help` : undefined;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  const describedBy = useMemo(
    () =>
      [helpId, errorId].filter(
        (value): value is string => Boolean(value),
      ),
    [helpId, errorId],
  );

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      fieldId,
      status,
      describedBy,
      isRequired,
      density,
    }),
    [fieldId, status, describedBy, isRequired, density],
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <Wrapper htmlFor={fieldId}>
        <LabelRow>
          <span>{label}</span>
          {isRequired && <RequiredAsterisk aria-hidden>*</RequiredAsterisk>}
        </LabelRow>
        {children}
        {helpText && <HelperText id={helpId}>{helpText}</HelperText>}
        {errorMessage && status === "error" && (
          <ErrorText id={errorId}>{errorMessage}</ErrorText>
        )}
      </Wrapper>
    </FormFieldContext.Provider>
  );
}

export interface FieldInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const InputWrapper = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ prefix, suffix, disabled, readOnly, ...rest }, ref) => {
    const context = useFormFieldContext();
    const describedBy = buildDescribedBy(rest["aria-describedby"], context);

    return (
      <Shell status={context.status} density={context.density}>
        {prefix && <Affix>{prefix}</Affix>}
        <InputElement
          ref={ref}
          id={context.fieldId}
          aria-describedby={describedBy}
          aria-required={context.isRequired || undefined}
          aria-invalid={context.status === "error" || undefined}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
        {suffix && <Affix>{suffix}</Affix>}
      </Shell>
    );
  },
);

InputWrapper.displayName = "FormField.Input";

export interface FieldTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextAreaWrapper = forwardRef<HTMLTextAreaElement, FieldTextAreaProps>(
  ({ disabled, readOnly, ...rest }, ref) => {
    const context = useFormFieldContext();
    const describedBy = buildDescribedBy(rest["aria-describedby"], context);

    return (
      <Shell status={context.status} density={context.density}>
        <TextAreaElement
          ref={ref}
          id={context.fieldId}
          aria-describedby={describedBy}
          aria-required={context.isRequired || undefined}
          aria-invalid={context.status === "error" || undefined}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
      </Shell>
    );
  },
);

TextAreaWrapper.displayName = "FormField.TextArea";

export interface FieldSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const SelectWrapper = forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ disabled, ...rest }, ref) => {
    const context = useFormFieldContext();
    const describedBy = buildDescribedBy(rest["aria-describedby"], context);

    return (
      <Shell status={context.status} density={context.density}>
        <SelectElement
          ref={ref}
          id={context.fieldId}
          aria-describedby={describedBy}
          aria-required={context.isRequired || undefined}
          aria-invalid={context.status === "error" || undefined}
          disabled={disabled}
          {...rest}
        />
      </Shell>
    );
  },
);

SelectWrapper.displayName = "FormField.Select";

export const FormFieldInput = InputWrapper;
export const FormFieldTextArea = TextAreaWrapper;
export const FormFieldSelect = SelectWrapper;

function useFormFieldContext(): FormFieldContextValue {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error("FormField.Input must be used within a FormField");
  }
  return context;
}

function buildDescribedBy(
  override: string | undefined,
  context: FormFieldContextValue,
): string | undefined {
  const ids = [...context.describedBy];
  if (override) {
    ids.push(override);
  }
  return ids.length > 0 ? ids.join(" ") : undefined;
}
