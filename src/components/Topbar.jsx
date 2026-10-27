import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  AlertTriangle,
  User,
  Shield,
  Building,
  LogOut,
  X
} from 'lucide-react';

export default function Topbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenReassignModal,
  onOpenRejectedModal,
  onOpenSecurityModal,
  onOpenSettingsModal,
  criticalAlertsCount = 0,
  rejectedCount = 0,
  activeTabTitle = "Dashboard Operativo"
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header style={styles.header}>
      {/* View Title */}
      <div style={styles.titleArea}>
        <h2 style={styles.pageTitle}>{activeTabTitle}</h2>
        <span style={styles.statusIndicator}>
          <span style={styles.livePulse} />
          Operaciones en Vivo · Hub Colombia (MDE / BOG)
        </span>
      </div>

      {/* Global Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Buscar pasajero, PNR, vuelo o agente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              title="Borrar búsqueda"
            >
              <X size={14} color="#64748b" />
            </button>
          ) : (
            <div style={styles.commandBadge}>
              <span>⌘ K</span>
            </div>
          )}
        </div>

        {/* Space / Action Button */}
        <button 
          onClick={onOpenReassignModal}
          style={styles.spaceBtn}
          title="Asignación rápida de agentes"
        >
          <Plus size={16} color="#ffffff" />
          <span>+ Reasignar</span>
        </button>
      </div>

      {/* Right User Actions */}
      <div style={styles.rightActions}>
        {/* Rejected Payments Alert Button */}
        {rejectedCount > 0 && (
          <button 
            onClick={onOpenRejectedModal}
            style={styles.alertActionBtn}
            title={`${rejectedCount} pagos rechazados pendientes de revisión`}
          >
            <AlertTriangle size={17} color="#ef4444" />
            <span style={styles.alertText}>{rejectedCount} Pagos</span>
          </button>
        )}

        {/* Security Notification Bell */}
        <button 
          onClick={onOpenSecurityModal}
          style={styles.iconBtn}
          title={`${criticalAlertsCount} incidencias de seguridad o documentos`}
        >
          <Bell size={20} color="#475569" />
          {criticalAlertsCount > 0 && (
            <span style={styles.bellBadge}>{criticalAlertsCount}</span>
          )}
        </button>

        {/* User Profile Capsule with Interactive Dropdown */}
        <div style={styles.profileWrapper}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={styles.userProfile}
          >
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" 
              alt="Valentina Restrepo" 
              style={styles.avatar}
            />
            <div style={styles.userInfo}>
              <span style={styles.userName}>Valentina Restrepo</span>
              <span style={styles.userEmail}>operaciones@aeroops.co</span>
            </div>
            <ChevronDown size={16} color="#64748b" style={{ marginLeft: '4px' }} />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownHeader}>
                <p style={styles.dropdownUserName}>Valentina Restrepo</p>
                <p style={styles.dropdownUserRole}>Responsable de Operaciones de Tierra</p>
              </div>
              <div style={styles.dropdownDivider} />
              <button 
                onClick={() => { setIsProfileOpen(false); onOpenSettingsModal(); }}
                style={styles.dropdownItem}
              >
                <Building size={16} color="#64748b" />
                <span>Estación Hub MDE / BOG</span>
              </button>
              <button 
                onClick={() => { setIsProfileOpen(false); onOpenSecurityModal(); }}
                style={styles.dropdownItem}
              >
                <Shield size={16} color="#64748b" />
                <span>Centro de Alertas ({criticalAlertsCount})</span>
              </button>
              <div style={styles.dropdownDivider} />
              <button 
                onClick={() => setIsProfileOpen(false)}
                style={{ ...styles.dropdownItem, color: '#ef4444' }}
              >
                <LogOut size={16} color="#ef4444" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: '76px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e8ecf2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky',
    top: 0,
    zIndex: 9
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  pageTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.025em'
  },
  statusIndicator: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  livePulse: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    maxWidth: '540px',
    margin: '0 24px'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '8px 16px',
    flex: 1,
    transition: 'all 0.2s ease'
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.875rem',
    color: '#0f172a',
    width: '100%'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px'
  },
  commandBadge: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '2px 7px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#94a3b8'
  },
  spaceBtn: {
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    padding: '8px 16px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(30, 107, 255, 0.3)',
    whiteSpace: 'nowrap'
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  alertActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '9999px',
    padding: '6px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  alertText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#b91c1c'
  },
  iconBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative'
  },
  bellBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.6875rem',
    fontWeight: '800',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff'
  },
  profileWrapper: {
    position: 'relative'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 12px 4px 4px',
    backgroundColor: '#f8fafc',
    borderRadius: '9999px',
    border: '1px solid #e8ecf2',
    cursor: 'pointer'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2
  },
  userEmail: {
    fontSize: '0.6875rem',
    color: '#64748b'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    border: '1px solid #e8ecf2',
    padding: '8px',
    zIndex: 100,
    animation: 'scaleUp 0.18s ease'
  },
  dropdownHeader: {
    padding: '10px 12px'
  },
  dropdownUserName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  dropdownUserRole: {
    fontSize: '0.71875rem',
    color: '#64748b',
    marginTop: '2px'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '6px 0'
  },
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '10px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease'
  }
};
