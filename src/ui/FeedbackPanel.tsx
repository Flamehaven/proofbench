/**
 * Feedback Panel Component
 * Displays validation feedback messages
 */

import React from 'react';
import styled from '@emotion/styled';
import type { FeedbackMessage } from '../core/feedback_generator';

interface FeedbackPanelProps {
  messages: FeedbackMessage[];
}

const PanelContainer = styled.div(({ theme }) => ({
  padding: theme.tokens.token.spacing.md,
  backgroundColor: theme.tokens.token.color.background.primary.subtle[theme.mode],
  borderRadius: theme.tokens.token.borderRadius.lg,
  marginTop: theme.tokens.token.spacing.md
}));

const MessageItem = styled.div<{ type: string }>(({ theme, type }) => {
  const getColor = () => {
    switch (type) {
      case 'error':
        return theme.tokens.token.color.status.error[theme.mode];
      case 'warning':
        return theme.tokens.token.color.status.warning[theme.mode];
      case 'success':
        return theme.tokens.token.color.status.success[theme.mode];
      default:
        return theme.tokens.token.color.status.info[theme.mode];
    }
  };

  return {
    padding: theme.tokens.token.spacing.md,
    marginBottom: theme.tokens.token.spacing.sm,
    borderRadius: theme.tokens.token.borderRadius.md,
    backgroundColor: theme.tokens.token.color.background.primary.subtle[theme.mode],
    color: getColor(),
    border: '1px solid',
    borderColor: getColor(),
  };
});

export default function FeedbackPanel({ messages }: FeedbackPanelProps) {
  return (
    <PanelContainer>
      <h3>Feedback</h3>
      {messages.map((msg, idx) => (
        <MessageItem key={idx} type={msg.type}>
          <strong>{msg.summary}</strong>
          {msg.suggestions && msg.suggestions.length > 0 && (
            <ul>
              {msg.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
        </MessageItem>
      ))}
    </PanelContainer>
  );
}
