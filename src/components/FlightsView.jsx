import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Users, 
  UserCheck, 
  ArrowRight, 
  Zap, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function FlightsView({ 
  flights = [], 
  agents = [], 
  bookings = [], 
  checkins = [],
  onOpenReassignModal 
}) {
  const [flightSearch, setFlightSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredFlights = flights.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (flightSearch.trim()) {
      const q = flightSearch.toLowerCase();
      const matchNum = f.flight_number.toLowerCase().includes(q);
      const matchCity = f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
      if (!matchNum && !matchCity) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'boarding':
        return { label: 'Abordando', bg: '#eff6ff', text: '#1e6bff', border: '#bfdbfe' };
      case 'delayed':
        return { label: 'Demorado', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      case 'departed':
        return { label: 'En Vuelo / Salido', bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      default:
        return { label: 'Programado', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Vuelos Activos y Asignación de Salas</h2>
          <p style={styles.subtitle}>
            Control de itinerarios en la red troncal nacional (MDE, BOG, CLO, CTG, BAQ, SMR, ADZ, PEI)
          </p>
        </div>
        <button 
          onClick={onOpenReassignModal}
          style={styles.reassignBtn}
        >
          <Zap size={16} />
          <span>Reasignar Personal de Vuelo</span>
        </button>
      </div>

      {/* Filters row */}
      <div style={styles.controlsRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Buscar por número de vuelo o ciudad (ej. AV-8210, MDE, BOG)..."
            value={flightSearch}
            onChange={(e) => setFlightSearch(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="all">Todos los estados</option>
            <option value="boarding">Abordando</option>
            <option value="scheduled">Programados</option>
            <option value="delayed">Demorados</option>
            <option value="departed">Salidos</option>
          </select>
        </div>
      </div>

      {/* Flights Grid */}
      <div style={styles.flightsGrid}>
        {filteredFlights.map(flight => {
          const checkinAgent = agents.find(a => a.id === flight.assigned_checkin_agent_id);
          const gateAgent = agents.find(a => a.id === flight.assigned_gate_agent_id);
          const flightBookings = bookings.filter(b => b.flight_id === flight.id || b.vuelo_id === flight.id);
          const flightCheckins = checkins.filter(c => c.flight_id === flight.id || c.vuelo_id === flight.id);
          const boardedCount = flightCheckins.filter(c => c.status === 'boarded' || c.estado === 'boarded').length;
          const statusStyle = getStatusBadge(flight.status);
          const occupancy = Math.round((flightBookings.length / (flight.capacity || 150)) * 100);

          return (
            <div key={flight.id} style={styles.flightCard} className="ui-card">
              {/* Card top */}
              <div style={styles.cardHeader}>
                <div style={styles.flightCodeGroup}>
                  <div style={styles.flightIcon}>
                    <Plane size={18} color="#1e6bff" />
                  </div>
                  <div>
                    <h3 style={styles.flightNumber}>{flight.flight_number}</h3>
                    <span style={styles.airlineLabel}>{flight.airline || 'AeroAndina'}</span>
                  </div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                  borderColor: statusStyle.border
                }}>
                  {statusStyle.label}
                </span>
              </div>

              {/* Route & Times */}
              <div style={styles.routeBox}>
                <div style={styles.cityPoint}>
                  <span style={styles.airportCode}>{flight.origin}</span>
                  <span style={styles.timeLabel}>{flight.departure_time}</span>
                </div>
                <div style={styles.flightPath}>
                  <span style={styles.durationTag}>{flight.duration || '1h 05m'}</span>
                  <div style={styles.pathLine}>
                    <div style={styles.pathDot} />
                    <div style={styles.pathBar} />
                    <Plane size={12} color="#94a3b8" style={{ transform: 'rotate(90deg)' }} />
                    <div style={styles.pathBar} />
                    <div style={styles.pathDot} />
                  </div>
                </div>
                <div style={styles.cityPoint}>
                  <span style={styles.airportCode}>{flight.destination}</span>
                  <span style={styles.timeLabel}>{flight.arrival_time}</span>
                </div>
              </div>

              {/* Occupancy Progress */}
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Ocupación / Abordaje:</span>
                  <span style={styles.progressValue}>
                    <strong>{boardedCount}</strong> abordados de {flightBookings.length} reservas ({occupancy}%)
                  </span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${Math.min(occupancy, 100)}%`,
                    backgroundColor: occupancy > 85 ? '#10b981' : '#1e6bff'
                  }} />
                </div>
              </div>

              {/* Operational Assignment Info */}
              <div style={styles.assignmentBox}>
                <div style={styles.assignRow}>
                  <span style={styles.assignRole}>Mostrador / Check-in:</span>
                  <span style={styles.assignVal}>
                    {flight.counter} · <strong>{checkinAgent?.full_name || 'Sin asignar'}</strong>
                  </span>
                </div>
                <div style={styles.assignRow}>
                  <span style={styles.assignRole}>Puerta de Embarque:</span>
                  <span style={styles.assignVal}>
                    {flight.gate} · <strong>{gateAgent?.full_name || 'Sin asignar'}</strong>
                  </span>
                </div>
              </div>

              {/* Quick action button on flight */}
              <button 
                onClick={onOpenReassignModal}
                style={styles.flightActionBtn}
              >
                <Zap size={14} />
                <span>Reasignar Mostrador / Puerta</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '0.84rem',
    color: '#64748b'
  },
  reassignBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(30, 107, 255, 0.3)'
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '9px 18px',
    flex: 1,
    minWidth: '280px'
  },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: '0.84rem',
    width: '100%'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  select: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '9px 16px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer'
  },
  flightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px'
  },
  flightCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '22px',
    border: '1px solid #e8ecf2',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  flightCodeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  flightIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flightNumber: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  airlineLabel: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#64748b'
  },
  statusBadge: {
    fontSize: '0.71875rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid transparent'
  },
  routeBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #f1f5f9'
  },
  cityPoint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  airportCode: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  timeLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b'
  },
  flightPath: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '0 14px'
  },
  durationTag: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: '4px'
  },
  pathLine: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center'
  },
  pathDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8'
  },
  pathBar: {
    flex: 1,
    height: '1px',
    backgroundColor: '#cbd5e1'
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.75rem'
  },
  progressLabel: {
    color: '#64748b'
  },
  progressValue: {
    color: '#0f172a'
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.4s ease'
  },
  assignmentBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px'
  },
  assignRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  assignRole: {
    color: '#64748b'
  },
  assignVal: {
    color: '#0f172a'
  },
  flightActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};
