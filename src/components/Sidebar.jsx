import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Ticket, 
  HelpCircle, 
  Settings, 
  Plane,
  Users,
  ShieldCheck,
  Zap,
  Menu,
  ChevronLeft
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenReassignModal, 
  onOpenHelpModal,
  onOpenSettingsModal,
  criticalAlertsCount = 0 
}) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservas', label: 'Reservas', icon: Ticket },
    { id: 'checkin', label: 'Check-in & Salas', icon: ShieldCheck },
    { id: 'vuelos', label: 'Vuelos Activos', icon: Plane },
    { id: 'pasajeros', label: 'Pasajeros', icon: Users },
  ];

  return (
    <aside style={{
      ...styles.sidebar,
      width: collapsed ? '80px' : '260px'
    }}>
      {/* Brand Header */}
      <div style={{
        ...styles.header,
        justifyContent: collapsed ? 'center' : 'space-between',
        paddingLeft: collapsed ? '0' : '8px',
        paddingRight: collapsed ? '0' : '8px'
      }}>
        <div 
          style={styles.brand}
          onClick={() => setActiveTab('dashboard')}
        >
          <div style={styles.logoIcon} title="AeroOps Hub">
            <Plane size={20} color="#ffffff" />
          </div>
          {!collapsed && (
            <div style={styles.brandInfo}>
              <h1 style={styles.brandName}>AeroOps</h1>
              <span style={styles.brandSub}>Virtual Airlines</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={styles.collapseBtn} 
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <Menu size={16} color="#64748b" /> : <ChevronLeft size={16} color="#64748b" />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '12px' : '12px 16px'
              }}
              title={item.label}
            >
              <Icon size={19} color={isActive ? '#ffffff' : '#64748b'} />
              {!collapsed && (
                <span style={{
                  ...styles.navLabel,
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? '600' : '500'
                }}>
                  {item.label}
                </span>
              )}
              {item.id === 'checkin' && criticalAlertsCount > 0 && (
                <span style={{
                  ...styles.alertBadge,
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#ef4444',
                  color: '#ffffff',
                  position: collapsed ? 'absolute' : 'static',
                  top: collapsed ? '4px' : 'auto',
                  right: collapsed ? '4px' : 'auto'
                }}>
                  {criticalAlertsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operational Quick Action Card */}
      {!collapsed && (
        <div style={styles.operationalCard}>
          <div style={styles.flightSilhouette}>
            <Plane size={36} color="rgba(255,255,255,0.85)" style={{ transform: 'rotate(-25deg)' }} />
          </div>
          <div style={styles.opCardHeader}>
            <span style={styles.opPulseDot} />
            <span style={styles.opBadgeText}>Control en Vivo</span>
          </div>
          <p style={styles.opCardTitle}>Turnos y Mostradores</p>
          <p style={styles.opCardDesc}>7 agentes activos en 10 vuelos de la red nacional.</p>
          <button 
            onClick={onOpenReassignModal}
            style={styles.opCardBtn}
          >
            <Zap size={15} color="#1e6bff" />
            <span>Reasignar Agentes</span>
          </button>
        </div>
      )}

      {/* Bottom links */}
      <div style={styles.footer}>
        <button 
          onClick={onOpenHelpModal}
          style={{
            ...styles.footerLink,
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          title="Ayuda & Soporte"
        >
          <HelpCircle size={18} color="#64748b" />
          {!collapsed && <span>Ayuda & Soporte</span>}
        </button>
        <button 
          onClick={onOpenSettingsModal}
          style={{
            ...styles.footerLink,
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          title="Configuración"
        >
          <Settings size={18} color="#64748b" />
          {!collapsed && <span>Configuración</span>}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e8ecf2',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 14px',
    flexShrink: 0,
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    transition: 'width 0.25s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '24px'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1e6bff 0%, #06b6d4 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(30, 107, 255, 0.35)',
    flexShrink: 0
  },
  brandInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandName: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.1
  },
  brandSub: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  collapseBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderRadius: '16px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
    position: 'relative'
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #1e6bff 0%, #1d4ed8 100%)',
    boxShadow: '0 8px 20px -2px rgba(30, 107, 255, 0.38)'
  },
  navLabel: {
    fontSize: '0.9375rem',
    fontFamily: "'Inter', sans-serif",
    flex: 1
  },
  alertBadge: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '9999px',
    lineHeight: 1.2
  },
  operationalCard: {
    background: 'linear-gradient(145deg, #1e6bff 0%, #0284c7 100%)',
    borderRadius: '22px',
    padding: '18px 16px',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 28px -6px rgba(30, 107, 255, 0.45)',
    marginBottom: '20px'
  },
  flightSilhouette: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    opacity: 0.85
  },
  opCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  opPulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#34d399',
    boxShadow: '0 0 8px #34d399'
  },
  opBadgeText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#bae6fd'
  },
  opCardTitle: {
    fontSize: '0.9375rem',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#ffffff',
    position: 'relative',
    zIndex: 1
  },
  opCardDesc: {
    fontSize: '0.75rem',
    color: '#e0f2fe',
    lineHeight: 1.4,
    marginBottom: '14px',
    position: 'relative',
    zIndex: 1
  },
  opCardBtn: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    color: '#1e6bff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    position: 'relative',
    zIndex: 1
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px'
  },
  footerLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'background 0.2s ease',
    textAlign: 'left'
  }
};
