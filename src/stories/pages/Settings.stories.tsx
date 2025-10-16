import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SettingsPage } from "../../pages/Settings";
import type { SettingsData } from "../../api/types";

const meta: Meta<typeof SettingsPage> = {
  title: "Pages/Settings",
  component: SettingsPage,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SettingsPage>;

const settingsKey = ["settings"];

const mockSettings: SettingsData = {
  engine: "atlas-1",
  tokenBudget: 4096,
  animations: true,
  highContrast: false,
};

const SettingsWithData = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.setQueryData(settingsKey, mockSettings);
  }, [queryClient]);
  return <SettingsPage />;
};

export const Default: Story = {
  render: () => <SettingsWithData />,
};
