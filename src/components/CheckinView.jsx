import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Luggage,
  Settings2
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

export default function CheckinView() {
  const { filteredCheckins, passengers, flights, openManageModal } = useOperations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const localFiltered = filteredCheckins.filter(c => {
    const status = c.estado || c.status;
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const pax = passengers.find(p => p.id === (c.pasajero_id || c.passenger_id));
      const fl = flights.find(f => f.id === (c.vuelo_id || c.flight_id));
      const matchPax = pax && (pax.nombre || pax.full_name || '').toLowerCase().includes(q);
      const matchSeat = (c.seat || '').toLowerCase().includes(q);
      const matchFlight = fl && fl.flight_number.toLowerCase().includes(q);
      if (!matchPax && !matchSeat && !matchFlight) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'boarded':
        return { label: 'Abordado', bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'completed':
        return { label: 'Pasabordo Emitido', bg: '#eff6ff', text: '#1e6bff', border: '#bfdbfe' };
      case 'document_issue':
        return { label: 'Problema Documentos', bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
      case 'not_authorized':
        return { label: 'No Autorizado (Pendiente)', bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      case 'denied':
        return { label: 'Denegado en Seguridad', bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
      case 'cancelled':
        return { label: 'Cancelado', bg: '#fef2f2', text: '#991b1b', border: '#f87171' };
      case 'gate_issue':
        return { label: 'Novedad en Puerta', bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
      default:
        return { label: 'En Proceso', bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Operaciones de Mostrador, Seguridad y Embarque</h2>
          <p style={styles.subtitle}>
            Inspección de equipajes, control migratorio y estado de abordaje en salas
          </p>
        </div>
        <div style={styles.headerBadge}>
          <ShieldAlert size={14} color="#ef4444" />
          <span>
            {localFiltered.filter(c => {
              const st = c.estado || c.status;
              const sec = c.seguridad || c.security_result;
              return (st === 'not_authorized' || sec === 'not_authorized' || st === 'document_issue' || st === 'gate_issue') &&
                     st !== 'denied' && st !== 'cancelled' && st !== 'boarded' && st !== 'completed';
            }).length} incidencias activas
          </span>
        </div>
      </div>

      <div style={styles.controlsRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Buscar por pasajero, asiento o vuelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Todos los estados de check-in</option>
          <option value="boarded">Abordados</option>
          <option value="completed">Pasabordo emitido</option>
          <option value="document_issue">Novedad de documentos</option>
          <option value="not_authorized">No autorizados (pendientes)</option>
          <option value="denied">Denegados en seguridad</option>
          <option value="cancelled">Cancelados</option>
          <option value="gate_issue">Novedad en puerta</option>
          <option value="pending">En proceso</option>
        </select>
      </div>

      <div style={styles.tableCard} className="ui-card">
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Pasajero</th>
              <th style={styles.th}>Vuelo & Asiento</th>
              <th style={styles.th}>Equipaje Facturado</th>
              <th style={styles.th}>Filtro de Seguridad</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {localFiltered.map(chk => {
              const pax = passengers.find(p => p.id === (chk.pasajero_id || chk.passenger_id)) || { full_name: 'Pasajero' };
              const fl = flights.find(f => f.id === (chk.vuelo_id || chk.flight_id)) || { flight_number: 'AV-8210', origin: 'MDE', destination: 'BOG' };
              const status = chk.estado || chk.status;
              const statusStyle = getStatusBadge(status);
              const isSecurityNotAuth = (chk.seguridad || chk.security_result) === 'not_authorized';
              const isDocIssue = status === 'document_issue';
              const isBoarded = status === 'boarded' || (chk.stage || chk.etapa) === 'Abordado';
              const isDenied = status === 'denied';
              const isCancelled = status === 'cancelled';

              return (
                <tr key={chk.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div>
                      <p style={styles.paxName}>{pax.nombre || pax.full_name}</p>
                      <span style={styles.docSub}>{pax.documento || pax.document_number}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>
                      <p style={styles.flightCode}>{fl.flight_number} ({fl.origin} → {fl.destination})</p>
                      <span style={styles.seatTag}>Asiento: {chk.seat}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.baggageCell}>
                      <Luggage size={14} color="#64748b" />
                      <span>{chk.peso_kg != null ? `${chk.peso_kg} kg` : `${chk.baggage_count || 1} maleta`}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.secBadge,
                      backgroundColor: isDenied ? '#fef2f2' : isSecurityNotAuth ? '#fff1f2' : '#ecfdf5',
                      color: isDenied ? '#dc2626' : isSecurityNotAuth ? '#b91c1c' : '#047857'
                    }}>
                      {isDenied ? (
                        <>
                          <ShieldAlert size={12} color="#dc2626" />
                          Denegado
                        </>
                      ) : isSecurityNotAuth ? (
                        <>
                          <ShieldAlert size={12} color="#b91c1c" />
                          No Autorizado
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={12} color="#047857" />
                          Autorizado
                        </>
                      )}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      borderColor: statusStyle.border
                    }}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {isBoarded ? (
                      <span style={styles.okTag}>✓ Abordado</span>
                    ) : isDenied ? (
                      <span style={styles.deniedTag}>✕ Denegado en seguridad</span>
                    ) : isCancelled ? (
                      <span style={styles.cancelledTag}>✕ Cancelado</span>
                    ) : (
                      <button
                        onClick={() => openManageModal(chk)}
                        style={{
                          ...styles.resolveBtn,
                          backgroundColor: isSecurityNotAuth ? '#ef4444' : isDocIssue ? '#f59e0b' : '#1e6bff'
                        }}
                      >
                        <Settings2 size={12} />
                        Gestionar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    padding: '8px 14px',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '700'
  },
  controlsRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
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
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '16px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHead: {
    borderBottom: '1px solid #e8ecf2'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.84rem'
  },
  paxName: {
    fontWeight: '700',
    color: '#0f172a'
  },
  docSub: {
    fontSize: '0.6875rem',
    color: '#94a3b8'
  },
  flightCode: {
    fontWeight: '700',
    color: '#0f172a'
  },
  seatTag: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#1e6bff'
  },
  baggageCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#475569',
    fontSize: '0.8125rem'
  },
  secBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.71875rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '9999px'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.71875rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid transparent'
  },
  resolveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '5px 12px',
    fontSize: '0.71875rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  okTag: {
    fontSize: '0.71875rem',
    color: '#10b981',
    fontWeight: '700'
  },
  deniedTag: {
    fontSize: '0.71875rem',
    color: '#dc2626',
    fontWeight: '700',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '3px 8px',
    borderRadius: '9999px'
  },
  cancelledTag: {
    fontSize: '0.71875rem',
    color: '#991b1b',
    fontWeight: '700',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    padding: '3px 8px',
    borderRadius: '9999px'
  }
};
