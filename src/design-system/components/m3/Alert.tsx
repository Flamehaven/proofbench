/**
 * Material Design 3 Alert Component
 * Based on Google Stitch design specifications
 */

import React from 'react';
import styled from '@emotion/styled';
import { useM3Theme } from '../../themes/M3ThemeProvider';

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  severity: AlertSeverity;
  title?: string;
  children: React.ReactNode;
  /** Material Symbols icon name (auto-determined if not provided) */
  icon?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Callback when alert is dismissed (shows close button) */
  onClose?: () => void;
  className?: string;
}

const AlertContainer = styled.div<{ severity: AlertSeverity }>(({ theme, severity }) => {
  const getColors = () => {
    switch (severity) {
      case 'success':
        return {
          bg: theme.colors.successContainer,
          text: theme.colors.onSuccessContainer,
        };
      case 'error':
        return {
          bg: theme.colors.errorContainer,
          text: theme.colors.onErrorContainer,
        };
      case 'warning':
        return {
          bg: theme.colors.warningContainer,
          text: theme.colors.onWarningContainer,
        };
      case 'info':
        return {
          bg: theme.colors.primaryContainer,
          text: theme.colors.onPrimaryContainer,
        };
    }
  };

  const colors = getColors();

  return {
    backgroundColor: colors.bg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'start',
    gap: theme.spacing(2),
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.easing.easeInOut}`,

    '& .alert-icon': {
      fontFamily: 'Material Symbols Outlined',
      fontSize: '24px',
      color: colors.text,
      marginTop: theme.spacing(0.125),
    },
  };
});

const AlertContent = styled.div({
  flex: 1,
});

const AlertTitle = styled.p(({ theme }) => ({
  ...theme.typography.titleMedium,
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),

  // Inherit color from parent container
}));

const AlertMessage = styled.p(({ theme }) => ({
  ...theme.typography.bodyMedium,
  opacity: 0.8,

  // Inherit color from parent container
}));

const AlertActions = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}));

const CloseButton = styled.button(({ theme }) => ({
  background: 'none',
  border: 'none',
  padding: theme.spacing(0.5),
  cursor: 'pointer',
  borderRadius: theme.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `background-color ${theme.transitions.duration.shorter} ${theme.transitions.easing.easeInOut}`,

  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  '&:active': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  '& .material-symbols-outlined': {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '20px',
  },
}));

export const Alert: React.FC<AlertProps> = ({
  severity,
  title,
  children,
  icon,
  action,
  onClose,
  className,
}) => {
  const { theme } = useM3Theme();

  const getDefaultIcon = (): string => {
    switch (severity) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  };

  const iconName = icon || getDefaultIcon();

  return (
    <AlertContainer severity={severity} className={className}>
      <span className="alert-icon material-symbols-outlined">{iconName}</span>
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{children}</AlertMessage>
      </AlertContent>
      {(action || onClose) && (
        <AlertActions>
          {action}
          {onClose && (
            <CloseButton onClick={onClose} aria-label="Close alert">
              <span className="material-symbols-outlined">close</span>
            </CloseButton>
          )}
        </AlertActions>
      )}
    </AlertContainer>
  );
};

/**
 * Alert Stack - Container for multiple alerts with spacing
 */
interface AlertStackProps {
  children: React.ReactNode;
  className?: string;
}

const StackContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const AlertStack: React.FC<AlertStackProps> = ({ children, className }) => {
  return <StackContainer className={className}>{children}</StackContainer>;
};
