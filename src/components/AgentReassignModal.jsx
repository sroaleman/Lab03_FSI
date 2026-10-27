import React, { useState } from 'react';
import { X, Check, Plane, Users, MapPin, Zap } from 'lucide-react';

export default function AgentReassignModal({ 
  isOpen, 
  onClose, 
  agents = [], 
  flights = [], 
  onReassignAgent 
}) {
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [targetFlightId, setTargetFlightId] = useState(flights[0]?.id || '');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('active');

  if (!isOpen) return null;

  const currentAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const assignedFlight = flights.find(f => f.id === currentAgent?.assigned_flight_id);

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setTargetFlightId(agent.assigned_flight_id || flights[0]?.id || '');
      setNewLocation(agent.location || '');
      setNewStatus(agent.status || 'active');
    }
  };

  const handleSave = () => {
    if (!currentAgent) return;
    onReassignAgent(currentAgent.id, {
      assigned_flight_id: targetFlightId,
      location: newLocation || currentAgent.location,
      status: newStatus
    });
    onClose();
  };

  return (
    <div style={styles.overlay} className="modal-overlay" onClick={onClose}>
      <div style={styles.modal} className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleArea}>
            <div style={styles.iconCircle}>
              <Zap size={20} color="#1e6bff" />
            </div>
            <div>
              <h3 style={styles.title}>Reasignar Agentes Operacionales</h3>
              <p style={styles.subtitle}>Gestión de personal de mostradores de check-in y puertas de abordaje</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          {/* Left: Agent selector list */}
          <div style={styles.agentList}>
            <span style={styles.columnLabel}>Selecciona el Agente:</span>
            {agents.map(ag => {
              const isSelected = ag.id === selectedAgentId;
              const f = flights.find(fl => fl.id === ag.assigned_flight_id);
              return (
                <div 
                  key={ag.id}
                  onClick={() => handleSelectAgent(ag.id)}
                  style={{
                    ...styles.agentItem,
                    ...(isSelected ? styles.agentItemSelected : {})
                  }}
                >
                  <img src={ag.avatar_url} alt={ag.full_name} style={styles.agentAvatar} />
                  <div style={styles.agentItemInfo}>
                    <span style={styles.agentName}>{ag.full_name}</span>
                    <span style={styles.agentRole}>{ag.role_label}</span>
                    <span style={styles.agentLoc}>
                      {f ? `Vuelo: ${f.flight_number}` : 'Sin vuelo'} · {ag.location}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Reassignment form */}
          {currentAgent && (
            <div style={styles.formArea}>
              <div style={styles.agentProfileHeader}>
                <img src={currentAgent.avatar_url} alt={currentAgent.full_name} style={styles.profileAvatar} />
                <div>
                  <h4 style={styles.profileName}>{currentAgent.full_name}</h4>
                  <p style={styles.profileRole}>{currentAgent.role_label}</p>
                  <p style={styles.profileCurrent}>
                    Asignación actual: <strong>{assignedFlight?.flight_number || 'Ninguno'}</strong> ({currentAgent.location})
                  </p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nuevo Vuelo Asignado:</label>
                <select 
                  value={targetFlightId}
                  onChange={(e) => setTargetFlightId(e.target.value)}
                  style={styles.selectInput}
                >
                  {flights.map(fl => (
                    <option key={fl.id} value={fl.id}>
                      {fl.flight_number} ({fl.origin} → {fl.destination}) - Salida: {fl.departure_time} - {fl.gate}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Punto / Mostrador / Puerta:</label>
                <input 
                  type="text"
                  placeholder="ej. Módulo 14 o Puerta 4A"
                  value={newLocation || currentAgent.location}
                  onChange={(e) => setNewLocation(e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estado de Disponibilidad:</label>
                <div style={styles.statusButtons}>
                  {['active', 'busy', 'on_break'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      style={{
                        ...styles.statusBtn,
                        ...(newStatus === st ? styles.statusBtnActive : {})
                      }}
                    >
                      {st === 'active' ? 'Disponible / Activo' : st === 'busy' ? 'Ocupado' : 'En Descanso'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
          <button onClick={handleSave} style={styles.saveBtn}>
            <Check size={16} />
            <span>Confirmar Reasignación</span>
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
    maxWidth: '750px',
    width: '100%',
    maxHeight: '88vh',
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
    backgroundColor: '#eff6ff',
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
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    flex: 1,
    overflowY: 'auto',
    maxHeight: 'calc(88vh - 140px)'
  },
  agentList: {
    borderRight: '1px solid #f1f5f9',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto'
  },
  columnLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  agentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '14px',
    cursor: 'pointer',
    border: '1px solid transparent',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease'
  },
  agentItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  agentAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  agentItemInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  agentName: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  agentRole: {
    fontSize: '0.6875rem',
    color: '#1e6bff',
    fontWeight: '600'
  },
  agentLoc: {
    fontSize: '0.625rem',
    color: '#94a3b8'
  },
  formArea: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px'
  },
  agentProfileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderRadius: '18px',
    border: '1px solid #e2e8f0'
  },
  profileAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  profileName: {
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  profileRole: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#1e6bff'
  },
  profileCurrent: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#334155'
  },
  selectInput: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none'
  },
  textInput: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    color: '#0f172a',
    outline: 'none'
  },
  statusButtons: {
    display: 'flex',
    gap: '8px'
  },
  statusBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
  },
  statusBtnActive: {
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    borderColor: '#1e6bff'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9'
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: '9999px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#1e6bff',
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(30, 107, 255, 0.35)'
  }
};
