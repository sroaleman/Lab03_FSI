import React, { createContext, useContext, useState, useMemo } from 'react';

import { 
  INITIAL_AGENTS, 
  INITIAL_FLIGHTS, 
  INITIAL_PASSENGERS, 
  INITIAL_BOOKINGS, 
  INITIAL_CHECKINS 
} from '../data/mockData';

import { 
  calculateOperationalKpis, 
  getSalesEvolution, 
  getBookingsByStage, 
  getPassengersByCheckinStage,
  getPriorPeriodDates,
  getBookingAmount,
  getBookingStatus,
  getCheckinStatus,
  getSecurityResult,
  isDocumentValid,
  isSecurityAuthorized
} from '../utils/kpis';

const OperationsContext = createContext(null);

export function OperationsProvider({ children }) {
  // -------------------------------------------------------------
  // 1. MASTER STATE (The SINGLE source of truth for the app)
  // -------------------------------------------------------------
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [flights, setFlights] = useState(INITIAL_FLIGHTS);
  const [passengers, setPassengers] = useState(INITIAL_PASSENGERS);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [checkins, setCheckins] = useState(INITIAL_CHECKINS);

  // Active filters state
  const [filters, setFilters] = useState({
    dateRange: 'all',
    startDate: '',
    endDate: '',
    flightRoute: 'all',
    channel: 'all',
    agentId: 'all'
  });

  // Global search input
  const [searchQuery, setSearchQuery] = useState('');

  // Selected check-in for the "Gestionar" modal
  const [managingCheckin, setManagingCheckin] = useState(null);

  // Selected booking for the "Gestionar" modal
  const [managingBooking, setManagingBooking] = useState(null);

  // Toast notification message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // 2. PERIOD DATES DERIVATION
  // -------------------------------------------------------------
  const periodDates = useMemo(() => {
    return getPriorPeriodDates(filters);
  }, [filters]);

  // Helper date checker (includes up to 23:59:59 of end date)
  const dateMatches = (rawDate, start, end) => {
    if (!start && !end) return true;
    const itemDate = new Date(rawDate || '2026-10-19');
    if (start) {
      const s = new Date(start.length === 10 ? `${start}T00:00:00` : start);
      if (itemDate < s) return false;
    }
    if (end) {
      const e = new Date(end.length === 10 ? `${end}T23:59:59.999` : end);
      if (itemDate > e) return false;
    }
    return true;
  };

  // -------------------------------------------------------------
  // 3. DERIVED FILTERED DATASETS (Memoized reactively)
  // -------------------------------------------------------------
  const filteredBookings = useMemo(() => {
    const { currentStart, currentEnd } = periodDates;

    return bookings.filter(b => {
      const flightId = b.flight_id || b.vuelo_id;
      const channel = b.booking_channel || b.canal;
      const rawDate = b.fecha || b.created_at || '2026-10-19';

      // Flight filter
      if (filters.flightRoute !== 'all' && flightId !== filters.flightRoute) {
        return false;
      }

      // Channel filter
      if (filters.channel !== 'all' && channel !== filters.channel) {
        return false;
      }

      // Agent filter
      if (filters.agentId !== 'all') {
        const flight = flights.find(f => f.id === flightId);
        const matchesDirectAgent = b.agent_id === filters.agentId;
        const matchesFlightAgent = flight && (
          flight.assigned_checkin_agent_id === filters.agentId ||
          flight.assigned_gate_agent_id === filters.agentId
        );
        if (!matchesDirectAgent && !matchesFlightAgent) return false;
      }

      // Date Range filter
      if (periodDates.hasDateFilter && !dateMatches(rawDate, currentStart, currentEnd)) {
        return false;
      }

      // Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pax = passengers.find(p => p.id === (b.passenger_id || b.pasajero_id));
        const flight = flights.find(f => f.id === flightId);
        const matchesPnr = (b.pnr || '').toLowerCase().includes(q);
        const matchesPax = pax && (pax.nombre || pax.full_name || '').toLowerCase().includes(q);
        const matchesFlight = flight && (
          flight.flight_number.toLowerCase().includes(q) ||
          flight.origin.toLowerCase().includes(q) ||
          flight.destination.toLowerCase().includes(q)
        );
        if (!matchesPnr && !matchesPax && !matchesFlight) return false;
      }

      return true;
    });
  }, [bookings, filters, searchQuery, passengers, flights, periodDates]);

  const filteredCheckins = useMemo(() => {
    const { currentStart, currentEnd } = periodDates;

    return checkins.filter(c => {
      const flightId = c.flight_id || c.vuelo_id;
      const rawDate = c.fecha || c.timestamp || '2026-10-19';

      // Flight filter
      if (filters.flightRoute !== 'all' && flightId !== filters.flightRoute) {
        return false;
      }

      // Channel filter (via booking)
      if (filters.channel !== 'all') {
        const booking = bookings.find(b => b.id === (c.reserva_id || c.booking_id));
        const channel = booking ? (booking.booking_channel || booking.canal) : null;
        if (channel && channel !== filters.channel) return false;
      }

      // Agent filter
      if (filters.agentId !== 'all') {
        const flight = flights.find(f => f.id === flightId);
        const matchesDirectAgent = c.assigned_agent_id === filters.agentId;
        const matchesFlightAgent = flight && (
          flight.assigned_checkin_agent_id === filters.agentId ||
          flight.assigned_gate_agent_id === filters.agentId
        );
        if (!matchesDirectAgent && !matchesFlightAgent) return false;
      }

      // Date Range filter
      if (periodDates.hasDateFilter && !dateMatches(rawDate, currentStart, currentEnd)) {
        return false;
      }

      // Global Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pax = passengers.find(p => p.id === (c.passenger_id || c.pasajero_id));
        const flight = flights.find(f => f.id === flightId);
        const matchesPax = pax && (
          (pax.nombre || pax.full_name || '').toLowerCase().includes(q) ||
          (pax.documento || pax.document_number || '').includes(q)
        );
        const matchesFlight = flight && (
          flight.flight_number.toLowerCase().includes(q) ||
          flight.origin.toLowerCase().includes(q) ||
          flight.destination.toLowerCase().includes(q)
        );
        const matchesSeat = (c.seat || '').toLowerCase().includes(q);
        if (!matchesPax && !matchesFlight && !matchesSeat) return false;
      }

      return true;
    });
  }, [checkins, bookings, filters, searchQuery, passengers, flights, periodDates]);

  // Prior Period datasets (matching all other filters, but with prior period date range)
  const priorBookings = useMemo(() => {
    if (!periodDates.hasDateFilter || !periodDates.priorStart) return [];
    const { priorStart, priorEnd } = periodDates;

    return bookings.filter(b => {
      const flightId = b.flight_id || b.vuelo_id;
      const channel = b.booking_channel || b.canal;
      const rawDate = b.fecha || b.created_at || '2026-10-19';

      if (filters.flightRoute !== 'all' && flightId !== filters.flightRoute) return false;
      if (filters.channel !== 'all' && channel !== filters.channel) return false;

      if (filters.agentId !== 'all') {
        const flight = flights.find(f => f.id === flightId);
        const matchesDirectAgent = b.agent_id === filters.agentId;
        const matchesFlightAgent = flight && (
          flight.assigned_checkin_agent_id === filters.agentId ||
          flight.assigned_gate_agent_id === filters.agentId
        );
        if (!matchesDirectAgent && !matchesFlightAgent) return false;
      }

      if (!dateMatches(rawDate, priorStart, priorEnd)) return false;

      return true;
    });
  }, [bookings, filters, flights, periodDates]);

  const priorCheckins = useMemo(() => {
    if (!periodDates.hasDateFilter || !periodDates.priorStart) return [];
    const { priorStart, priorEnd } = periodDates;

    return checkins.filter(c => {
      const flightId = c.flight_id || c.vuelo_id;
      const rawDate = c.fecha || c.timestamp || '2026-10-19';

      if (filters.flightRoute !== 'all' && flightId !== filters.flightRoute) return false;

      if (filters.channel !== 'all') {
        const booking = bookings.find(b => b.id === (c.reserva_id || c.booking_id));
        const channel = booking ? (booking.booking_channel || booking.canal) : null;
        if (channel && channel !== filters.channel) return false;
      }

      if (filters.agentId !== 'all') {
        const flight = flights.find(f => f.id === flightId);
        const matchesDirectAgent = c.assigned_agent_id === filters.agentId;
        const matchesFlightAgent = flight && (
          flight.assigned_checkin_agent_id === filters.agentId ||
          flight.assigned_gate_agent_id === filters.agentId
        );
        if (!matchesDirectAgent && !matchesFlightAgent) return false;
      }

      if (!dateMatches(rawDate, priorStart, priorEnd)) return false;

      return true;
    });
  }, [checkins, bookings, filters, flights, periodDates]);

  const hasPriorData = useMemo(() => {
    return Boolean(periodDates.hasDateFilter && (priorBookings.length > 0 || priorCheckins.length > 0));
  }, [periodDates, priorBookings, priorCheckins]);

  // -------------------------------------------------------------
  // 4. DERIVED KPIS AND CHARTS (Recalculated instantly on changes)
  // -------------------------------------------------------------
  const { reservationKpis, checkinKpis } = useMemo(() => {
    return calculateOperationalKpis(
      filteredBookings, 
      filteredCheckins, 
      priorBookings, 
      priorCheckins, 
      hasPriorData
    );
  }, [filteredBookings, filteredCheckins, priorBookings, priorCheckins, hasPriorData]);

  const salesEvolutionData = useMemo(() => {
    return getSalesEvolution(filteredBookings);
  }, [filteredBookings]);

  const bookingsByStageData = useMemo(() => {
    return getBookingsByStage(filteredBookings);
  }, [filteredBookings]);

  const passengersByCheckinData = useMemo(() => {
    return getPassengersByCheckinStage(filteredCheckins);
  }, [filteredCheckins]);

  const rejectedCount = useMemo(() => {
    return bookings.filter(b => getBookingStatus(b) === 'payment_rejected').length;
  }, [bookings]);

  const criticalAlertsCount = useMemo(() => {
    return checkins.filter(c => {
      const authorized = isSecurityAuthorized(c);
      const valid = isDocumentValid(c);
      const st = getCheckinStatus(c);
      return (!authorized || !valid || st === 'not_authorized' || st === 'document_issue' || st === 'gate_issue') && 
             st !== 'completed' && st !== 'boarded' && st !== 'denied' && st !== 'cancelled';
    }).length;
  }, [checkins]);

  // -------------------------------------------------------------
  // 5. MASTER UPDATE FUNCTIONS BY ID
  // -------------------------------------------------------------

  /**
   * Directly updates a check-in by id with partial fields
   */
  const updateCheckin = (checkinId, updates = {}) => {
    setCheckins(prev => prev.map(item => {
      if (item.id !== checkinId) return item;
      return { ...item, ...updates };
    }));
  };

  /**
   * Directly updates a booking by id with partial fields
   */
  const updateBooking = (bookingId, updates = {}) => {
    setBookings(prev => prev.map(item => {
      if (item.id !== bookingId) return item;
      return { ...item, ...updates };
    }));
  };

  // -------------------------------------------------------------
  // 6. BPMN OPERATIONAL ACTIONS
  // -------------------------------------------------------------

  /**
   * Dispatches BPMN check-in action:
   * 1. Control migratorio / Seguridad:
   *    - 'authorize_security': security_result = 'authorized', avanza a 'Puerta de embarque'
   *    - 'deny_security': security_result = 'not_authorized', status = 'denied' (evento final)
   * 2. Verificación de documentos:
   *    - 'validate_documents': documents_valid = true, avanza a 'Equipaje' o 'Pasabordo emitido'
   *    - 'request_counter_correction': se solicita corrección en counter (vuelve a verificar)
   *    - 'cancel_checkin': status = 'cancelled' (evento final)
   * 3. Puerta de embarque:
   *    - 'confirm_boarded': status = 'boarded', stage = 'Abordado', registra boarded_at
   *    - 'gate_issue': gate_pass_valid = false, gate_incident = motivo (se queda en puerta)
   */
  const manageCheckin = (checkinId, actionType, payload = {}) => {
    let feedbackToast = '';

    setCheckins(prev => prev.map(item => {
      if (item.id !== checkinId) return item;

      if (actionType === 'authorize_security') {
        feedbackToast = '✅ Seguridad: Paso autorizado. El pasajero avanzó a Puerta de embarque.';
        return {
          ...item,
          security_result: 'authorized',
          seguridad: 'authorized',
          stage: 'Puerta de embarque',
          etapa: 'Puerta de embarque',
          status: 'completed',
          estado: 'completed',
          incident_detail: 'Inspección de seguridad aprobada por supervisión. Autorizado para abordar.'
        };
      }

      if (actionType === 'deny_security') {
        const reason = payload.reason || 'Paso denegado en control migratorio/seguridad por directriz oficial.';
        feedbackToast = '🚫 Seguridad: Paso denegado. Pasajero no autorizado para continuar.';
        return {
          ...item,
          security_result: 'not_authorized',
          seguridad: 'not_authorized',
          status: 'denied',
          estado: 'denied',
          stage: 'Denegados/Cancelados',
          etapa: 'Denegados/Cancelados',
          denial_reason: reason,
          gate_incident: reason,
          incident_detail: reason
        };
      }

      if (actionType === 'validate_documents') {
        const nextStage = (item.tiene_equipaje || item.peso_kg > 0) ? 'Equipaje' : 'Pasabordo emitido';
        feedbackToast = `✅ Documentos: Marcados como válidos. El pasajero avanzó a ${nextStage}.`;
        return {
          ...item,
          documents_valid: true,
          documentos_validos: true,
          document_status: 'verified',
          stage: nextStage,
          etapa: nextStage,
          status: 'completed',
          estado: 'completed',
          counter_correction_requested: false,
          incident_detail: 'Validación de documentos completada con éxito.'
        };
      }

      if (actionType === 'request_counter_correction') {
        const reason = payload.reason || 'Se solicitó corrección documental en mostrador. Pasajero en proceso de subsanación.';
        feedbackToast = '📋 Documentos: Solicitud de corrección enviada al counter.';
        return {
          ...item,
          documents_valid: false,
          documentos_validos: false,
          document_status: 'issue',
          status: 'document_issue',
          estado: 'document_issue',
          counter_correction_requested: true,
          incident_detail: reason
        };
      }

      if (actionType === 'cancel_checkin') {
        const reason = payload.reason || 'Check-in cancelado por novedad documental o desistimiento.';
        feedbackToast = '❌ Check-in: Proceso cancelado definitivamente.';
        return {
          ...item,
          status: 'cancelled',
          estado: 'cancelled',
          stage: 'Denegados/Cancelados',
          etapa: 'Denegados/Cancelados',
          cancellation_reason: reason,
          incident_detail: reason
        };
      }

      if (actionType === 'confirm_boarded') {
        feedbackToast = '🛫 Embarque: Pasajero confirmado como Abordado en la aeronave.';
        return {
          ...item,
          status: 'boarded',
          estado: 'boarded',
          stage: 'Abordado',
          etapa: 'Abordado',
          stage_id: 's-chk-7',
          gate_status: 'boarded',
          boarded_at: new Date().toISOString(),
          incident_detail: null
        };
      }

      if (actionType === 'gate_issue') {
        const reason = payload.reason || 'Novedad de pasabordo o inspección secundaria registrada en sala.';
        feedbackToast = '⚠️ Puerta de embarque: Novedad registrada. Pasajero en espera de resolución.';
        return {
          ...item,
          gate_pass_valid: false,
          status: 'gate_issue',
          estado: 'gate_issue',
          stage: 'Puerta de embarque',
          etapa: 'Puerta de embarque',
          gate_incident: reason,
          incident_detail: reason
        };
      }

      return item;
    }));

    if (feedbackToast) {
      showToast(feedbackToast);
    }
    setManagingCheckin(null);
  };

  /**
   * Dispatches BPMN reservation actions:
   * - seat_held:
   *   'mark_paid': status = 'paid', paid_at = now, stage = 'Tiquete emitido'
   *   'mark_expired': status = 'expired', stage = 'Venta no concretada'
   * - payment_rejected:
   *   'retry_payment': status = 'paid', paid_at = now, stage = 'Tiquete emitido'
   */
  const manageBooking = (bookingId, actionType) => {
    let feedbackToast = '';

    setBookings(prev => prev.map(item => {
      if (item.id !== bookingId) return item;

      if (actionType === 'mark_paid' || actionType === 'retry_payment') {
        feedbackToast = actionType === 'retry_payment' 
          ? '🎉 Reintento de pago exitoso. Tiquete emitido e ingresos actualizados.' 
          : '🎉 Reserva confirmada y pagada. Ingresos y conversión recalculados al instante.';
        return {
          ...item,
          status: 'paid',
          estado: 'paid',
          paid_at: new Date().toISOString(),
          stage: 'Tiquete emitido',
          etapa: 'Tiquete emitido'
        };
      }

      if (actionType === 'mark_expired') {
        feedbackToast = 'ℹ️ Reserva marcada como expirada. Cupo liberado.';
        return {
          ...item,
          status: 'expired',
          estado: 'expired',
          stage: 'Venta no concretada',
          etapa: 'Venta no concretada'
        };
      }

      return item;
    }));

    if (feedbackToast) {
      showToast(feedbackToast);
    }
    setManagingBooking(null);
  };

  /**
   * Approves or expires a booking (legacy support for RejectedPaymentsModal)
   */
  const updateBookingStatus = (bookingId, newStatus, newStage) => {
    if (newStatus === 'paid') {
      manageBooking(bookingId, 'mark_paid');
    } else if (newStatus === 'expired') {
      manageBooking(bookingId, 'mark_expired');
    } else {
      updateBooking(bookingId, {
        status: newStatus,
        estado: newStatus,
        stage: newStage || (newStatus === 'paid' ? 'Tiquete emitido' : 'Venta no concretada'),
        etapa: newStage || (newStatus === 'paid' ? 'Tiquete emitido' : 'Venta no concretada')
      });
      showToast(`ℹ️ Reserva actualizada a '${newStatus}'.`);
    }
  };

  /**
   * Reassigns personnel
   */
  const reassignAgent = (agentId, updates) => {
    setAgents(prev => prev.map(ag => ag.id === agentId ? { ...ag, ...updates } : ag));

    if (updates.assigned_flight_id) {
      setFlights(prev => prev.map(fl => {
        if (fl.id === updates.assigned_flight_id) {
          const agent = agents.find(a => a.id === agentId);
          if (agent?.role === 'checkin_agent') {
            return { ...fl, assigned_checkin_agent_id: agentId, counter: updates.location || fl.counter };
          } else {
            return { ...fl, assigned_gate_agent_id: agentId, gate: updates.location || fl.gate };
          }
        }
        return fl;
      }));
    }

    const ag = agents.find(a => a.id === agentId);
    showToast(`✅ Agente ${ag?.full_name || ag?.nombre} reasignado exitosamente.`);
  };

  /**
   * Resets all filters
   */
  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      startDate: '',
      endDate: '',
      flightRoute: 'all',
      channel: 'all',
      agentId: 'all'
    });
    setSearchQuery('');
    showToast('🔄 Todos los filtros operacionales han sido limpiados.');
  };

  const openManageModal = (checkin) => {
    setManagingCheckin(checkin);
  };

  const closeManageModal = () => {
    setManagingCheckin(null);
  };

  const openManageBookingModal = (booking) => {
    setManagingBooking(booking);
  };

  const closeManageBookingModal = () => {
    setManagingBooking(null);
  };

  const value = {
    // Master data
    agents,
    flights,
    passengers,
    bookings,
    checkins,
    // Filtered data
    filteredBookings,
    filteredCheckins,
    priorBookings,
    priorCheckins,
    hasPriorData,
    // KPIs & Charts
    reservationKpis,
    checkinKpis,
    salesEvolutionData,
    bookingsByStageData,
    passengersByCheckinData,
    rejectedCount,
    criticalAlertsCount,
    // Filter controls
    filters,
    setFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
    // ID update functions
    updateCheckin,
    updateBooking,
    // BPMN Actions
    manageCheckin,
    manageBooking,
    updateBookingStatus,
    reassignAgent,
    showToast,
    // Check-in Manage modal control
    managingCheckin,
    openManageModal,
    closeManageModal,
    // Booking Manage modal control
    managingBooking,
    openManageBookingModal,
    closeManageBookingModal,
    toastMessage
  };

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
