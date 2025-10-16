/**
 * Material Design 3 Metric Card Component
 * Based on Google Stitch design specifications
 */

import React from 'react';
import styled from '@emotion/styled';
import { useM3Theme, getLIIColor } from '../../themes/M3ThemeProvider';

interface MetricCardProps {
  label: string;
  value: string | number;
  /** Optional tooltip text for explanation */
  tooltip?: string;
  /** Apply color based on ProofBench metric type */
  metricType?: 'lii' | 'coherence' | 'semantic' | 'default';
  /** Numeric value for color calculation (when metricType is set) */
  numericValue?: number;
  /** Optional icon (Material Symbols name) */
  icon?: string;
  className?: string;
}

const CardContainer = styled.div<{ elevation: number }>(({ theme, elevation }) => ({
  backgroundColor: theme.colors.surfaceContainerHigh,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing(3),
  transition: `all ${theme.transitions.duration.short} ${theme.transitions.easing.easeInOut}`,
  boxShadow: elevation > 0 ? theme.elevation[`level${elevation}` as keyof typeof theme.elevation] : 'none',

  '&:hover': {
    backgroundColor: theme.mode === 'dark'
      ? 'color-mix(in srgb, ' + theme.colors.surfaceContainerHigh + ' 92%, white 8%)'
      : theme.colors.surfaceContainerHighest,
    transform: 'translateY(-2px)',
    boxShadow: theme.mode === 'light' ? theme.elevation.level2 : 'none',
  },

  '&:focus-within': {
    outline: `2px solid ${theme.colors.primary}`,
    outlineOffset: '2px',
  },
}));

const Label = styled.p(({ theme }) => ({
  ...theme.typography.labelMedium,
  color: theme.colors.onSurfaceVariant,
  marginBottom: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Value = styled.p<{ color?: string }>(({ theme, color }) => ({
  ...theme.typography.displaySmall,
  color: color || theme.colors.onSurface,
  fontWeight: 400,
  lineHeight: 1,
}));

const IconWrapper = styled.span(({ theme }) => ({
  fontFamily: 'Material Symbols Outlined',
  fontSize: '18px',
  color: theme.colors.onSurfaceVariant,
}));

const TooltipWrapper = styled.div(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',

  '&:hover .tooltip': {
    opacity: 1,
    visibility: 'visible',
  },
}));

const Tooltip = styled.div(({ theme }) => ({
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.colors.inverseSurface,
  color: theme.colors.inverseOnSurface,
  ...theme.typography.bodySmall,
  borderRadius: theme.borderRadius.sm,
  whiteSpace: 'nowrap',
  opacity: 0,
  visibility: 'hidden',
  transition: `opacity ${theme.transitions.duration.short} ${theme.transitions.easing.easeInOut}`,
  zIndex: 1000,
  pointerEvents: 'none',

  '&::after': {
    content: '""',
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: `${theme.colors.inverseSurface} transparent transparent transparent`,
  },
}));

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  tooltip,
  metricType = 'default',
  numericValue,
  icon,
  className,
}) => {
  const { theme } = useM3Theme();

  // Calculate color based on metric type and numeric value
  const getMetricColor = (): string | undefined => {
    if (metricType === 'default' || numericValue === undefined) return undefined;

    const normalizedValue = typeof numericValue === 'number' ? numericValue : parseFloat(String(numericValue));

    switch (metricType) {
      case 'lii':
        return getLIIColor(normalizedValue);
      case 'coherence':
        if (normalizedValue > 85) return theme.semanticColors.coherenceHigh;
        if (normalizedValue >= 70) return theme.semanticColors.coherenceMedium;
        return theme.semanticColors.coherenceLow;
      case 'semantic':
        if (normalizedValue > 80) return theme.semanticColors.semanticHigh;
        if (normalizedValue >= 60) return theme.semanticColors.semanticMedium;
        return theme.semanticColors.semanticLow;
      default:
        return undefined;
    }
  };

  const metricColor = getMetricColor();

  return (
    <CardContainer elevation={theme.mode === 'light' ? 1 : 0} className={className}>
      <Label>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        {tooltip ? (
          <TooltipWrapper>
            {label}
            <Tooltip className="tooltip">{tooltip}</Tooltip>
          </TooltipWrapper>
        ) : (
          label
        )}
      </Label>
      <Value color={metricColor}>{value}</Value>
    </CardContainer>
  );
};
