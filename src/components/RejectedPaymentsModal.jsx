import React from 'react';
import { X, AlertTriangle, CheckCircle, RefreshCw, XCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { formatCOP } from '../utils/kpis';

export default function RejectedPaymentsModal({ 
  isOpen, 
  onClose, 
  bookings = [], 
  passengers = [], 
  flights = [],
  onUpdateBookingStatus 
}) {
  if (!isOpen) return null;

  const rejectedBookings = bookings.filter(b => b.status === 'payment_rejected');

  const handleApprovePayment = (bookingId) => {
    onUpdateBookingStatus(bookingId, 'paid', 'Tiquete emitido');
  };

  const handleExpireBooking = (bookingId) => {
    onUpdateBookingStatus(bookingId, 'expired', 'Venta no concretada');
  };

  return (
    <div style={styles.overlay} className="modal-overlay" onClick={onClose}>
      <div style={styles.modal} className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleArea}>
            <div style={styles.iconCircle}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <h3 style={styles.title}>Revisión de Pagos Rechazados</h3>
              <p style={styles.subtitle}>
                {rejectedBookings.length} transacciones declinadas en pasarela requieren atención operativa
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Content list */}
        <div style={styles.body}>
          {rejectedBookings.length === 0 ? (
            <div style={styles.emptyContainer}>
              <CheckCircle size={40} color="#10b981" />
              <h4 style={styles.emptyTitle}>¡Sin Pagos Rechazados Pendientes!</h4>
              <p style={styles.emptyDesc}>
                Todas las reservas en el sistema han sido conciliadas o gestionadas con éxito.
              </p>
            </div>
          ) : (
            <div style={styles.list}>
              {rejectedBookings.map((b) => {
                const pax = passengers.find(p => p.id === b.passenger_id) || { full_name: 'Pasajero' };
                const fl = flights.find(f => f.id === b.flight_id) || { flight_number: 'AV-8210', origin: 'MDE', destination: 'BOG' };

                return (
                  <div key={b.id} style={styles.cardItem}>
                    <div style={styles.cardHeader}>
                      <div style={styles.pnrTag}>
                        <CreditCard size={14} color="#ef4444" />
                        <span>PNR: {b.pnr}</span>
                      </div>
                      <span style={styles.amountBadge}>{formatCOP(b.amount)}</span>
                    </div>

                    <div style={styles.infoGrid}>
                      <div>
                        <span style={styles.infoLabel}>Pasajero:</span>
                        <p style={styles.infoVal}>{pax.full_name}</p>
                        <p style={styles.infoSub}>{pax.email || 'correo@ejemplo.com'}</p>
                      </div>
                      <div>
                        <span style={styles.infoLabel}>Itinerario:</span>
                        <p style={styles.infoVal}>{fl.flight_number} ({fl.origin} → {fl.destination})</p>
                        <p style={styles.infoSub}>Clase {b.cabin_class} · Pasarela: {b.payment_gateway || 'PSE'}</p>
                      </div>
                    </div>

                    <div style={styles.alertDetailBox}>
                      <AlertTriangle size={15} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={styles.alertDetailText}>
                        <strong>Motivo de rechazo:</strong> Declinación por sospecha de fraude o cupo insuficiente en banco emisor. Pasajero solicitó reautorización vía call center.
                      </p>
                    </div>

                    <div style={styles.actionRow}>
                      <button 
                        onClick={() => handleExpireBooking(b.id)}
                        style={styles.btnExpire}
                        title="Liberar asiento y marcar como expirado"
                      >
                        <XCircle size={15} />
                        <span>Liberar Cupo</span>
                      </button>

                      <button 
                        onClick={() => handleApprovePayment(b.id)}
                        style={styles.btnApprove}
                        title="Aprobar pago manualmente y emitir tiquete electrónico"
                      >
                        <CheckCircle size={15} />
                        <span>Aprobar y Emitir Tiquete (Paid)</span>
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
            💡 Al aprobar una reserva a <strong>'Paid'</strong>, los <em>Ingresos Totales</em> y la <em>Tasa de Conversión</em> se actualizarán de inmediato en el Dashboard.
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
    backgroundColor: '#fef2f2',
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
    border: '1px solid #fecaca',
    borderRadius: '18px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  pnrTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '8px'
  },
  amountBadge: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a'
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
  alertDetailBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: '#fff5f5',
    padding: '10px 14px',
    borderRadius: '12px',
    marginBottom: '14px'
  },
  alertDetailText: {
    fontSize: '0.75rem',
    color: '#991b1b',
    lineHeight: 1.4
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  btnExpire: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '8px 14px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnApprove: {
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
