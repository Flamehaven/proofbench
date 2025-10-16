import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../design-system";

const ArrowIcon = () => (
  <span aria-hidden style={{ display: "inline-block", paddingLeft: 4 }}>
    →
  </span>
);

const meta: Meta<typeof Button> = {
  title: "Design System/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "ghost", "icon-only"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    isLoading: { control: "boolean" },
    iconLeft: { control: false },
    iconRight: { control: false },
  },
  args: {
    variant: "primary",
    size: "md",
    children: "Run Analysis",
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        component:
          "The Button component provides primary and secondary actions throughout ProofBench. Icon-only buttons must include an accessible aria-label.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Export CSV",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "View Details",
  },
};

export const IconWithText: Story = {
  args: {
    children: "Continue",
    iconRight: <ArrowIcon />,
  },
};

export const IconOnly: Story = {
  args: {
    variant: "icon-only",
    iconLeft: <ArrowIcon />,
    children: undefined,
    "aria-label": "Next step",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};
