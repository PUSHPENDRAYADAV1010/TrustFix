import React from 'react';

export const StatCard = ({ title, value, subtitle, icon, trend, color = 'primary' }) => {
  const getTheme = () => {
    switch (color) {
      case 'success':
        return {
          barColor: 'var(--success-600)',
          bg: 'var(--success-50)',
          color: 'var(--success-700)',
          border: '1px solid rgba(5, 150, 105, 0.25)'
        };
      case 'warning':
        return {
          barColor: 'var(--warning-500)',
          bg: 'var(--warning-50)',
          color: 'var(--warning-800)',
          border: '1px solid rgba(217, 119, 6, 0.25)'
        };
      case 'danger':
        return {
          barColor: 'var(--danger-600)',
          bg: 'var(--danger-50)',
          color: 'var(--danger-700)',
          border: '1px solid rgba(220, 38, 38, 0.25)'
        };
      case 'info':
        return {
          barColor: 'var(--info-600)',
          bg: 'var(--info-50)',
          color: 'var(--info-700)',
          border: '1px solid rgba(2, 132, 199, 0.25)'
        };
      case 'primary':
      default:
        return {
          barColor: 'var(--primary-700)',
          bg: 'var(--primary-subtle)',
          color: 'var(--primary-800)',
          border: '1px solid rgba(30, 91, 181, 0.25)'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className="card card-hoverable"
      style={{
        border: '1px solid var(--neutral-200)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Top Accent Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: theme.barColor,
        }}
      />

      <div className="card-body" style={{ padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--neutral-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {title}
          </span>
          {icon && (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: theme.bg,
                color: theme.color,
                border: theme.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <h3
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: 'var(--neutral-900)',
              margin: 0,
              letterSpacing: '-0.025em',
              lineHeight: 1.1
            }}
          >
            {value}
          </h3>
          {trend && (
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: 'var(--success-700)',
                backgroundColor: 'var(--success-50)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-xs)',
              color: 'var(--neutral-600)',
              lineHeight: 1.45
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
