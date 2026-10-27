import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  FileWarning,
  FileCheck,
  FileX,
  PlaneTakeoff,
  AlertTriangle,
  X,
  CheckCircle2,
  ArrowRight,
  Clock,
  User,
  Plane,
  RotateCcw,
  Ban
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';

export default function CheckinActionModal() {
  const {
    managingCheckin,
    closeManageModal,
    manageCheckin,
    passengers,
    flights
  } = useOperations();

  // Confirmation state: null | 'deny_security' | 'request_counter_correction' | 'cancel_checkin' | 'gate_issue'
  const [pendingAction, setPendingAction] = useState(null);
  const [reasonInput, setReasonInput] = useState('');

  if (!managingCheckin) return null;

  const chk = managingCheckin;
  const pax = passengers.find(p => p.id === (chk.pasajero_id || chk.passenger_id)) || {};
  const fl = flights.find(f => f.id === (chk.vuelo_id || chk.flight_id)) || {};

  const status = chk.estado || chk.status || '';
  const security = chk.seguridad || chk.security_result || '';
  const stage = chk.stage || chk.etapa || '';

  const isFinalDenied = status === 'denied';
  const isFinalCancelled = status === 'cancelled';
  const isBoarded = status === 'boarded' || stage === 'Abordado';

  // 1. Etapa Control migratorio / Seguridad
  const isSecurityStage = !isFinalDenied && !isFinalCancelled && (
    security === 'not_authorized' ||
    security === 'pending' ||
    status === 'not_authorized' ||
    stage === 'Control migratorio/seguridad' ||
    stage === 'Control de seguridad'
  );

  // 2. Etapa Verificación de documentos
  const isDocStage = !isFinalDenied && !isFinalCancelled && (
    status === 'document_issue' ||
    chk.documents_valid === false ||
    chk.documentos_validos === false ||
    stage === 'Verificación de documentos'
  );

  // 3. Etapa Puerta de embarque / Abordaje
  const isGateStage = !isFinalDenied && !isFinalCancelled && !isBoarded && (
    stage === 'Puerta de embarque' ||
    stage === 'Abordaje' ||
    stage === 'Pasabordo emitido' ||
    stage === 'Equipaje' ||
    status === 'gate_issue' ||
    status === 'completed' ||
    (!isSecurityStage && !isDocStage)
  );

  const paxName = pax.nombre || pax.full_name || 'Pasajero';
  const docNum = pax.documento || pax.document_number || '—';
  const flightNum = fl.flight_number || '—';
  const route = fl.origin && fl.destination ? `${fl.origin} → ${fl.destination}` : '';

  const handleOpenConfirm = (actionType, defaultReason = '') => {
    setPendingAction(actionType);
    setReasonInput(defaultReason);
  };

  const handleCancelConfirm = () => {
    setPendingAction(null);
    setReasonInput('');
  };

  const handleExecuteConfirmedAction = () => {
    if (!pendingAction) return;
    const finalReason = reasonInput.trim() || getDefaultReasonForAction(pendingAction);
    manageCheckin(chk.id, pendingAction, { reason: finalReason });
    setPendingAction(null);
    setReasonInput('');
  };

  const getDefaultReasonForAction = (action) => {
    switch (action) {
      case 'deny_security':
        return 'Homonimia o impedimento judicial en control de seguridad.';
      case 'cancel_checkin':
        return 'Cancelación definitiva de check-in por inconsistencia documental o desistimiento.';
      case 'request_counter_correction':
        return 'Documentos pendientes de subsanación y verificación en mostrador/counter.';
      case 'gate_issue':
        return 'Novedad con código de pasabordo o inspección adicional en sala.';
      default:
        return 'Novedad operativa en proceso de check-in.';
    }
  };

  const presetReasons = {
    deny_security: [
      'Homonimia con lista restrictiva',
      'Requerimiento judicial vigente',
      'Alerta migratoria / impedimento de salida',
      'Inspección de seguridad no superada'
    ],
    cancel_checkin: [
      'Documento de identidad no subsanado',
      'Desistimiento voluntario del pasajero',
      'Inconsistencia en visado o pasaporte vencido',
      'No se presenta a tiempo en counter'
    ],
    request_counter_correction: [
      'Pasaporte requiere confirmación física en counter',
      'Falta verificación de visado de tránsito',
      'Inconsistencia de apellidos con reserva',
      'Pago de tasa de salida pendiente en counter'
    ],
    gate_issue: [
      'Código QR de pasabordo ilegible',
      'Duplicidad de asiento en sistema de cabina',
      'Inspección secundaria de equipaje de mano',
      'Pasajero no responde a llamado de abordaje'
    ]
  };

  return (
    <>
      <div style={s.backdrop} onClick={closeManageModal} />
      <div style={s.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={{
              ...s.iconWrapper,
              backgroundColor: isFinalDenied || isFinalCancelled ? '#fef2f2' :
                               isSecurityStage ? '#fef2f2' :
                               isDocStage ? '#fffbeb' : '#eff6ff'
            }}>
              {isFinalDenied ? <ShieldX size={22} color="#dc2626" /> :
               isFinalCancelled ? <Ban size={22} color="#991b1b" /> :
               isSecurityStage ? <ShieldAlert size={22} color="#ef4444" /> :
               isDocStage ? <FileWarning size={22} color="#f59e0b" /> :
               <PlaneTakeoff size={22} color="#1e6bff" />}
            </div>
            <div>
              <h2 id="modal-title" style={s.title}>
                {pendingAction ? 'Confirmar Decisión BPMN' : 'Gestionar Pasajero'}
              </h2>
              <p style={s.subtitle}>
                {pendingAction ? 'Especifique el motivo y confirme la salida del flujo' : 'Flujo de Check-in, Seguridad y Puerta de Embarque'}
              </p>
            </div>
          </div>
          <button onClick={closeManageModal} style={s.closeBtn} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Passenger Info Card */}
        <div style={s.infoCard}>
          <div style={s.infoCol}>
            <User size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Pasajero</span>
              <span style={s.infoValue}>{paxName}</span>
              <span style={s.infoSub}>Doc: {docNum}</span>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoCol}>
            <Plane size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Vuelo</span>
              <span style={s.infoValue}>{flightNum}</span>
              {route && <span style={s.infoSub}>{route}</span>}
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.infoCol}>
            <Clock size={13} color="#94a3b8" />
            <div>
              <span style={s.infoLabel}>Etapa / Asiento</span>
              <span style={s.infoValue}>{stage || 'En proceso'}</span>
              <span style={s.infoSub}>Asiento: {chk.seat || '—'}</span>
            </div>
          </div>
        </div>

        {/* Existing Incident Detail Banner */}
        {chk.incident_detail && !pendingAction && (
          <div style={s.incidentBanner}>
            <span style={s.incidentLabel}>Registro de Novedad Activa</span>
            <span style={s.incidentText}>{chk.incident_detail}</span>
          </div>
        )}

        {/* Final State Banners */}
        {isFinalDenied && (
          <div style={{ ...s.statusMsg, backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
            <ShieldX size={20} color="#dc2626" />
            <div>
              <strong>Pasajero no autorizado para continuar (Denegado).</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
                Motivo: {chk.denial_reason || chk.incident_detail || 'Denegado por control de seguridad.'}
              </p>
            </div>
          </div>
        )}

        {isFinalCancelled && (
          <div style={{ ...s.statusMsg, backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
            <Ban size={20} color="#b91c1c" />
            <div>
              <strong>Check-in cancelado definitivamente.</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
                Motivo: {chk.cancellation_reason || chk.incident_detail || 'Cancelado en counter o seguridad.'}
              </p>
            </div>
          </div>
        )}

        {isBoarded && (
          <div style={{ ...s.statusMsg, backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}>
            <CheckCircle2 size={20} color="#047857" />
            <div>
              <strong>Pasajero confirmado como abordado en la aeronave.</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
                Proceso BPMN de embarque completado exitosamente.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CONFIRMATION / REASON FORM VIEW (When pendingAction is set) */}
        {/* ======================================================== */}
        {pendingAction && (
          <div style={s.confirmBox}>
            <div style={s.confirmHeader}>
              <div style={s.confirmAlertIcon}>
                {pendingAction === 'deny_security' ? <ShieldX size={20} color="#dc2626" /> :
                 pendingAction === 'cancel_checkin' ? <FileX size={20} color="#b91c1c" /> :
                 pendingAction === 'request_counter_correction' ? <RotateCcw size={20} color="#b45309" /> :
                 <AlertTriangle size={20} color="#c2410c" />}
              </div>
              <div>
                <h4 style={s.confirmTitle}>
                  {pendingAction === 'deny_security' && '¿Denegar paso de seguridad definitivamente?'}
                  {pendingAction === 'cancel_checkin' && '¿Cancelar proceso de check-in?'}
                  {pendingAction === 'request_counter_correction' && 'Solicitar corrección de documentos en counter'}
                  {pendingAction === 'gate_issue' && 'Registrar novedad en puerta de embarque'}
                </h4>
                <p style={s.confirmDesc}>
                  {pendingAction === 'deny_security' && 'Evento final del BPMN: "Pasajero no autorizado para continuar". El check-in finaliza aquí y no podrá continuar.'}
                  {pendingAction === 'cancel_checkin' && 'Evento final del BPMN: El check-in se dará de baja como cancelado con registro en auditoría.'}
                  {pendingAction === 'request_counter_correction' && 'Rama "No" del BPMN: Regresa el estado documental para subsanación y verificación en counter.'}
                  {pendingAction === 'gate_issue' && 'Pasabordo no válido temporalmente. El pasajero permanecerá en sala hasta solucionar la novedad.'}
                </p>
              </div>
            </div>

            {/* Reason text input */}
            <div style={s.inputGroup}>
              <label style={s.inputLabel}>
                Motivo / Justificación {pendingAction === 'deny_security' ? '(requerido)' : ''}:
              </label>
              <input
                type="text"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Escriba el motivo o elija una opción rápida abajo..."
                style={s.reasonInput}
                autoFocus
              />
            </div>

            {/* Quick Presets */}
            {presetReasons[pendingAction] && (
              <div style={s.presetsContainer}>
                <span style={s.presetsLabel}>Opciones frecuentes:</span>
                <div style={s.presetsList}>
                  {presetReasons[pendingAction].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      style={s.presetBtn}
                      onClick={() => setReasonInput(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm & Back Buttons */}
            <div style={s.confirmActionsRow}>
              <button
                type="button"
                style={s.cancelSubBtn}
                onClick={handleCancelConfirm}
              >
                Volver
              </button>
              <button
                type="button"
                style={{
                  ...s.executeBtn,
                  backgroundColor: pendingAction === 'deny_security' ? '#dc2626' :
                                   pendingAction === 'cancel_checkin' ? '#b91c1c' :
                                   pendingAction === 'request_counter_correction' ? '#d97706' : '#ea580c'
                }}
                onClick={handleExecuteConfirmedAction}
              >
                {pendingAction === 'deny_security' && 'Confirmar Denegación de Paso'}
                {pendingAction === 'cancel_checkin' && 'Confirmar Cancelación'}
                {pendingAction === 'request_counter_correction' && 'Enviar Solicitud a Counter'}
                {pendingAction === 'gate_issue' && 'Guardar Novedad en Puerta'}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MAIN BPMN ACTIONS (Shown when no action is pending confirm) */}
        {/* ======================================================== */}
        {!pendingAction && !isFinalDenied && !isFinalCancelled && !isBoarded && (
          <div style={s.actionsSection}>
            <p style={s.actionsLabel}>Acciones según etapa BPMN del pasajero</p>

            {/* ---------------- 1. ETAPA SEGURIDAD ---------------- */}
            {isSecurityStage && (
              <div style={s.stageBlock}>
                <div style={s.stageBadgeTitle}>
                  <ShieldAlert size={14} color="#ef4444" />
                  <span>Control Migratorio / Seguridad</span>
                </div>

                {/* Positiva: Autorizar paso */}
                <button
                  style={{ ...s.actionBtn, ...s.secAuthBtn }}
                  onClick={() => manageCheckin(chk.id, 'authorize_security')}
                >
                  <div style={s.actionLeft}>
                    <ShieldCheck size={18} color="#047857" />
                    <div>
                      <span style={s.actionTitle}>Autorizar paso</span>
                      <span style={s.actionDesc}>Aprueba inspección de seguridad y avanza a Puerta de embarque</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#047857" />
                </button>

                {/* NUEVA Negativa: Denegar paso */}
                <button
                  style={{ ...s.actionBtn, ...s.secDenyBtn }}
                  onClick={() => handleOpenConfirm('deny_security', 'Homonimia con lista restrictiva')}
                >
                  <div style={s.actionLeft}>
                    <ShieldX size={18} color="#dc2626" />
                    <div>
                      <span style={{ ...s.actionTitle, color: '#dc2626' }}>Denegar paso (Salida definitiva)</span>
                      <span style={s.actionDesc}>Pasajero no autorizado para continuar. Finaliza el check-in</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#dc2626" />
                </button>
              </div>
            )}

            {/* ---------------- 2. ETAPA DOCUMENTOS ---------------- */}
            {isDocStage && (
              <div style={s.stageBlock}>
                <div style={s.stageBadgeTitle}>
                  <FileWarning size={14} color="#f59e0b" />
                  <span>Verificación de Documentos</span>
                </div>

                {/* Positiva: Marcar válidos */}
                <button
                  style={{ ...s.actionBtn, ...s.docValidBtn }}
                  onClick={() => manageCheckin(chk.id, 'validate_documents')}
                >
                  <div style={s.actionLeft}>
                    <FileCheck size={18} color="#047857" />
                    <div>
                      <span style={s.actionTitle}>Marcar documentos válidos</span>
                      <span style={s.actionDesc}>Identidad verificada exitosamente; emite pasabordo</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#047857" />
                </button>

                {/* NUEVA: Solicitar corrección en counter (Rama "No") */}
                <button
                  style={{ ...s.actionBtn, ...s.docCounterBtn }}
                  onClick={() => handleOpenConfirm('request_counter_correction', 'Pasaporte requiere confirmación física en counter')}
                >
                  <div style={s.actionLeft}>
                    <RotateCcw size={18} color="#b45309" />
                    <div>
                      <span style={{ ...s.actionTitle, color: '#b45309' }}>Solicitar corrección en counter</span>
                      <span style={s.actionDesc}>Rama 'No' del BPMN: Regresa para subsanación y nueva verificación</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#b45309" />
                </button>

                {/* NUEVA Negativa: Cancelar check-in */}
                <button
                  style={{ ...s.actionBtn, ...s.cancelCheckinBtn }}
                  onClick={() => handleOpenConfirm('cancel_checkin', 'Documento de identidad no subsanado')}
                >
                  <div style={s.actionLeft}>
                    <FileX size={18} color="#991b1b" />
                    <div>
                      <span style={{ ...s.actionTitle, color: '#991b1b' }}>Cancelar check-in</span>
                      <span style={s.actionDesc}>Cancela el proceso de check-in definitivamente</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#991b1b" />
                </button>
              </div>
            )}

            {/* ---------------- 3. ETAPA PUERTA DE EMBARQUE ---------------- */}
            {isGateStage && (
              <div style={s.stageBlock}>
                <div style={s.stageBadgeTitle}>
                  <PlaneTakeoff size={14} color="#1e6bff" />
                  <span>Puerta de Embarque / Validación Pasabordo</span>
                </div>

                {/* Positiva: Confirmar abordaje */}
                <button
                  style={{ ...s.actionBtn, ...s.boardBtn }}
                  onClick={() => manageCheckin(chk.id, 'confirm_boarded')}
                >
                  <div style={s.actionLeft}>
                    <PlaneTakeoff size={18} color="#1e6bff" />
                    <div>
                      <span style={s.actionTitle}>Confirmar abordaje</span>
                      <span style={s.actionDesc}>Pasabordo válido; registra al pasajero como abordado en el avión</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#1e6bff" />
                </button>

                {/* NUEVA: Resolver novedad en la puerta */}
                <button
                  style={{ ...s.actionBtn, ...s.gateIssueBtn }}
                  onClick={() => handleOpenConfirm('gate_issue', 'Código QR de pasabordo ilegible en puerta')}
                >
                  <div style={s.actionLeft}>
                    <AlertTriangle size={18} color="#ea580c" />
                    <div>
                      <span style={{ ...s.actionTitle, color: '#ea580c' }}>Resolver novedad en la puerta</span>
                      <span style={s.actionDesc}>Pasabordo no válido; retiene al pasajero en puerta hasta resolución</span>
                    </div>
                  </div>
                  <ArrowRight size={16} color="#ea580c" />
                </button>
              </div>
            )}
          </div>
        )}

        <button style={s.cancelBtn} onClick={closeManageModal}>
          Cerrar
        </button>
      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(5px)',
    zIndex: 3000,
  },
  modal: {
    position: 'fixed',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    zIndex: 3001,
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '26px 28px',
    width: '100%', maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(15,23,42,0.25)',
    display: 'flex', flexDirection: 'column', gap: '16px',
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
    padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'center',
  },
  infoCol: { display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 },
  infoLabel: { display: 'block', fontSize: '0.6875rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' },
  infoValue: { display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginTop: '2px' },
  infoSub: { display: 'block', fontSize: '0.6875rem', color: '#64748b', marginTop: '1px' },
  divider: { width: '1px', height: '36px', backgroundColor: '#e2e8f0', flexShrink: 0 },
  incidentBanner: {
    backgroundColor: '#fef3c7', border: '1px solid #fde68a',
    borderRadius: '12px', padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: '3px',
  },
  incidentLabel: { fontSize: '0.6875rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' },
  incidentText: { fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.4 },
  statusMsg: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    border: '1px solid',
    borderRadius: '14px', padding: '14px 16px',
    fontSize: '0.84rem',
  },
  actionsSection: { display: 'flex', flexDirection: 'column', gap: '14px' },
  actionsLabel: { fontSize: '0.71875rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
  stageBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  stageBadgeTitle: {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '0.75rem', fontWeight: '700', color: '#475569'
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 14px', borderRadius: '14px', border: '1.5px solid',
    cursor: 'pointer', textAlign: 'left', width: '100%',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  },
  actionLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  actionTitle: { display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' },
  actionDesc: { display: 'block', fontSize: '0.73rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 },
  secAuthBtn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  secDenyBtn: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  docValidBtn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  docCounterBtn: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  cancelCheckinBtn: { backgroundColor: '#fef2f2', borderColor: '#fca5a5' },
  boardBtn: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  gateIssueBtn: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },
  confirmBox: {
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  confirmAlertIcon: {
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    flexShrink: 0
  },
  confirmTitle: {
    margin: '0 0 4px',
    fontSize: '0.92rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  confirmDesc: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#475569',
    lineHeight: 1.35
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  inputLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#334155'
  },
  reasonInput: {
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.8125rem',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  presetsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  presetsLabel: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  presetsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  presetBtn: {
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '4px 10px',
    fontSize: '0.71875rem',
    color: '#334155',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  confirmActionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px'
  },
  cancelSubBtn: {
    background: 'none',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer'
  },
  executeBtn: {
    border: 'none',
    borderRadius: '10px',
    padding: '8px 18px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  cancelBtn: {
    background: 'none', border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '10px 16px',
    cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600',
    color: '#64748b', width: '100%',
  },
};

