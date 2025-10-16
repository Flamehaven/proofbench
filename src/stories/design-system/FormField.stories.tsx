import type { Meta, StoryObj } from "@storybook/react";
import {
  FormField,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextArea,
} from "../../design-system";

const meta: Meta<typeof FormField> = {
  title: "Design System/FormField",
  component: FormField,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const DefaultInput: Story = {
  render: () => (
    <FormField label="Proof Name">
      <FormFieldInput placeholder="Triangle congruence proof" />
    </FormField>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <FormField
      label="Semantic Model"
      helpText="Choose the consensus adapter for analysis."
    >
      <FormFieldSelect>
        <option value="atlas-1">Atlas-1</option>
        <option value="orion-2">Orion-2</option>
      </FormFieldSelect>
    </FormField>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <FormField
      label="Proof Draft"
      errorMessage="Proof cannot be empty."
    >
      <FormFieldTextArea rows={4} placeholder="Enter your proof..." />
    </FormField>
  ),
};

export const Compact: Story = {
  render: () => (
    <FormField label="Token Budget" density="compact">
      <FormFieldInput type="number" value={4096} min={1024} max={8192} />
    </FormField>
  ),
};
