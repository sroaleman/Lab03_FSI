import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ArrowRight,
  User,
  Plane,
  Tag,
  Clock
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { formatCOP } from '../utils/kpis';

export default function BookingActionModal() {
  const {
    managingBooking,
    closeManageBookingModal,
    manageBooking,
    passengers,
    flights
  } = useOperations();

  if (!managingBooking) return null;

  const b = managingBooking;
  const pax = passengers.find(p => p.id === (b.passenger_id || b.pasajero_id)) || {};
  const fl = flights.find(f => f.id === (b.flight_id || b.vuelo_id)) || {};

  const status = b.estado || b.status || 'seat_held';
  const amount = Number(b.monto != null ? b.monto : b.amount) || 0;

  const isSeatHeld = status === 'seat_held';
  const isPaymentRejected = status === 'payment_rejected';
  const isPaid = status === 'paid';
  const isExpired = status === 'expired';

  const paxName = pax.nombre || pax.full_name || 'Pasajero';
  const flightNum = fl.flight_number || fl.numero || '—';
  const route = fl.origin && fl.destination ? `${fl.origin} → ${fl.destination}` : '';

  return (
    <>
      <div style={s.backdrop} onClick={closeManageBookingModal} />
      <div style={s.modal} role="dialog" aria-modal="true" aria-labelledby="modal-booking-title">
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={{
              ...s.iconWrapper,
              backgroundColor: isPaymentRejected ? '#fef2f2' : isSeatHeld ? '#fffbeb' : '#ecfdf5'
            }}>
              {isPaymentRejected ? (
                <CreditCard size={22} color="#ef4444" />
              ) : isSeatHeld ? (
                <Clock size={22} color="#f59e0b" />
              ) : (
                <CheckCircle2 size={22} color="#10b981" />
              )}
            </div>
            <div>
              <h2 id="modal-booking-title" style={s.title}>Gestionar Reserva {b.pnr}</h2>
              <p style={s.subtitle}>Acciones del proceso de venta y recaudos</p>
            </div>
          </div>
          <button onClick={closeManageBookingModal} style={s.closeBtn} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Booking Summary Card */}
        <div style={s.infoCard}>
          <div style={s.infoCol}>
            <User size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Pasajero</span>
              <span style={s.infoValue}>{paxName}</span>
              <span style={s.infoSub}>PNR: {b.pnr}</span>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoCol}>
            <Plane size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Vuelo & Clase</span>
              <span style={s.infoValue}>{flightNum}</span>
              <span style={s.infoSub}>{route} · {b.cabin_class || 'Economy'}</span>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoCol}>
            <Tag size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Monto (COP)</span>
              <span style={s.priceValue}>{formatCOP(amount)}</span>
              <span style={s.infoSub}>Canal: {b.canal || b.booking_channel || 'web'}</span>
            </div>
          </div>
        </div>

        {/* Current status notifications */}
        {isPaid && (
          <div style={s.statusSuccessBox}>
            <CheckCircle2 size={18} color="#047857" />
            <span>Esta reserva se encuentra confirmada y pagada en su totalidad.</span>
          </div>
        )}

        {isExpired && (
          <div style={s.statusExpiredBox}>
            <XCircle size={18} color="#64748b" />
            <span>Esta reserva ha expirado. El cupo se encuentra liberado para la venta.</span>
          </div>
        )}

        {/* Actions for seat_held */}
        {isSeatHeld && (
          <div style={s.actionsSection}>
            <p style={s.actionsLabel}>Opciones para cupo bloqueado</p>

            <button
              style={{ ...s.actionBtn, ...s.payBtn }}
              onClick={() => manageBooking(b.id, 'mark_paid')}
            >
              <div style={s.actionLeft}>
                <CheckCircle2 size={18} color="#047857" />
                <div>
                  <span style={s.actionTitle}>Marcar como pagada</span>
                  <span style={s.actionDesc}>Registra el pago confirmado, emite el tiquete (status = paid) y suma a ingresos</span>
                </div>
              </div>
              <ArrowRight size={16} color="#047857" />
            </button>

            <button
              style={{ ...s.actionBtn, ...s.expireBtn }}
              onClick={() => manageBooking(b.id, 'mark_expired')}
            >
              <div style={s.actionLeft}>
                <XCircle size={18} color="#64748b" />
                <div>
                  <span style={s.actionTitle}>Marcar como expirada</span>
                  <span style={s.actionDesc}>Libera el asiento retenido por vencimiento del plazo de pago (status = expired)</span>
                </div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </button>
          </div>
        )}

        {/* Actions for payment_rejected */}
        {isPaymentRejected && (
          <div style={s.actionsSection}>
            <p style={s.actionsLabel}>Opciones para pago rechazado</p>

            <button
              style={{ ...s.actionBtn, ...s.retryBtn }}
              onClick={() => manageBooking(b.id, 'retry_payment')}
            >
              <div style={s.actionLeft}>
                <RefreshCw size={18} color="#1e6bff" />
                <div>
                  <span style={s.actionTitle}>Reintentar pago</span>
                  <span style={s.actionDesc}>Procesa reautorización bancaria, confirma la venta y actualiza ingresos y conversión</span>
                </div>
              </div>
              <ArrowRight size={16} color="#1e6bff" />
            </button>

            <button
              style={{ ...s.actionBtn, ...s.expireBtn }}
              onClick={() => manageBooking(b.id, 'mark_expired')}
            >
              <div style={s.actionLeft}>
                <XCircle size={18} color="#64748b" />
                <div>
                  <span style={s.actionTitle}>Marcar como expirada</span>
                  <span style={s.actionDesc}>Desiste de la transacción y libera el cupo bloqueado</span>
                </div>
              </div>
              <ArrowRight size={16} color="#64748b" />
            </button>
          </div>
        )}

        <button style={s.cancelBtn} onClick={closeManageBookingModal}>
          Cerrar sin cambios
        </button>
      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(15,23,42,0.45)',
    backdropFilter: 'blur(4px)',
    zIndex: 3000,
  },
  modal: {
    position: 'fixed',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: 3001,
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '28px',
    width: '100%', maxWidth: '500px',
    boxShadow: '0 25px 60px rgba(15,23,42,0.2)',
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  iconWrapper: {
    width: '46px', height: '46px', borderRadius: '14px',
    border: '1px solid #e8ecf2',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.1rem', fontWeight: '800', color: '#0f172a',
    margin: 0, letterSpacing: '-0.02em',
  },
  subtitle: { fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' },
  closeBtn: {
    background: 'none', border: '1px solid #e2e8f0',
    borderRadius: '10px', padding: '6px', cursor: 'pointer',
    color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  infoCard: {
    backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e8ecf2',
    padding: '14px 16px', display: 'flex', gap: '16px', alignItems: 'center',
  },
  infoCol: { display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 },
  infoLabel: { display: 'block', fontSize: '0.6875rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' },
  infoValue: { display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginTop: '2px' },
  priceValue: { display: 'block', fontSize: '0.875rem', fontWeight: '800', color: '#1e6bff', marginTop: '2px' },
  infoSub: { display: 'block', fontSize: '0.6875rem', color: '#64748b', marginTop: '1px' },
  divider: { width: '1px', height: '40px', backgroundColor: '#e2e8f0', flexShrink: 0 },
  statusSuccessBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0',
    borderRadius: '12px', padding: '14px 16px',
    fontSize: '0.84rem', fontWeight: '600', color: '#047857',
  },
  statusExpiredBox: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '14px 16px',
    fontSize: '0.84rem', fontWeight: '600', color: '#475569',
  },
  actionsSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
  actionsLabel: { fontSize: '0.71875rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' },
  actionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderRadius: '14px', border: '1.5px solid',
    cursor: 'pointer', textAlign: 'left', width: '100%',
    transition: 'all 0.15s ease',
  },
  actionLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  actionTitle: { display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' },
  actionDesc: { display: 'block', fontSize: '0.75rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 },
  payBtn: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  retryBtn: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  expireBtn: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  cancelBtn: {
    background: 'none', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '10px 16px',
    cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600',
    color: '#64748b', width: '100%',
  },
};
