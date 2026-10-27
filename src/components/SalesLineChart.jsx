import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Download } from 'lucide-react';
import { formatCOP } from '../utils/kpis';

export default function SalesLineChart({ data = [], onExport }) {
  // Custom tooltip formatted for COP currency
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltipContainer}>
          <p style={styles.tooltipDate}>{label}</p>
          <div style={styles.tooltipItem}>
            <span style={{ ...styles.tooltipDot, backgroundColor: '#1e6bff' }} />
            <span style={styles.tooltipLabel}>Ventas confirmadas:</span>
            <span style={styles.tooltipVal}>
              {formatCOP(payload[0]?.payload?.ventas_confirmadas || 0)}
            </span>
          </div>
          {payload[1] && (
            <div style={styles.tooltipItem}>
              <span style={{ ...styles.tooltipDot, backgroundColor: '#06b6d4' }} />
              <span style={styles.tooltipLabel}>Total proyectado:</span>
              <span style={styles.tooltipVal}>
                {formatCOP(payload[1]?.payload?.monto_total || 0)}
              </span>
            </div>
          )}
          <div style={styles.tooltipReservas}>
            <span>{payload[0]?.payload?.total_reservas || 0} reservas registradas</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = ['Fecha', 'Ventas Confirmadas COP', 'Monto Total COP', 'Reservas'];
    const rows = data.map(d => [
      d.date, 
      d.ventas_confirmadas, 
      d.monto_total, 
      d.total_reservas
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_aeroops_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onExport) onExport();
  };

  return (
    <div style={styles.card} className="ui-card">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Evolución de ventas</h3>
          <p style={styles.subtitle}>Ingresos confirmados por día (COP) y reservas totales</p>
        </div>
        <button 
          onClick={handleExportCSV}
          style={styles.exportBtn}
          title="Descargar datos en formato CSV"
        >
          <Download size={15} color="#475569" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Chart container */}
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={290}>
          <AreaChart 
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Primary Blue gradient */}
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e6bff" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#1e6bff" stopOpacity={0.0} />
              </linearGradient>
              {/* Cyan gradient */}
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="#f1f5f9" 
              vertical={false} 
            />

            <XAxis 
              dataKey="dayLabel" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              dy={10}
            />

            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              dx={-10}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Total / Proyectado line (cyan wave) */}
            <Area 
              type="monotone" 
              dataKey="monto_total" 
              stroke="#06b6d4" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />

            {/* Ventas confirmadas (primary electric blue) */}
            <Area 
              type="monotone" 
              dataKey="ventas_confirmadas" 
              stroke="#1e6bff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorVentas)" 
              activeDot={{ r: 6, fill: '#1e6bff', stroke: '#ffffff', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '24px 28px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    width: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginTop: '3px'
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  chartWrapper: {
    width: '100%',
    height: '290px'
  },
  tooltipContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '14px',
    padding: '12px 16px',
    boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    minWidth: '200px'
  },
  tooltipDate: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tooltipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8125rem',
    marginBottom: '4px'
  },
  tooltipDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  tooltipLabel: {
    color: '#cbd5e1'
  },
  tooltipVal: {
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 'auto'
  },
  tooltipReservas: {
    marginTop: '6px',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.6875rem',
    color: '#94a3b8'
  }
};
