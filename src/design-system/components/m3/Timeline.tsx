/**
 * Material Design 3 Timeline Component
 * Based on Google Stitch design specifications
 */

import React from 'react';
import styled from '@emotion/styled';
import { useM3Theme } from '../../themes/M3ThemeProvider';

export interface TimelineItem {
  /** Event title */
  title: string;
  /** Event timestamp or description */
  subtitle: string;
  /** Material Symbols icon name */
  icon?: string;
  /** Event status for color coding */
  status?: 'default' | 'success' | 'error' | 'warning';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const TimelineContainer = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing(2),
}));

const TimelineInner = styled.div({
  position: 'relative',
});

const TimelineLine = styled.div(({ theme }) => ({
  position: 'absolute',
  left: '20px',
  top: 0,
  bottom: 0,
  width: '2px',
  backgroundColor: theme.colors.outlineVariant,
}));

const TimelineList = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const TimelineItemContainer = styled.div({
  display: 'flex',
  alignItems: 'start',
  gap: '16px',
  position: 'relative',
});

const IconContainer = styled.div<{ status?: string }>(({ theme, status }) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return theme.colors.successContainer;
      case 'error':
        return theme.colors.errorContainer;
      case 'warning':
        return theme.colors.warningContainer;
      default:
        return theme.colors.surfaceContainerHigh;
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'success':
        return theme.colors.onSuccessContainer;
      case 'error':
        return theme.colors.onErrorContainer;
      case 'warning':
        return theme.colors.onWarningContainer;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  return {
    width: '40px',
    height: '40px',
    flexShrink: 0,
    backgroundColor: getBackgroundColor(),
    borderRadius: theme.borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.easing.easeInOut}`,
    zIndex: 1,

    '& .material-symbols-outlined': {
      fontFamily: 'Material Symbols Outlined',
      fontSize: '20px',
      color: getIconColor(),
    },

    '&:hover': {
      transform: 'scale(1.1)',
    },
  };
});

const ItemContent = styled.div({
  flex: 1,
});

const ItemTitle = styled.p(({ theme }) => ({
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurface,
  fontWeight: 500,
  marginBottom: theme.spacing(0.25),
}));

const ItemSubtitle = styled.p(({ theme }) => ({
  ...theme.typography.bodySmall,
  color: theme.colors.onSurfaceVariant,
}));

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  const { theme } = useM3Theme();

  const getDefaultIcon = (index: number, total: number): string => {
    if (index === 0) return 'play_arrow';
    if (index === total - 1) return 'stop';
    return 'check';
  };

  return (
    <TimelineContainer className={className}>
      <TimelineInner>
        <TimelineLine />
        <TimelineList>
          {items.map((item, index) => (
            <TimelineItemContainer key={index}>
              <IconContainer status={item.status}>
                <span className="material-symbols-outlined">
                  {item.icon || getDefaultIcon(index, items.length)}
                </span>
              </IconContainer>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemSubtitle>{item.subtitle}</ItemSubtitle>
              </ItemContent>
            </TimelineItemContainer>
          ))}
        </TimelineList>
      </TimelineInner>
    </TimelineContainer>
  );
};
