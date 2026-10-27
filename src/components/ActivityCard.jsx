import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Plane
} from 'lucide-react';
import { useOperations } from '../context/OperationsContext';
import { getActivityFeed } from '../utils/kpis';

export default function ActivityCard() {
  const { filteredCheckins: checkins, passengers, flights, openManageModal } = useOperations();
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // 1 = Mar 19 Oct (default active)

  const weekDays = [
    { dayName: 'Lun', dayNum: 18, dateStr: '2026-10-18' },
    { dayName: 'Mar', dayNum: 19, dateStr: '2026-10-19' },
    { dayName: 'Mié', dayNum: 20, dateStr: '2026-10-20' },
    { dayName: 'Jue', dayNum: 21, dateStr: '2026-10-21' },
    { dayName: 'Vie', dayNum: 22, dateStr: '2026-10-22' },
    { dayName: 'Sáb', dayNum: 23, dateStr: '2026-10-23' },
    { dayName: 'Dom', dayNum: 24, dateStr: '2026-10-24' },
  ];

  const selectedDateStr = weekDays[selectedDayIndex].dateStr;

  // Deriving activity items via useMemo and utils/kpis helper
  const activityList = useMemo(() => {
    return getActivityFeed(checkins, passengers, flights, selectedDateStr);
  }, [checkins, passengers, flights, selectedDateStr]);

  return (
    <div style={styles.card} className="ui-card">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Actividad</h3>
          <p style={styles.dateLabel}>
            {weekDays[selectedDayIndex].dayName} {weekDays[selectedDayIndex].dayNum} de Octubre, 2026 · Agenda Operacional
          </p>
        </div>
        <button 
          onClick={() => {
            const first = checkins.find(c => {
              const st = c.estado || c.status;
              const sec = c.seguridad || c.security_result;
              return st === 'not_authorized' || sec === 'not_authorized' || st === 'document_issue';
            });
            if (first) openManageModal(first);
          }}
          style={styles.addPlanBtn}
          title="Ver o resolver alertas de seguridad"
        >
          <Plus size={15} color="#ffffff" />
          <span>+ Incidencias</span>
        </button>
      </div>

      {/* Weekday Strip */}
      <div style={styles.weekStrip}>
        {weekDays.map((item, index) => {
          const isSelected = selectedDayIndex === index;
          return (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              style={{
                ...styles.dayBtn,
                ...(isSelected ? styles.dayBtnSelected : {})
              }}
              title={`Ver actividad del ${item.dayName} ${item.dayNum}`}
            >
              <span style={{
                ...styles.dayName,
                color: isSelected ? '#1e6bff' : '#94a3b8'
              }}>
                {item.dayName}
              </span>
              <span style={{
                ...styles.dayNum,
                color: isSelected ? '#0f172a' : '#64748b',
                fontWeight: isSelected ? '800' : '500'
              }}>
                {item.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline items list */}
      <div style={styles.timelineList}>
        {activityList.map((item) => {
          const isCritical = item.colorClass === 'critical';
          const isWarning = item.colorClass === 'warning';
          const isSuccess = item.colorClass === 'success';

          return (
            <div key={item.id} style={styles.timelineItem}>
              {/* Time column */}
              <div style={styles.timeColumn}>
                <span style={styles.timeText}>{item.time}</span>
              </div>

              {/* Event card with pastel styling */}
              <div 
                style={{
                  ...styles.eventCard,
                  ...(isCritical ? styles.criticalCard : 
                     isWarning ? styles.warningCard : 
                     isSuccess ? styles.successCard : styles.normalCard)
                }}
              >
                <div style={styles.eventCardHeader}>
                  <div style={styles.badgeLine}>
                    <span style={{
                      ...styles.airportBadge,
                      backgroundColor: isCritical ? '#fee2e2' : isWarning ? '#fef3c7' : '#ede9fe',
                      color: isCritical ? '#b91c1c' : isWarning ? '#b45309' : '#6d28d9'
                    }}>
                      {item.flightCode}
                    </span>
                    <span style={styles.routeText}>{item.route}</span>
                  </div>

                  {/* Quick Action Button - Excluded for finalized denied/cancelled */}
                  {(isCritical || isWarning) && !(
                    item.rawCheckin?.status === 'denied' ||
                    item.rawCheckin?.estado === 'denied' ||
                    item.rawCheckin?.status === 'cancelled' ||
                    item.rawCheckin?.estado === 'cancelled'
                  ) && (
                    <button 
                      onClick={() => openManageModal(item.rawCheckin)}
                      style={{
                        ...styles.resolveBtn,
                        backgroundColor: isCritical ? '#ef4444' : '#f59e0b',
                        color: '#ffffff'
                      }}
                      title="Tomar decisión sobre pasajero"
                    >
                      <span>Gestionar</span>
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={styles.eventTitleRow}>
                  {isCritical ? (
                    <ShieldAlert size={16} color="#ef4444" />
                  ) : isWarning ? (
                    <AlertTriangle size={16} color="#f59e0b" />
                  ) : (
                    <CheckCircle2 size={16} color="#8b5cf6" />
                  )}
                  <span style={styles.eventTitle}>{item.title}</span>
                </div>

                <p style={styles.eventPax}>
                  <strong>{item.paxName}</strong> (Doc: {item.docNum})
                </p>

                {item.detail && (
                  <p style={styles.eventDetail}>{item.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #e8ecf2',
    boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  dateLabel: {
    fontSize: '0.8125rem',
    color: '#64748b',
    marginTop: '2px'
  },
  addPlanBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#1e6bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(30, 107, 255, 0.3)',
    transition: 'all 0.2s ease'
  },
  weekStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '20px',
    padding: '4px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #f1f5f9'
  },
  dayBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 4px',
    borderRadius: '14px',
    border: '1.5px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  dayBtnSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#0f172a',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
  },
  dayName: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  dayNum: {
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif"
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    overflowY: 'auto',
    maxHeight: '440px',
    paddingRight: '4px'
  },
  timelineItem: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start'
  },
  timeColumn: {
    width: '64px',
    flexShrink: 0,
    paddingTop: '8px'
  },
  timeText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b'
  },
  eventCard: {
    flex: 1,
    borderRadius: '18px',
    padding: '14px 16px',
    border: '1px solid transparent',
    transition: 'all 0.2s ease'
  },
  normalCard: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ede9fe'
  },
  successCard: {
    backgroundColor: '#ecfeff',
    borderColor: '#cffafe'
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7'
  },
  criticalCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2'
  },
  eventCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  badgeLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  airportBadge: {
    fontSize: '0.6875rem',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '6px',
    letterSpacing: '0.04em'
  },
  routeText: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b'
  },
  resolveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: 'none',
    borderRadius: '9999px',
    padding: '3px 9px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  eventTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  eventTitle: {
    fontSize: '0.84rem',
    fontWeight: '700',
    color: '#0f172a'
  },
  eventPax: {
    fontSize: '0.75rem',
    color: '#334155',
    marginBottom: '3px'
  },
  eventDetail: {
    fontSize: '0.71875rem',
    color: '#64748b',
    lineHeight: 1.3
  }
};
