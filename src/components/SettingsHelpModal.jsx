import React from 'react';
import { X, HelpCircle, Settings, ShieldCheck, DollarSign, Plane, Users, Check } from 'lucide-react';

export default function SettingsHelpModal({ isOpen, onClose, mode = 'help' }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} className="modal-overlay" onClick={onClose}>
      <div style={styles.modal} className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTitleArea}>
            <div style={{
              ...styles.iconCircle,
              backgroundColor: mode === 'help' ? '#eff6ff' : '#f8fafc'
            }}>
              {mode === 'help' ? (
                <HelpCircle size={20} color="#1e6bff" />
              ) : (
                <Settings size={20} color="#0f172a" />
              )}
            </div>
            <div>
              <h3 style={styles.title}>
                {mode === 'help' ? 'Guía y Manual de Operaciones' : 'Configuración de la Estación'}
              </h3>
              <p style={styles.subtitle}>
                {mode === 'help' 
                  ? 'Referencia de métricas, procesos de negocio y protocolo de contingencias' 
                  : 'Parámetros del Centro de Control Operacional Hub Colombia'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        <div style={styles.body}>
          {mode === 'help' ? (
            <div style={styles.helpContent}>
              <div style={styles.infoBlock}>
                <h4 style={styles.blockTitle}>Proceso 1: Reserva y Compra de Ticket</h4>
                <p style={styles.blockDesc}>
                  Comprende el ciclo comercial de adquisición de tiquetes:
                </p>
                <ul style={styles.list}>
                  <li><strong>Ingresos Totales:</strong> Sumatoria del monto (en pesos colombianos COP) de las reservas confirmadas (`status = 'paid'`).</li>
                  <li><strong>Tasa de Conversión:</strong> Porcentaje de reservas pagadas sobre el volumen total emitido o en trámite.</li>
                  <li><strong>Cupos Bloqueados:</strong> Asientos temporalmente retenidos en pasarela bancaria o PSE pendientes de pago.</li>
                  <li><strong>Ticket Promedio:</strong> Monto promedio facturado por cada tiquete pagado.</li>
                </ul>
              </div>

              <div style={styles.infoBlock}>
                <h4 style={styles.blockTitle}>Proceso 2: Check-in y Embarque</h4>
                <p style={styles.blockDesc}>
                  Control operacional de mostradores de atención, filtros de seguridad y salas:
                </p>
                <ul style={styles.list}>
                  <li><strong>Pasajeros Abordados:</strong> Pasajeros con escaneo final de pasabordo que ya ingresaron a la aeronave.</li>
                  <li><strong>Check-in Completado:</strong> Pasabordo digital o impreso generado exitosamente.</li>
                  <li><strong>Rechazos por Documentos:</strong> Novedades por cédula vencida, falta de permiso de menores o fotocopias no válidas.</li>
                  <li><strong>No Autorizados en Seguridad:</strong> Retenciones en filtros de rayos X o requerimientos de autoridades.</li>
                </ul>
              </div>

              <div style={styles.infoBlock}>
                <h4 style={styles.blockTitle}>Decisiones Rápidas</h4>
                <p style={styles.blockDesc}>
                  Puedes usar el botón <strong>'+ Reasignar'</strong> para transferir agentes de check-in o puerta de un vuelo a otro, o abrir las alertas de pagos y seguridad en la barra superior para resolver incidencias de inmediato.
                </p>
              </div>
            </div>
          ) : (
            <div style={styles.settingsContent}>
              <div style={styles.settingRow}>
                <div>
                  <h4 style={styles.settingTitle}>Centro de Operaciones Principal</h4>
                  <p style={styles.settingDesc}>Aeropuerto Internacional José María Córdova (MDE / SKRG)</p>
                </div>
                <span style={styles.activePill}>Activo</span>
              </div>

              <div style={styles.settingRow}>
                <div>
                  <h4 style={styles.settingTitle}>Moneda Operativa</h4>
                  <p style={styles.settingDesc}>Pesos Colombianos (COP) según regulaciones de la Aeronáutica Civil</p>
                </div>
                <span style={styles.currencyPill}>COP ($)</span>
              </div>

              <div style={styles.settingRow}>
                <div>
                  <h4 style={styles.settingTitle}>Protocolo de Reconciliación de Pagos</h4>
                  <p style={styles.settingDesc}>Liberación automática de cupos bloqueados tras 24 horas</p>
                </div>
                <span style={styles.activePill}>Habilitado</span>
              </div>
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.closeModalBtn}>
            <Check size={16} />
            <span>Entendido</span>
          </button>
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
    maxWidth: '640px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    border: '1px solid #e8ecf2',
    overflow: 'hidden'
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
    padding: '24px',
    overflowY: 'auto'
  },
  helpContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  infoBlock: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '16px 20px',
    border: '1px solid #f1f5f9'
  },
  blockTitle: {
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '6px'
  },
  blockDesc: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '10px'
  },
  list: {
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.8125rem',
    color: '#334155'
  },
  settingsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    border: '1px solid #e8ecf2'
  },
  settingTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  settingDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px'
  },
  activePill: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid #a7f3d0'
  },
  currencyPill: {
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    border: '1px solid #bfdbfe'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9'
  },
  closeModalBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '9px 20px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
