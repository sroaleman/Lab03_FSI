import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Calendar, 
  Plane, 
  Smartphone, 
  User, 
  ChevronDown,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Filters({ 
  filters, 
  setFilters, 
  flights = [], 
  agents = [],
  onResetFilters,
  totalBookingsCount = 0,
  filteredBookingsCount = 0,
  totalCheckinsCount = 0,
  filteredCheckinsCount = 0
}) {
  const isFiltered = 
    filters.dateRange !== 'all' || 
    filters.flightRoute !== 'all' || 
    filters.channel !== 'all' || 
    filters.agentId !== 'all' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const activeCount = [
    filters.dateRange !== 'all' || filters.startDate || filters.endDate,
    filters.flightRoute !== 'all',
    filters.channel !== 'all',
    filters.agentId !== 'all'
  ].filter(Boolean).length;

  return (
    <div style={styles.card} className="ui-card">
      {/* Top row: Label, active filters pill and reset button */}
      <div style={styles.topRow}>
        <div style={styles.headerLeft}>
          <div style={styles.filterIconCircle}>
            <Filter size={16} color="#1e6bff" />
          </div>
          <div>
            <h4 style={styles.title}>Filtros Operacionales Globales</h4>
            <p style={styles.subtitle}>
              Modifica los criterios para recalcular en tiempo real KPIs, gráficos y operaciones
            </p>
          </div>
        </div>

        <div style={styles.headerRight}>
          {isFiltered ? (
            <div style={styles.activeCounterPill}>
              <span style={styles.activeDot} />
              <span>{activeCount} filtro{activeCount > 1 ? 's' : ''} aplicado{activeCount > 1 ? 's' : ''}</span>
              <span style={styles.counterResults}>
                ({filteredBookingsCount}/{totalBookingsCount} reservas)
              </span>
            </div>
          ) : (
            <span style={styles.allResultsBadge}>
              Mostrando el 100% de los datos ({totalBookingsCount} reservas · {totalCheckinsCount} check-ins)
            </span>
          )}

          {/* Button: Limpiar filtros */}
          <button 
            onClick={onResetFilters} 
            disabled={!isFiltered}
            style={{
              ...styles.resetBtn,
              opacity: isFiltered ? 1 : 0.45,
              cursor: isFiltered ? 'pointer' : 'not-allowed'
            }}
            title="Restablecer todos los filtros"
          >
            <RotateCcw size={14} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Row */}
      <div style={styles.controlsGrid}>
        {/* 1. Rango de Fechas */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <Calendar size={13} color="#1e6bff" />
            <span>Rango de Fechas:</span>
          </label>
          <div style={styles.selectWrapper}>
            <select 
              value={filters.dateRange} 
              onChange={(e) => {
                const val = e.target.value;
                setFilters({ 
                  ...filters, 
                  dateRange: val,
                  // Auto-fill dates if preset
                  startDate: val === 'today' ? '2026-10-19' : val === 'last_3_days' ? '2026-10-17' : val === 'last_7_days' ? '2026-10-13' : '',
                  endDate: val !== 'all' ? '2026-10-19' : ''
                });
              }}
              style={styles.selectInput}
            >
              <option value="all">Todo el período (Octubre 2026)</option>
              <option value="today">Hoy (19 de Octubre)</option>
              <option value="last_3_days">Últimos 3 días (17 - 19 Oct)</option>
              <option value="last_7_days">Últimos 7 días (13 - 19 Oct)</option>
              <option value="custom">Rango Personalizado</option>
            </select>
            <ChevronDown size={14} color="#64748b" style={styles.selectCaret} />
          </div>

          {/* Optional custom date pickers */}
          {filters.dateRange === 'custom' && (
            <div style={styles.customDateRow}>
              <input 
                type="date"
                value={filters.startDate || '2026-10-15'}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                style={styles.datePicker}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>a</span>
              <input 
                type="date"
                value={filters.endDate || '2026-10-19'}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                style={styles.datePicker}
              />
            </div>
          )}
        </div>

        {/* 2. Vuelo / Ruta */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <Plane size={13} color="#06b6d4" />
            <span>Vuelo / Ruta:</span>
          </label>
          <div style={styles.selectWrapper}>
            <select 
              value={filters.flightRoute} 
              onChange={(e) => setFilters({ ...filters, flightRoute: e.target.value })}
              style={styles.selectInput}
            >
              <option value="all">Todos los vuelos y rutas</option>
              {flights.map(fl => (
                <option key={fl.id} value={fl.id}>
                  {fl.flight_number || fl.numero} ({fl.origin || fl.origen} → {fl.destination || fl.destino}) - {fl.departure_time || '09:48'}
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="#64748b" style={styles.selectCaret} />
          </div>
        </div>

        {/* 3. Canal de Venta */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <Smartphone size={13} color="#8b5cf6" />
            <span>Canal de Venta:</span>
          </label>
          <div style={styles.selectWrapper}>
            <select 
              value={filters.channel} 
              onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
              style={styles.selectInput}
            >
              <option value="all">Todos los canales de venta</option>
              <option value="web">Canal Web Oficial (Portal)</option>
              <option value="app">Aplicación Móvil (iOS / Android)</option>
              <option value="agent">Agente Presencial / Counter / Call</option>
            </select>
            <ChevronDown size={14} color="#64748b" style={styles.selectCaret} />
          </div>
        </div>

        {/* 4. Agente Asignado */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>
            <User size={13} color="#10b981" />
            <span>Agente Operacional / Ventas:</span>
          </label>
          <div style={styles.selectWrapper}>
            <select 
              value={filters.agentId} 
              onChange={(e) => setFilters({ ...filters, agentId: e.target.value })}
              style={styles.selectInput}
            >
              <option value="all">Todos los agentes del personal</option>
              {agents.map(ag => (
                <option key={ag.id} value={ag.id}>
                  {ag.full_name || ag.nombre} ({ag.role_label || ag.role})
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="#64748b" style={styles.selectCaret} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '22px',
    padding: '18px 24px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    width: '100%'
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filterIconCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.01em'
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  activeCounterPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    border: '1px solid #bfdbfe',
    borderRadius: '9999px',
    padding: '5px 12px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1e6bff'
  },
  counterResults: {
    fontWeight: '500',
    color: '#3b82f6'
  },
  allResultsBadge: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500'
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '9999px',
    padding: '7px 16px',
    fontSize: '0.78125rem',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  selectInput: {
    appearance: 'none',
    width: '100%',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '9px 32px 9px 12px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  selectCaret: {
    position: 'absolute',
    right: '10px',
    pointerEvents: 'none'
  },
  customDateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },
  datePicker: {
    flex: 1,
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.75rem',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  }
};
