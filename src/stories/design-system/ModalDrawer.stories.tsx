import type { Meta, StoryObj } from "@storybook/react";
import { Modal, Drawer, Button, CardBody, CardSection } from "../../design-system";
import React, { useState } from "react";

const meta: Meta = {
  title: "Design System/Modal & Drawer",
  tags: ["autodocs"],
};

export default meta;

const ModalExample = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete Item"
        size="md"
      >
        <CardSection>
          <p>Are you sure you want to delete this proof run?</p>
        </CardSection>
        <CardSection>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Delete
          </Button>
        </CardSection>
      </Modal>
    </>
  );
};

const DrawerExample = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        position="right"
        size="md"
      >
        <CardBody>
          <h3>Settings</h3>
          <p>Adjust visualization options here.</p>
        </CardBody>
      </Drawer>
    </>
  );
};

export const ModalDefault: StoryObj = {
  render: () => <ModalExample />,
};

export const DrawerRight: StoryObj = {
  render: () => <DrawerExample />,
};
