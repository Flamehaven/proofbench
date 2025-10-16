import { css } from "@emotion/react";
import { tokens } from "../tokens";

export const focusRing = css({
  outline: "none",
  boxShadow: `0 0 0 2px ${
    tokens.token.color.background.primary.default.light
  }, 0 0 0 4px ${tokens.token.color.status.info.light}`,
});

export const visuallyHidden = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  border: 0,
});
