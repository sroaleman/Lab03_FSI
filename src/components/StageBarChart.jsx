import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function StageBarChart({ 
  title, 
  subtitle, 
  data = [], 
  dataKey = "cantidad",
  categoryKey = "etapa",
  badgeText = "" 
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={styles.tooltipContainer}>
          <p style={styles.tooltipTitle}>{item[categoryKey]}</p>
          <p style={styles.tooltipValue}>
            <span style={{ fontWeight: '700', color: item.color || '#1e6bff' }}>
              {item[dataKey]}
            </span>
            {' '}registros
          </p>
          {item.descripcion && (
            <p style={styles.tooltipDesc}>{item.descripcion}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.card} className="ui-card">
      <div style={styles.header}>
        <div>
          <div style={styles.titleRow}>
            <h4 style={styles.title}>{title}</h4>
            {badgeText && (
              <span style={styles.badge}>{badgeText}</span>
            )}
          </div>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart 
            data={data}
            margin={{ top: 15, right: 10, left: -15, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey={categoryKey} 
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props;
                // Truncate or wrap label nicely
                const label = payload.value.length > 14 
                  ? payload.value.slice(0, 12) + '...' 
                  : payload.value;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text 
                      x={0} 
                      y={0} 
                      dy={14} 
                      textAnchor="middle" 
                      fill="#64748b" 
                      fontSize={10} 
                      fontWeight={600}
                    >
                      {label}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              radius={[8, 8, 2, 2]}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || '#1e6bff'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '22px 24px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
    border: '1px solid #dbeafe'
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px'
  },
  chartWrapper: {
    width: '100%',
    height: '230px'
  },
  tooltipContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#ffffff',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '220px'
  },
  tooltipTitle: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '4px'
  },
  tooltipValue: {
    fontSize: '0.75rem',
    color: '#cbd5e1'
  },
  tooltipDesc: {
    fontSize: '0.6875rem',
    color: '#94a3b8',
    marginTop: '4px',
    lineHeight: 1.3
  }
};
