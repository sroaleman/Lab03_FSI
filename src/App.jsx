import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Filters from './components/Filters';
import KpiCard from './components/KpiCard';
import SalesLineChart from './components/SalesLineChart';
import StageBarChart from './components/StageBarChart';
import ActivityCard from './components/ActivityCard';
import BookingsList from './components/BookingsList';
import FlightsView from './components/FlightsView';
import PassengersView from './components/PassengersView';
import CheckinView from './components/CheckinView';
import CheckinActionModal from './components/CheckinActionModal';
import BookingActionModal from './components/BookingActionModal';
import AgentReassignModal from './components/AgentReassignModal';
import RejectedPaymentsModal from './components/RejectedPaymentsModal';
import SecurityIncidentsModal from './components/SecurityIncidentsModal';
import SettingsHelpModal from './components/SettingsHelpModal';
import FloatingChat from './components/FloatingChat';

import { useOperations } from './context/OperationsContext';
import { Sparkles } from 'lucide-react';

export default function App() {
  const {
    // Master data
    agents,
    flights,
    passengers,
    bookings,
    checkins,
    // Filtered data
    filteredBookings,
    filteredCheckins,
    // KPIs & Charts
    reservationKpis,
    checkinKpis,
    salesEvolutionData,
    bookingsByStageData,
    passengersByCheckinData,
    rejectedCount,
    criticalAlertsCount,
    // Filters
    filters,
    setFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
    // Actions
    reassignAgent,
    updateBookingStatus,
    showToast,
    toastMessage
  } = useOperations();

  // Navigation tab: 'dashboard' | 'reservas' | 'checkin' | 'vuelos' | 'pasajeros'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal visibility states
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const tabTitles = {
    dashboard: "Dashboard Operativo",
    reservas: "Gestión de Reservas y Pagos",
    checkin: "Check-in, Filtros y Seguridad",
    vuelos: "Vuelos Activos y Salas de Abordaje",
    pasajeros: "Directorio de Pasajeros"
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={styles.toast}>
          <Sparkles size={16} color="#ffffff" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BPMN Check-in Action Modal (global overlay, reads from context) */}
      <CheckinActionModal />

      {/* BPMN Booking Action Modal (global overlay, reads from context) */}
      <BookingActionModal />

      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenReassignModal={() => setIsReassignModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        criticalAlertsCount={criticalAlertsCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Topbar */}
        <Topbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenReassignModal={() => setIsReassignModalOpen(true)}
          onOpenRejectedModal={() => setIsRejectedModalOpen(true)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          criticalAlertsCount={criticalAlertsCount}
          rejectedCount={rejectedCount}
          activeTabTitle={tabTitles[activeTab]}
        />

        {/* Dynamic Views */}
        <main className="dashboard-content">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <Filters 
                filters={filters}
                setFilters={setFilters}
                flights={flights}
                agents={agents}
                onResetFilters={resetFilters}
                totalBookingsCount={bookings.length}
                filteredBookingsCount={filteredBookings.length}
                totalCheckinsCount={checkins.length}
                filteredCheckinsCount={filteredCheckins.length}
              />

              {/* KPIs: Proceso 1 */}
              <div style={styles.processSection}>
                <div style={styles.processHeader}>
                  <div style={styles.processTitleLine}>
                    <div style={{ ...styles.processIconDot, backgroundColor: '#1e6bff' }} />
                    <h3 style={styles.processTitle}>Proceso 1: Reserva y Compra de Ticket</h3>
                  </div>
                  <span style={styles.processBadge}>Ventas &amp; Conversión en COP</span>
                </div>
                <div style={styles.kpiGrid}>
                  {reservationKpis.map(kpi => (
                    <KpiCard 
                      key={kpi.id} 
                      kpi={kpi} 
                      onClick={() => {
                        if (kpi.id === 'seat_held' || kpi.id === 'conversion_rate' || kpi.id === 'total_revenue') {
                          setActiveTab('reservas');
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* KPIs: Proceso 2 */}
              <div style={styles.processSection}>
                <div style={styles.processHeader}>
                  <div style={styles.processTitleLine}>
                    <div style={{ ...styles.processIconDot, backgroundColor: '#06b6d4' }} />
                    <h3 style={styles.processTitle}>Proceso 2: Check-in y Embarque</h3>
                  </div>
                  <span style={{ ...styles.processBadge, backgroundColor: '#ecfeff', color: '#0891b2' }}>
                    Filtros, Seguridad y Puertas
                  </span>
                </div>
                <div style={styles.kpiGrid}>
                  {checkinKpis.map(kpi => (
                    <KpiCard 
                      key={kpi.id} 
                      kpi={kpi}
                      onClick={() => {
                        if (kpi.id === 'document_issues' || kpi.id === 'security_not_authorized') {
                          setActiveTab('checkin');
                        } else {
                          setActiveTab('checkin');
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sales Line Chart */}
              <SalesLineChart 
                data={salesEvolutionData} 
                onExport={() => showToast('📥 Reporte de ventas CSV descargado correctamente.')}
              />

              {/* Stage Bar Charts */}
              <div style={styles.chartsGrid}>
                <StageBarChart 
                  title="Reservas por etapa del proceso"
                  subtitle="Embudo comercial: Búsqueda → Bloqueo → Autorización → Emisión"
                  data={bookingsByStageData}
                  categoryKey="etapa"
                  dataKey="cantidad"
                  badgeText="Proceso Comercial"
                />
                <StageBarChart 
                  title="Pasajeros por etapa de check-in"
                  subtitle="Flujo en aeropuerto: Solicitud → Docs → Equipaje → Filtro → Abordaje"
                  data={passengersByCheckinData}
                  categoryKey="etapa"
                  dataKey="cantidad"
                  badgeText="Proceso Operacional"
                />
              </div>

              {/* Activity + Bookings */}
              <div style={styles.bottomGrid}>
                <div style={styles.activityCol}>
                  <ActivityCard />
                </div>
                <div style={styles.bookingsCol}>
                  <BookingsList 
                    bookings={filteredBookings}
                    passengers={passengers}
                    flights={flights}
                    onOpenRejectedModal={() => setIsRejectedModalOpen(true)}
                  />
                </div>
              </div>
            </>
          )}

          {/* TAB: RESERVAS */}
          {activeTab === 'reservas' && (
            <div style={styles.dedicatedTabWrapper}>
              <Filters 
                filters={filters}
                setFilters={setFilters}
                flights={flights}
                agents={agents}
                onResetFilters={resetFilters}
                totalBookingsCount={bookings.length}
                filteredBookingsCount={filteredBookings.length}
                totalCheckinsCount={checkins.length}
                filteredCheckinsCount={filteredCheckins.length}
              />
              <div style={styles.kpiGrid}>
                {reservationKpis.map(kpi => (
                  <KpiCard key={kpi.id} kpi={kpi} />
                ))}
              </div>
              <BookingsList 
                bookings={filteredBookings}
                passengers={passengers}
                flights={flights}
                onOpenRejectedModal={() => setIsRejectedModalOpen(true)}
              />
            </div>
          )}

          {/* TAB: CHECK-IN & SALAS */}
          {activeTab === 'checkin' && (
            <div style={styles.dedicatedTabWrapper}>
              <Filters 
                filters={filters}
                setFilters={setFilters}
                flights={flights}
                agents={agents}
                onResetFilters={resetFilters}
                totalBookingsCount={bookings.length}
                filteredBookingsCount={filteredBookings.length}
                totalCheckinsCount={checkins.length}
                filteredCheckinsCount={filteredCheckins.length}
              />
              <div style={styles.kpiGrid}>
                {checkinKpis.map(kpi => (
                  <KpiCard key={kpi.id} kpi={kpi} />
                ))}
              </div>
              {/* CheckinView reads from context internally */}
              <CheckinView />
            </div>
          )}

          {/* TAB: VUELOS ACTIVOS */}
          {activeTab === 'vuelos' && (
            <FlightsView 
              flights={flights}
              agents={agents}
              bookings={bookings}
              checkins={checkins}
              onOpenReassignModal={() => setIsReassignModalOpen(true)}
            />
          )}

          {/* TAB: PASAJEROS */}
          {activeTab === 'pasajeros' && (
            <PassengersView 
              passengers={passengers}
              bookings={bookings}
            />
          )}
        </main>
      </div>

      {/* OPERATIONAL MODALS */}
      <AgentReassignModal 
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        agents={agents}
        flights={flights}
        onReassignAgent={reassignAgent}
      />

      <RejectedPaymentsModal 
        isOpen={isRejectedModalOpen}
        onClose={() => setIsRejectedModalOpen(false)}
        bookings={bookings}
        passengers={passengers}
        flights={flights}
        onUpdateBookingStatus={updateBookingStatus}
      />

      <SecurityIncidentsModal 
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        checkins={checkins}
        passengers={passengers}
        flights={flights}
        onResolveCheckin={(id, updates) => {
          // Legacy modal - just show a toast. Real resolution goes through CheckinActionModal.
          showToast('✅ Incidencia resuelta desde panel de seguridad.');
        }}
      />

      <SettingsHelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        mode="help"
      />

      <SettingsHelpModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        mode="settings"
      />

      {/* Floating n8n AI Chat */}
      <FloatingChat />
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed',
    top: '20px',
    right: '24px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '16px',
    fontSize: '0.84rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
    zIndex: 2000,
    animation: 'fadeIn 0.25s ease'
  },
  processSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  processHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px'
  },
  processTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  processIconDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%'
  },
  processTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#334155',
    letterSpacing: '-0.01em',
    textTransform: 'uppercase'
  },
  processBadge: {
    fontSize: '0.71875rem',
    fontWeight: '700',
    padding: '2px 9px',
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    borderRadius: '9999px',
    letterSpacing: '0.02em'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '16px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '20px',
    alignItems: 'stretch'
  },
  activityCol: {
    height: '100%'
  },
  bookingsCol: {
    height: '100%'
  },
  dedicatedTabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px'
  }
};
