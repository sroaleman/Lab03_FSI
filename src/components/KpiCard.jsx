import React from 'react';
import { 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Percent, 
  Lock, 
  Tag, 
  Plane, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ShieldX,
  UserCheck,
  Clock
} from 'lucide-react';

export default function KpiCard({ kpi, onClick }) {
  const isNoPriorData = kpi.trend === '—';
  const isPositive = kpi.trendColor === 'green';
  const isNegative = kpi.trendColor === 'red';
  
  // Choose badge color style
  const getBadgeStyle = (badgeColor) => {
    switch (badgeColor) {
      case 'blue':
        return { bg: '#eff6ff', color: '#1e6bff', border: '#bfdbfe' };
      case 'cyan':
        return { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' };
      case 'violet':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'green':
        return { bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
      case 'red':
        return { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
      case 'orange':
        return { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', color: '#0f172a', border: '#e2e8f0' };
    }
  };

  const badgeTheme = getBadgeStyle(kpi.colorBadge);

  // Render proper icon based on kpi.iconType
  const renderKpiIcon = () => {
    switch (kpi.iconType) {
      case 'currency':
        return <DollarSign size={13} strokeWidth={2.8} />;
      case 'percentage':
        return <Percent size={13} strokeWidth={2.8} />;
      case 'lock':
        return <Lock size={13} strokeWidth={2.8} />;
      case 'tag':
        return <Tag size={13} strokeWidth={2.8} />;
      case 'plane-takeoff':
        return <Plane size={13} strokeWidth={2.8} />;
      case 'check-circle':
        return <CheckCircle2 size={13} strokeWidth={2.8} />;
      case 'alert-triangle':
        return <AlertTriangle size={13} strokeWidth={2.8} />;
      case 'shield-alert':
        return <ShieldAlert size={13} strokeWidth={2.8} />;
      case 'shield-x':
        return <ShieldX size={13} strokeWidth={2.8} />;
      default:
        return <Check size={13} strokeWidth={3} />;
    }
  };

  return (
    <div 
      style={{
        ...styles.card,
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick ? styles.clickableCard : {})
      }}
      onClick={onClick}
      className="ui-card"
      title={onClick ? "Haz clic para ver o gestionar este indicador" : kpi.title}
    >
      {/* Top row: Title and Status Icon Pill */}
      <div style={styles.topRow}>
        <span style={styles.title}>{kpi.title}</span>
        <div style={{
          ...styles.iconPill,
          backgroundColor: badgeTheme.bg,
          color: badgeTheme.color,
          borderColor: badgeTheme.border
        }}>
          {renderKpiIcon()}
        </div>
      </div>

      {/* Value Row */}
      <div style={styles.valueRow}>
        <span style={styles.value}>{kpi.value}</span>
        
        {/* Trend Indicator */}
        <div style={{
          ...styles.trend,
          color: isPositive ? '#047857' : isNegative ? '#b91c1c' : '#64748b',
          backgroundColor: isPositive ? '#ecfdf5' : isNegative ? '#fef2f2' : '#f1f5f9',
          border: `1px solid ${isPositive ? '#a7f3d0' : isNegative ? '#fecaca' : '#e2e8f0'}`
        }}>
          {!isNoPriorData && kpi.trendDirection === 'up' && (
            <ArrowUpRight size={13} strokeWidth={2.5} />
          )}
          {!isNoPriorData && kpi.trendDirection === 'down' && (
            <ArrowDownRight size={13} strokeWidth={2.5} />
          )}
          <span>{kpi.trend}</span>
        </div>
      </div>

      {/* Subtitle / Context */}
      <div style={styles.subtitleRow}>
        <span style={styles.subtitle}>{kpi.subtitle}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '22px',
    padding: '20px 22px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '124px',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  clickableCard: {
    cursor: 'pointer'
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  title: {
    fontSize: '0.84rem',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '-0.01em'
  },
  iconPill: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent'
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    marginBottom: '2px',
    flexWrap: 'wrap'
  },
  value: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.65rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.1
  },
  trend: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '9999px'
  },
  subtitleRow: {
    marginTop: '2px'
  },
  subtitle: {
    fontSize: '0.6875rem',
    color: '#94a3b8',
    fontWeight: '500'
  }
};
