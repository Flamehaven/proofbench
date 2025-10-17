import styled from "@emotion/styled";
import { css, Theme } from "@emotion/react";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useMemo,
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
  gap: theme.spacing(1),
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurface,
}));

const LabelRow = styled("span")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  fontWeight: theme.typography.titleSmall.fontWeight,
}));

const RequiredAsterisk = styled("span")(({ theme }) => ({
  color: theme.colors.error,
}));

const HelperText = styled("span")(({ theme }) => ({
  ...theme.typography.bodySmall,
  color: theme.colors.onSurfaceVariant,
}));

const ErrorText = styled("span")(({ theme }) => ({
  color: theme.colors.error,
  ...theme.typography.bodySmall,
  fontWeight: theme.typography.titleSmall.fontWeight,
}));

const Shell = styled("div")<{
  status: FieldStatus;
  density: FieldDensity;
}>(({ theme, status, density }) => {
  const { colors, spacing, borderRadius, transitions } = theme;
  
  const borderColor =
    status === "error"
      ? colors.error
      : status === "success"
        ? colors.success
        : colors.outline;

  const base = {
    display: "flex",
    alignItems: "center",
    gap: spacing(1),
    borderRadius: borderRadius.md,
    border: `1px solid ${borderColor}`,
    padding: density === "compact" ? `${spacing(0.75)} ${spacing(1.25)}` : `${spacing(1)} ${spacing(1.5)}`,
    backgroundColor: colors.surface,
    transition: `border-color ${transitions.duration.short} ${transitions.easing.easeInOut}`,
  };

  return [
    base,
    css({
      "&:focus-within": {
        borderColor: colors.primary,
        boxShadow: `0 0 0 3px color-mix(in srgb, ${colors.primary} 15%, transparent)`,
      },
      "input:disabled, textarea:disabled, select:disabled": {
        backgroundColor: `color-mix(in srgb, ${colors.onSurface} 4%, transparent)`,
      },
      "&:has(input:disabled), &:has(textarea:disabled), &:has(select:disabled)": {
        opacity: 0.6,
        cursor: "not-allowed",
      },
    }),
  ];
});

const inputElementStyles = (theme: Theme) => ({
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  ...theme.typography.bodyLarge,
  color: theme.colors.onSurface,
  "::placeholder": {
    color: theme.colors.onSurfaceVariant,
  },
});

const InputElement = styled("input")(({ theme }) => inputElementStyles(theme));
const TextAreaElement = styled("textarea")(({ theme }) => ({
  ...inputElementStyles(theme),
  resize: "vertical",
}));
const SelectElement = styled("select")(({ theme }) => inputElementStyles(theme));

const Affix = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  color: theme.colors.onSurfaceVariant,
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
    throw new Error("FormField components must be used within a FormField");
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