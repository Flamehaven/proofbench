/**
 * Material Design 3 Table Component
 * Based on Google Stitch design specifications
 */

import React from 'react';
import styled from '@emotion/styled';
import { useM3Theme } from '../../themes/M3ThemeProvider';

interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Custom render function for cell content */
  render?: (row: T, index: number) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Make rows clickable */
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

const TableContainer = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  overflow: 'hidden',
}));

const TableWrapper = styled.div({
  overflowX: 'auto',
});

const StyledTable = styled.table({
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
});

const TableHead = styled.thead(({ theme }) => ({
  borderBottom: `1px solid ${theme.colors.outlineVariant}`,
}));

const TableBody = styled.tbody({});

const HeaderCell = styled.th<{ width?: string }>(({ theme, width }) => ({
  padding: theme.spacing(2),
  ...theme.typography.labelMedium,
  color: theme.colors.onSurfaceVariant,
  fontWeight: 500,
  width: width || 'auto',
  whiteSpace: 'nowrap',
}));

const TableRow = styled.tr<{ clickable?: boolean; hoverable?: boolean }>(
  ({ theme, clickable, hoverable }) => ({
    borderBottom: `1px solid ${theme.colors.outlineVariant}`,
    transition: `background-color ${theme.transitions.duration.shorter} ${theme.transitions.easing.easeInOut}`,

    '&:last-child': {
      borderBottom: 'none',
    },

    ...(hoverable && {
      '&:hover': {
        backgroundColor:
          theme.mode === 'dark'
            ? 'color-mix(in srgb, ' + theme.colors.surface + ' 95%, white 5%)'
            : theme.colors.surfaceContainerLow,
      },
    }),

    ...(clickable && {
      cursor: 'pointer',
      '&:active': {
        backgroundColor:
          theme.mode === 'dark'
            ? 'color-mix(in srgb, ' + theme.colors.surface + ' 90%, white 10%)'
            : theme.colors.surfaceContainer,
      },
    }),
  })
);

const DataCell = styled.td(({ theme }) => ({
  padding: theme.spacing(2),
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurface,
}));

const VariantCell = styled(DataCell)(({ theme }) => ({
  color: theme.colors.onSurfaceVariant,
}));

export function Table<T extends Record<string, any>>({
  columns,
  data,
  hoverable = true,
  onRowClick,
  className,
}: TableProps<T>) {
  const { theme } = useM3Theme();

  const handleRowClick = (row: T, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const getCellValue = (row: T, column: Column<T>): any => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      // Support nested keys like "user.name"
      const keys = column.key.split('.');
      return keys.reduce((obj, key) => obj?.[key], row as any);
    }
    return row[column.key as keyof T];
  };

  return (
    <TableContainer className={className}>
      <TableWrapper>
        <StyledTable>
          <TableHead>
            <tr>
              {columns.map((column, index) => (
                <HeaderCell key={index} width={column.width}>
                  {column.header}
                </HeaderCell>
              ))}
            </tr>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                clickable={!!onRowClick}
                hoverable={hoverable}
                onClick={() => handleRowClick(row, rowIndex)}
              >
                {columns.map((column, colIndex) => {
                  const CellComponent = colIndex === 0 ? DataCell : VariantCell;
                  return (
                    <CellComponent key={colIndex}>
                      {column.render
                        ? column.render(row, rowIndex)
                        : getCellValue(row, column)}
                    </CellComponent>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableWrapper>
    </TableContainer>
  );
}

/**
 * Material Design 3 Status Badge Component
 * Used for status indicators in tables
 */
interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

const Badge = styled.span<{ status: 'success' | 'error' | 'warning' | 'info' }>(
  ({ theme, status }) => {
    const getColors = () => {
      switch (status) {
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
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
      borderRadius: theme.borderRadius.full,
      ...theme.typography.labelMedium,
      fontWeight: 500,
      backgroundColor: colors.bg,
      color: colors.text,
    };
  }
);

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  return <Badge status={status}>{children}</Badge>;
};
