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

const MessageItem = styled.div<{ type: string }>(({ theme, type }) => ({
  padding: theme.tokens.token.spacing.md,
  marginBottom: theme.tokens.token.spacing.sm,
  borderRadius: theme.tokens.token.borderRadius.md,
  backgroundColor: 
    type === 'error' ? theme.tokens.token.color.background.danger.subtle[theme.mode] :
    type === 'warning' ? theme.tokens.token.color.background.warning.subtle[theme.mode] :
    type === 'success' ? theme.tokens.token.color.background.success.subtle[theme.mode] : 
    theme.tokens.token.color.background.info.subtle[theme.mode],
  color: 
    type === 'error' ? theme.tokens.token.color.text.danger.default[theme.mode] :
    type === 'warning' ? theme.tokens.token.color.text.warning.default[theme.mode] :
    type === 'success' ? theme.tokens.token.color.text.success.default[theme.mode] : 
    theme.tokens.token.color.text.info.default[theme.mode],
  border: '1px solid',
  borderColor: 
    type === 'error' ? theme.tokens.token.color.border.danger[theme.mode] :
    type === 'warning' ? theme.tokens.token.color.border.warning[theme.mode] :
    type === 'success' ? theme.tokens.token.color.border.success[theme.mode] : 
    theme.tokens.token.color.border.info[theme.mode],
}));

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
