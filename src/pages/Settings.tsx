import { useState } from "react";
import styled from "@emotion/styled";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardSection,
  FormField,
  FormFieldInput,
  FormFieldSelect,
} from "../design-system";

const PageWrapper = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const LayoutGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  "@media (max-width: 1023px)": {
    gridTemplateColumns: "1fr",
  },
}));

const CardStack = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const PreviewPanel = styled(Card)(({ theme }) => ({
  minHeight: "320px",
  display: "grid",
  gap: theme.tokens.token.spacing.md,
  alignContent: "start",
}));

const FooterBar = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.tokens.token.spacing.md,
}));

export function SettingsPage(): JSX.Element {
  const [engine, setEngine] = useState("atlas-1");
  const [tokens, setTokens] = useState("4096");
  const [animations, setAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <PageWrapper>
      <header>
        <h1>Settings</h1>
        <p>Adjust ProofEngine parameters, visualization preferences, and accessibility options.</p>
      </header>

      <LayoutGrid>
        <CardStack>
          <Card variant="default">
            <CardHeader>Engine Configuration</CardHeader>
            <CardBody>
              <CardSection>
                <FormField
                  label="Semantic Model"
                  helpText="Select the default LLM adapter for consensus evaluation."
                >
                  <FormFieldSelect
                    value={engine}
                    onChange={(event) => setEngine(event.target.value)}
                  >
                    <option value="atlas-1">Atlas-1 (general reasoning)</option>
                    <option value="orion-2">Orion-2 (formal logic)</option>
                    <option value="helios-3">Helios-3 (symbolic heavy)</option>
                  </FormFieldSelect>
                </FormField>
              </CardSection>
              <CardSection>
                <FormField
                  label="Token Budget"
                  helpText="Maximum token window used per step analysis."
                >
                  <FormFieldInput
                    type="number"
                    min={1024}
                    max={8192}
                    step={512}
                    value={tokens}
                    onChange={(event) => setTokens(event.target.value)}
                  />
                </FormField>
              </CardSection>
            </CardBody>
          </Card>

          <Card variant="default">
            <CardHeader>Visualization Options</CardHeader>
            <CardBody>
              <CardSection>
                <label>
                  <input
                    type="checkbox"
                    checked={animations}
                    onChange={(event) => setAnimations(event.target.checked)}
                  />{" "}
                  Enable graph animations
                </label>
              </CardSection>
              <CardSection>
                <FormField label="Graph Style">
                  <FormFieldSelect>
                    <option value="force">Force-directed</option>
                    <option value="hierarchy">Layered hierarchy</option>
                    <option value="radial">Radial dependency</option>
                  </FormFieldSelect>
                </FormField>
              </CardSection>
            </CardBody>
          </Card>

          <Card variant="default">
            <CardHeader>Accessibility</CardHeader>
            <CardBody>
              <label>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(event) => setHighContrast(event.target.checked)}
                />{" "}
                High-contrast theme
              </label>
            </CardBody>
          </Card>
        </CardStack>

        <PreviewPanel variant="default">
          <CardHeader>Live Preview</CardHeader>
          <CardBody>
            <p>
              Mode: <strong>{engine}</strong>
            </p>
            <p>
              Token budget: <strong>{tokens}</strong>
            </p>
            <p>Graph animations: {animations ? "Enabled" : "Disabled"}</p>
            <p>Contrast mode: {highContrast ? "High contrast" : "Default"}</p>
          </CardBody>
          <CardBody>
            <CardSection>
              <p>Sample Node Highlight</p>
              <div
                style={{
                  width: "100%",
                  height: "140px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #11233b 0%, #1f6f4a 100%)",
                }}
              />
            </CardSection>
          </CardBody>
        </PreviewPanel>
      </LayoutGrid>

      <FooterBar>
        <Button variant="ghost">Reset to Defaults</Button>
        <Button variant="primary">Save Changes</Button>
      </FooterBar>
    </PageWrapper>
  );
}
