import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "../../design-system";

const meta: Meta<typeof Alert> = {
  title: "Design System/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["toast", "banner"],
    },
    layout: {
      control: { type: "select" },
      options: ["page", "inline"],
    },
    status: {
      control: { type: "select" },
      options: ["success", "warning", "error", "info"],
    },
    title: { control: "text" },
    children: { control: "text" },
    isDismissible: { control: "boolean" },
    duration: { control: "number" },
  },
  args: {
    variant: "banner",
    layout: "inline",
    status: "info",
    title: "Semantic coherence requires revision.",
    children: "Step 2 lacks justification for the angle congruence.",
    isDismissible: false,
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const BannerInfo: Story = {};

export const ToastSuccess: Story = {
  args: {
    variant: "toast",
    layout: "page",
    status: "success",
    title: "Analysis completed successfully",
    children: "All steps passed symbolic and semantic validation.",
  },
};

export const BannerError: Story = {
  args: {
    status: "error",
    title: "Analysis failed",
    children: "Symbolic deviation exceeded tolerance.",
  },
};

export const DismissibleToast: Story = {
  args: {
    variant: "toast",
    status: "warning",
    title: "Consensus drift detected",
    children: "Consider re-running with an updated template.",
    isDismissible: true,
  },
};
