import React from 'react';
import { X, ShieldAlert, CheckCircle, ShieldCheck, AlertTriangle, UserX, UserCheck, Plane } from 'lucide-react';

export default function SecurityIncidentsModal({ 
  isOpen, 
  onClose, 
  checkins = [], 
  passengers = [], 
  flights = [],
  onResolveCheckin 
}) {
  if (!isOpen) return null;

  const incidents = checkins.filter(
    c => c.status === 'not_authorized' || 
         c.security_result === 'not_authorized' || 
         c.status === 'document_issue'
  );

  const handleAuthorize = (checkinId) => {
    onResolveCheckin(checkinId, {
      status: 'completed',
      security_result: 'authorized',
      document_status: 'verified',
      incident_detail: 'Inspección completada por supervisión. Pasajero autorizado para abordaje.'
    });
  };

  const handleConfirmBlock = (checkinId) => {
    onResolveCheckin(checkinId, {
      status: 'not_authorized',
      security_result: 'not_authorized',
      incident_detail: 'Bloqueo ratificado. Caso transferido a Policía Aeroportuaria y Migración.'
    });
  };

  return (
    <div style={styles.overlay} className="modal-overlay" onClick={onClose}>
      <div style={styles.modal} className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleArea}>
            <div style={styles.iconCircle}>
              <ShieldAlert size={20} color="#ef4444" />
            </div>
            <div>
              <h3 style={styles.title}>Centro de Control de Seguridad y Documentos</h3>
              <p style={styles.subtitle}>
                {incidents.length} pasajeros retenidos en filtros o con novedades de identidad
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Incidents list */}
        <div style={styles.body}>
          {incidents.length === 0 ? (
            <div style={styles.emptyContainer}>
              <ShieldCheck size={40} color="#10b981" />
              <h4 style={styles.emptyTitle}>¡Filtros y Salas de Abordaje Despejados!</h4>
              <p style={styles.emptyDesc}>
                No hay alertas activas de seguridad ni problemas de documentación sin resolver en este momento.
              </p>
            </div>
          ) : (
            <div style={styles.list}>
              {incidents.map((chk) => {
                const pax = passengers.find(p => p.id === chk.passenger_id) || { full_name: 'Pasajero' };
                const fl = flights.find(f => f.id === chk.flight_id) || { flight_number: 'AV-8210', origin: 'MDE', destination: 'BOG' };
                const isSecurity = chk.status === 'not_authorized' || chk.security_result === 'not_authorized';

                return (
                  <div 
                    key={chk.id} 
                    style={{
                      ...styles.cardItem,
                      borderColor: isSecurity ? '#fca5a5' : '#fcd34d'
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={{
                        ...styles.badge,
                        backgroundColor: isSecurity ? '#fee2e2' : '#fef3c7',
                        color: isSecurity ? '#b91c1c' : '#b45309'
                      }}>
                        {isSecurity ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                        <span>{isSecurity ? 'ALERTA DE SEGURIDAD' : 'PROBLEMA DOCUMENTAL'}</span>
                      </div>
                      <span style={styles.seatBadge}>Asiento: {chk.seat} · Vuelo: {fl.flight_number}</span>
                    </div>

                    <div style={styles.infoGrid}>
                      <div>
                        <span style={styles.infoLabel}>Pasajero:</span>
                        <p style={styles.infoVal}>{pax.full_name}</p>
                        <p style={styles.infoSub}>
                          {pax.document_type}: {pax.document_number} · Tier: {pax.frequent_flyer_tier}
                        </p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>Ruta y Puerta:</span>
                        <p style={styles.infoVal}>{fl.origin} → {fl.destination}</p>
                        <p style={styles.infoSub}>{fl.gate} · Salida: {fl.departure_time}</p>
                      </div>
                    </div>

                    {/* Incident detail description */}
                    <div style={{
                      ...styles.detailBox,
                      backgroundColor: isSecurity ? '#fff5f5' : '#fffbeb'
                    }}>
                      <p style={{
                        ...styles.detailText,
                        color: isSecurity ? '#991b1b' : '#92400e'
                      }}>
                        <strong>Reporte oficial:</strong> {chk.incident_detail || 'Novedad pendiente de tipificación en mostrador.'}
                      </p>
                    </div>

                    {/* Quick operational decision buttons */}
                    <div style={styles.actionRow}>
                      <button 
                        onClick={() => handleConfirmBlock(chk.id)}
                        style={styles.btnBlock}
                        title="Mantener restricción y notificar policía aeroportuaria"
                      >
                        <UserX size={15} />
                        <span>Ratificar Bloqueo</span>
                      </button>

                      <button 
                        onClick={() => handleAuthorize(chk.id)}
                        style={styles.btnAuthorize}
                        title="Aclarar novedad, autorizar abordaje y emitir pasabordo"
                      >
                        <UserCheck size={15} />
                        <span>Autorizar Abordaje (Superado)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.hintText}>
            🛡️ Al autorizar a un pasajero, los contadores de <em>'No autorizados'</em> y <em>'Rechazos por documentos'</em> se actualizarán de forma reactiva.
          </p>
          <button onClick={onClose} style={styles.closeModalBtn}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    maxWidth: '680px',
    width: '100%',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    border: '1px solid #e8ecf2'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9'
  },
  headerTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  closeBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    padding: '20px 24px',
    overflowY: 'auto',
    maxHeight: 'calc(85vh - 140px)'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    gap: '12px'
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  emptyDesc: {
    fontSize: '0.8125rem',
    color: '#64748b',
    maxWidth: '380px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cardItem: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '18px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.71875rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '8px',
    letterSpacing: '0.04em'
  },
  seatBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '12px'
  },
  infoLabel: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  infoVal: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  infoSub: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  detailBox: {
    padding: '10px 14px',
    borderRadius: '12px',
    marginBottom: '14px'
  },
  detailText: {
    fontSize: '0.75rem',
    lineHeight: 1.4
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  btnBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '8px 14px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  btnAuthorize: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#10b981',
    border: 'none',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc'
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#475569',
    flex: 1,
    marginRight: '12px'
  },
  closeModalBtn: {
    padding: '8px 18px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
