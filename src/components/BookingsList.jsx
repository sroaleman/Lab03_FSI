import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Plane, 
  RotateCcw,
  Check,
  AlertCircle,
  Settings2
} from 'lucide-react';
import { formatCOP } from '../utils/kpis';
import { useOperations } from '../context/OperationsContext';

export default function BookingsList({ 
  bookings = [], 
  passengers = [], 
  flights = [],
  onOpenRejectedModal 
}) {
  const { openManageBookingModal } = useOperations();
  const [period, setPeriod] = useState('Mes');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [filterRoute, setFilterRoute] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter bookings locally by period and dropdowns
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const flight = flights.find(f => f.id === (b.flight_id || b.vuelo_id));
      if (filterRoute !== 'all' && flight) {
        if (`${flight.origin}-${flight.destination}` !== filterRoute) return false;
      }
      if (filterClass !== 'all' && b.cabin_class !== filterClass) return false;
      const status = b.estado || b.status;
      if (filterStatus !== 'all' && status !== filterStatus) return false;
      
      // Period filter
      if (period === 'Hoy') {
        const bDate = (b.fecha || b.created_at || '').slice(0, 10);
        if (bDate !== '2026-10-19') return false;
      } else if (period === 'Semana') {
        const bDate = new Date(b.fecha || b.created_at || '2026-10-19');
        const diff = (new Date('2026-10-19') - bDate) / (1000 * 60 * 60 * 24);
        if (diff > 7) return false;
      }

      return true;
    });
  }, [bookings, flights, filterRoute, filterClass, filterStatus, period]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return { label: 'Pagado', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'payment_rejected':
        return { label: 'Pago Rechazado', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      case 'seat_held':
        return { label: 'Cupo Bloqueado', bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
      case 'expired':
        return { label: 'Expirado', bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      default:
        return { label: status, bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const getClassBadge = (cabinClass) => {
    switch (cabinClass) {
      case 'Business':
        return { bg: '#fffbeb', text: '#b45309' };
      case 'Premium':
        return { bg: '#f5f3ff', text: '#7c3aed' };
      default:
        return { bg: '#eff6ff', text: '#1e6bff' };
    }
  };

  return (
    <div style={styles.card} className="ui-card">
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Todas las reservas</h3>
          <p style={styles.subtitle}>
            {filteredBookings.length} reservas registradas · Moneda oficial en Pesos Colombianos (COP)
          </p>
        </div>

        {/* Period Selector Dropdown */}
        <div style={styles.periodWrapper}>
          <div 
            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            style={styles.periodPill}
          >
            <Calendar size={15} color="#1e6bff" />
            <span style={styles.periodText}>{period}</span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {isPeriodOpen && (
            <div style={styles.periodMenu}>
              {['Hoy', 'Semana', 'Mes'].map(opt => (
                <button
                  key={opt}
                  onClick={() => { setPeriod(opt); setIsPeriodOpen(false); }}
                  style={{
                    ...styles.periodOption,
                    fontWeight: period === opt ? '700' : '500',
                    color: period === opt ? '#1e6bff' : '#334155'
                  }}
                >
                  <span>{opt}</span>
                  {period === opt && <Check size={14} color="#1e6bff" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Dropdowns row */}
      <div style={styles.filtersRow}>
        <div style={styles.selectWrapper}>
          <select 
            value={filterRoute} 
            onChange={(e) => setFilterRoute(e.target.value)}
            style={styles.selectPill}
          >
            <option value="all">Todas las rutas</option>
            <option value="MDE-BOG">MDE → BOG</option>
            <option value="BOG-CTG">BOG → CTG</option>
            <option value="MDE-CTG">MDE → CTG</option>
            <option value="BOG-CLO">BOG → CLO</option>
            <option value="CLO-MDE">CLO → MDE</option>
            <option value="BOG-BAQ">BOG → BAQ</option>
            <option value="MDE-SMR">MDE → SMR</option>
            <option value="BOG-ADZ">BOG → ADZ</option>
          </select>
          <ChevronDown size={14} color="#64748b" style={styles.selectIcon} />
        </div>

        <div style={styles.selectWrapper}>
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            style={styles.selectPill}
          >
            <option value="all">Clase de Cabina</option>
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="Premium">Premium</option>
          </select>
          <ChevronDown size={14} color="#64748b" style={styles.selectIcon} />
        </div>

        <div style={styles.selectWrapper}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.selectPill}
          >
            <option value="all">Estado: Todos</option>
            <option value="paid">Pagadas (Exitosas)</option>
            <option value="payment_rejected">Pago Rechazado</option>
            <option value="seat_held">Cupo Bloqueado</option>
            <option value="expired">Expiradas</option>
          </select>
          <ChevronDown size={14} color="#64748b" style={styles.selectIcon} />
        </div>

        {(filterRoute !== 'all' || filterClass !== 'all' || filterStatus !== 'all' || period !== 'Mes') && (
          <button 
            onClick={() => {
              setFilterRoute('all');
              setFilterClass('all');
              setFilterStatus('all');
              setPeriod('Mes');
            }}
            style={styles.resetFilterBtn}
            title="Restablecer filtros de tabla"
          >
            <RotateCcw size={13} />
            <span>Restablecer</span>
          </button>
        )}
      </div>

      {/* Ticket Cards List */}
      <div style={styles.listContainer}>
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertCircle size={28} color="#94a3b8" />
            <p>No se encontraron reservas con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const passenger = passengers.find(p => p.id === (b.passenger_id || b.pasajero_id)) || { full_name: 'Pasajero Registrado' };
            const flight = flights.find(f => f.id === (b.flight_id || b.vuelo_id)) || {
              flight_number: 'AV-8210',
              origin: 'MDE',
              destination: 'BOG',
              departure_time: '09:48',
              arrival_time: '10:45',
              duration: '0h 57m'
            };

            const status = b.estado || b.status;
            const amount = b.monto != null ? b.monto : b.amount;
            const statusStyle = getStatusBadge(status);
            const classStyle = getClassBadge(b.cabin_class);

            return (
              <div key={b.id} style={styles.bookingRow}>
                {/* Airline & Flight code */}
                <div style={styles.flightMetaCol}>
                  <div style={styles.flightLogoCircle}>
                    <Plane size={16} color="#1e6bff" />
                  </div>
                  <div style={styles.flightInfo}>
                    <div style={styles.airlineHeader}>
                      <span style={styles.airlineName}>AeroAndina</span>
                      <span style={{
                        ...styles.classTag,
                        backgroundColor: classStyle.bg,
                        color: classStyle.text
                      }}>
                        {b.cabin_class}
                      </span>
                    </div>
                    <span style={styles.flightSubtext}>
                      #{flight.flight_number} · PNR: <strong>{b.pnr}</strong>
                    </span>
                  </div>
                </div>

                {/* Route & Times Timeline */}
                <div style={styles.routeCol}>
                  <div style={styles.depPoint}>
                    <span style={styles.timeVal}>{flight.departure_time}</span>
                    <span style={styles.cityCode}>{flight.origin}</span>
                  </div>

                  {/* Flight line with duration */}
                  <div style={styles.flightLineWrapper}>
                    <span style={styles.durationLabel}>{flight.duration || '1h 05m'} · Directo</span>
                    <div style={styles.flightLine}>
                      <div style={styles.dotLeft} />
                      <div style={styles.lineDash} />
                      <Plane size={13} color="#94a3b8" style={{ margin: '0 4px', transform: 'rotate(90deg)' }} />
                      <div style={styles.lineDash} />
                      <div style={styles.dotRight} />
                    </div>
                  </div>

                  <div style={styles.arrPoint}>
                    <span style={styles.timeVal}>{flight.arrival_time}</span>
                    <span style={styles.cityCode}>{flight.destination}</span>
                  </div>
                </div>

                {/* Amount in COP and Passenger */}
                <div style={styles.priceCol}>
                  <span style={styles.priceVal}>{formatCOP(amount)}</span>
                  <span style={styles.paxName} title={passenger.nombre || passenger.full_name}>
                    {passenger.nombre || passenger.full_name}
                  </span>
                </div>

                {/* Status Badge & Action */}
                <div style={styles.actionCol}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    borderColor: statusStyle.border
                  }}>
                    {statusStyle.label}
                  </span>

                  {(status === 'seat_held' || status === 'payment_rejected') ? (
                    <button 
                      onClick={() => openManageBookingModal(b)}
                      style={{
                        ...styles.manageBtn,
                        backgroundColor: status === 'payment_rejected' ? '#ef4444' : '#f59e0b'
                      }}
                      title="Gestionar reserva comercial"
                    >
                      <Settings2 size={12} />
                      <span>Gestionar</span>
                    </button>
                  ) : status === 'paid' ? (
                    <span style={styles.okTag}>✓ Tiquete Emitido</span>
                  ) : (
                    <span style={styles.expiredTag}>Expirado</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
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
    marginTop: '2px'
  },
  periodWrapper: {
    position: 'relative'
  },
  periodPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer'
  },
  periodText: {
    fontSize: '0.8125rem',
    fontWeight: '600'
  },
  periodMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    width: '130px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    padding: '6px',
    zIndex: 100
  },
  periodOption: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.8125rem'
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
    flexWrap: 'wrap'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  selectPill: {
    appearance: 'none',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '7px 32px 7px 14px',
    fontSize: '0.78125rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  selectIcon: {
    position: 'absolute',
    right: '12px',
    pointerEvents: 'none'
  },
  resetFilterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#1e6bff',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 10px'
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    maxHeight: '480px',
    paddingRight: '4px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '10px',
    color: '#94a3b8',
    fontSize: '0.875rem'
  },
  bookingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    backgroundColor: '#ffffff',
    border: '1px solid #e8ecf2',
    borderRadius: '18px',
    transition: 'all 0.2s ease',
    gap: '14px'
  },
  flightMetaCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '180px'
  },
  flightLogoCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  flightInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  airlineHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  airlineName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  classTag: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '1px 7px',
    borderRadius: '9999px'
  },
  flightSubtext: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  routeCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    justifyContent: 'center',
    maxWidth: '260px'
  },
  depPoint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  arrPoint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  timeVal: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  cityCode: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#64748b'
  },
  flightLineWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '110px'
  },
  durationLabel: {
    fontSize: '0.625rem',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '2px'
  },
  flightLine: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center'
  },
  dotLeft: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8'
  },
  dotRight: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8'
  },
  lineDash: {
    flex: 1,
    height: '1px',
    backgroundColor: '#cbd5e1'
  },
  priceCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '130px'
  },
  priceVal: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  paxName: {
    fontSize: '0.75rem',
    color: '#64748b',
    maxWidth: '140px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  actionCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid transparent',
    whiteSpace: 'nowrap'
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  manageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '5px 12px',
    fontSize: '0.71875rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease'
  },
  okTag: {
    fontSize: '0.71875rem',
    color: '#10b981',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  expiredTag: {
    fontSize: '0.71875rem',
    color: '#94a3b8',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  }
};
