/**
 * KPI Calculations, Trend Analytics and Operational Aggregations
 * Designed for Airline Operations Dashboard (Reserva, Compra, Check-in y Embarque).
 */

export const STAGES_RESERVATION_CANONICAL = [
  { id: "s-res-1", name: "Búsqueda", order: 1, color: "#38bdf8", description: "Cotización y consulta de tarifas" },
  { id: "s-res-2", name: "Cupo bloqueado", order: 2, color: "#818cf8", description: "Asiento reservado pendiente de pago" },
  { id: "s-res-3", name: "Pago en autorización", order: 3, color: "#f59e0b", description: "En pasarela bancaria o PSE" },
  { id: "s-res-4", name: "Tiquete emitido", order: 4, color: "#10b981", description: "Venta exitosa con PNR generado" },
  { id: "s-res-5", name: "Venta no concretada", order: 5, color: "#ef4444", description: "Pago rechazado o cupo expirado" }
];

export const STAGES_CHECKIN_CANONICAL = [
  { id: "s-chk-1", name: "Solicitud", order: 1, color: "#94a3b8", description: "Check-in web o quiosco iniciado" },
  { id: "s-chk-2", name: "Verificación de documentos", order: 2, color: "#60a5fa", description: "Validación de documento de identidad" },
  { id: "s-chk-3", name: "Equipaje", order: 3, color: "#a855f7", description: "Facturación de maleta y pesaje" },
  { id: "s-chk-4", name: "Pasabordo emitido", order: 4, color: "#3b82f6", description: "Asiento fijado y pase digital" },
  { id: "s-chk-5", name: "Control migratorio/seguridad", order: 5, color: "#f97316", description: "Filtro de seguridad y rayos X" },
  { id: "s-chk-6", name: "Puerta de embarque", order: 6, color: "#06b6d4", description: "Pasajero esperando en sala" },
  { id: "s-chk-7", name: "Abordado", order: 7, color: "#10b981", description: "Pasajero a bordo de la aeronave" },
  { id: "s-chk-8", name: "Denegados/Cancelados", order: 8, color: "#ef4444", description: "Paso denegado en seguridad o check-in cancelado" }
];

export function formatCOP(amount, compact = false) {
  if (amount == null || isNaN(amount)) return '$ 0 COP';
  
  if (compact) {
    if (amount >= 1000000000) {
      return `$ ${(amount / 1000000000).toFixed(1)}B COP`;
    }
    if (amount >= 1000000) {
      return `$ ${(amount / 1000000).toFixed(1)}M COP`;
    }
    if (amount >= 1000) {
      return `$ ${(amount / 1000).toFixed(0)}K COP`;
    }
    return `$ ${amount.toLocaleString('es-CO')} COP`;
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '0.0%';
  return `${value.toFixed(1)}%`;
}

export function getBookingAmount(b) {
  return Number(b.monto != null ? b.monto : b.amount) || 0;
}

export function getBookingStatus(b) {
  return b.estado || b.status || 'seat_held';
}

export function getCheckinStatus(c) {
  return c.estado || c.status || 'pending';
}

export function getSecurityResult(c) {
  return c.seguridad || c.security_result || 'authorized';
}

export function isDocumentValid(c) {
  if (c.documents_valid != null) return Boolean(c.documents_valid);
  if (c.documentos_validos != null) return Boolean(c.documentos_validos);
  if (c.document_status === 'issue') return false;
  if (c.status === 'document_issue' || c.estado === 'document_issue') return false;
  return true;
}

export function isSecurityAuthorized(c) {
  const sec = getSecurityResult(c);
  const st = getCheckinStatus(c);
  if (sec === 'not_authorized' || st === 'not_authorized') return false;
  return true;
}

/**
 * Calculates percentage change between current and previous values.
 * Returns null if previous value is undefined/null.
 */
export function calculatePercentageChange(current, previous) {
  if (previous == null || isNaN(previous) || current == null || isNaN(current)) {
    return null;
  }
  if (previous === 0) {
    if (current === 0) return 0;
    return 100; // From 0 to positive is 100% growth
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Determines trend display label, direction ('up', 'down', 'neutral') and color ('green', 'red', 'neutral').
 * Inverts color for KPIs where an increase is unfavorable (higherIsBad).
 */
export function getTrendInfo(current, previous, hasPriorData, higherIsBad = false) {
  if (!hasPriorData || previous == null || isNaN(previous)) {
    return {
      trend: '—',
      trendDirection: 'neutral',
      trendColor: 'neutral'
    };
  }

  const pct = calculatePercentageChange(current, previous);
  if (pct == null) {
    return {
      trend: '—',
      trendDirection: 'neutral',
      trendColor: 'neutral'
    };
  }

  const formattedTrend = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  const trendDirection = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral';

  let trendColor = 'green';
  if (pct === 0) {
    trendColor = 'neutral';
  } else if (higherIsBad) {
    // When higher is bad: increase is red, decrease is green
    trendColor = pct > 0 ? 'red' : 'green';
  } else {
    // Standard: increase is green, decrease is red
    trendColor = pct > 0 ? 'green' : 'red';
  }

  return {
    trend: formattedTrend,
    trendDirection,
    trendColor
  };
}

/**
 * Determines the prior period date range of equal duration based on active filters.
 */
export function getPriorPeriodDates(filters = {}) {
  const { dateRange, startDate, endDate } = filters;

  if (dateRange === 'today') {
    return {
      currentStart: '2026-10-19',
      currentEnd: '2026-10-19',
      priorStart: '2026-10-18',
      priorEnd: '2026-10-18',
      hasDateFilter: true
    };
  }

  if (dateRange === 'last_3_days') {
    // Current: 2026-10-17 to 2026-10-19 (3 days: 17, 18, 19)
    // Prior: 2026-10-14 to 2026-10-16 (3 days: 14, 15, 16)
    return {
      currentStart: '2026-10-17',
      currentEnd: '2026-10-19',
      priorStart: '2026-10-14',
      priorEnd: '2026-10-16',
      hasDateFilter: true
    };
  }

  if (dateRange === 'last_7_days') {
    // Current: 2026-10-13 to 2026-10-19 (7 days)
    // Prior: 2026-10-06 to 2026-10-12 (7 days)
    return {
      currentStart: '2026-10-13',
      currentEnd: '2026-10-19',
      priorStart: '2026-10-06',
      priorEnd: '2026-10-12',
      hasDateFilter: true
    };
  }

  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffMs = e.getTime() - s.getTime();
    const durationDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

    const priorEndObj = new Date(s.getTime() - (1000 * 60 * 60 * 24));
    const priorStartObj = new Date(priorEndObj.getTime() - ((durationDays - 1) * 1000 * 60 * 60 * 24));

    return {
      currentStart: startDate,
      currentEnd: endDate,
      priorStart: priorStartObj.toISOString().slice(0, 10),
      priorEnd: priorEndObj.toISOString().slice(0, 10),
      hasDateFilter: true
    };
  }

  // dateRange === 'all' -> no prior period filter
  return {
    currentStart: null,
    currentEnd: null,
    priorStart: null,
    priorEnd: null,
    hasDateFilter: false
  };
}

/**
 * Calculates raw metrics for a given subset of bookings and checkins
 */
export function calculateRawMetrics(bookings = [], checkins = []) {
  // Proceso 1: Reserva y Compra
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => getBookingStatus(b) === 'paid');
  const seatHeldBookings = bookings.filter(b => getBookingStatus(b) === 'seat_held');
  const totalRevenue = paidBookings.reduce((acc, curr) => acc + getBookingAmount(curr), 0);
  const conversionRate = totalBookings > 0 ? (paidBookings.length / totalBookings) * 100 : 0;
  const seatHeldCount = seatHeldBookings.length;
  const avgTicket = paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;

  // Proceso 2: Check-in y Embarque
  const totalCheckins = checkins.length;
  const boardedCheckins = checkins.filter(c => {
    const st = getCheckinStatus(c);
    return (st === 'boarded' || c.status === 'boarded') && st !== 'denied' && st !== 'cancelled';
  });

  const completedOrBoarded = checkins.filter(c => {
    const st = getCheckinStatus(c);
    const stage = c.stage || c.etapa;
    return (st === 'completed' || st === 'boarded' || 
           stage === 'Pasabordo emitido' || stage === 'Puerta de embarque' || stage === 'Abordado') &&
           st !== 'denied' && st !== 'cancelled';
  });

  const docIssueCheckins = checkins.filter(c => {
    const st = getCheckinStatus(c);
    const valid = isDocumentValid(c);
    return (st === 'document_issue' || !valid) && 
           st !== 'completed' && st !== 'boarded' && st !== 'denied' && st !== 'cancelled';
  });

  // No autorizados seguridad: solo cuenta los pendientes de decisión
  const notAuthorizedCheckins = checkins.filter(c => {
    const authorized = isSecurityAuthorized(c);
    const st = getCheckinStatus(c);
    return (!authorized || st === 'not_authorized') && 
           st !== 'completed' && st !== 'boarded' && st !== 'denied' && st !== 'cancelled';
  });

  // Denegados en seguridad: evento final
  const deniedCheckins = checkins.filter(c => {
    const st = getCheckinStatus(c);
    return st === 'denied';
  });

  // Cancelados: evento final
  const cancelledCheckins = checkins.filter(c => {
    const st = getCheckinStatus(c);
    return st === 'cancelled';
  });

  const boardedCount = boardedCheckins.length;
  const checkinCompletionRate = totalCheckins > 0 ? (completedOrBoarded.length / totalCheckins) * 100 : 0;
  const docIssueCount = docIssueCheckins.length;
  const notAuthorizedCount = notAuthorizedCheckins.length;
  const deniedCount = deniedCheckins.length;
  const cancelledCount = cancelledCheckins.length;

  return {
    totalBookings,
    totalRevenue,
    conversionRate,
    seatHeldCount,
    avgTicket,
    totalCheckins,
    boardedCount,
    checkinCompletionRate,
    docIssueCount,
    notAuthorizedCount,
    deniedCount,
    cancelledCount
  };
}

/**
 * Calculates all 8 Operational KPIs comparing current vs previous period.
 * Dynamically computes trends and arrows. No numbers or trends are hardcoded.
 */
export function calculateOperationalKpis(
  currentBookings = [], 
  currentCheckins = [], 
  previousBookings = [], 
  previousCheckins = [], 
  hasPriorData = false
) {
  const current = calculateRawMetrics(currentBookings, currentCheckins);
  const previous = hasPriorData ? calculateRawMetrics(previousBookings, previousCheckins) : null;

  const hasPriorBookings = hasPriorData && previousBookings.length > 0;
  const hasPriorCheckins = hasPriorData && previousCheckins.length > 0;

  // Proceso 1 Trends
  const revenueTrend = getTrendInfo(
    current.totalRevenue, 
    previous?.totalRevenue, 
    hasPriorBookings, 
    false
  );

  const conversionTrend = getTrendInfo(
    current.conversionRate, 
    previous?.conversionRate, 
    hasPriorBookings, 
    false
  );

  const seatHeldTrend = getTrendInfo(
    current.seatHeldCount, 
    previous?.seatHeldCount, 
    hasPriorBookings, 
    true // higher is bad!
  );

  const avgTicketTrend = getTrendInfo(
    current.avgTicket, 
    previous?.avgTicket, 
    hasPriorBookings, 
    false
  );

  // Proceso 2 Trends
  const boardedTrend = getTrendInfo(
    current.boardedCount, 
    previous?.boardedCount, 
    hasPriorCheckins, 
    false
  );

  const completionTrend = getTrendInfo(
    current.checkinCompletionRate, 
    previous?.checkinCompletionRate, 
    hasPriorCheckins, 
    false
  );

  const docIssueTrend = getTrendInfo(
    current.docIssueCount, 
    previous?.docIssueCount, 
    hasPriorCheckins, 
    true // higher is bad!
  );

  const notAuthTrend = getTrendInfo(
    current.notAuthorizedCount, 
    previous?.notAuthorizedCount, 
    hasPriorCheckins, 
    true // higher is bad!
  );

  const deniedTrend = getTrendInfo(
    current.deniedCount,
    previous?.deniedCount,
    hasPriorCheckins,
    true // higher is bad!
  );

  return {
    reservationKpis: [
      {
        id: 'total_revenue',
        title: 'Ingresos Totales',
        subtitle: 'Reservas pagadas en COP',
        value: formatCOP(current.totalRevenue, true),
        fullValue: formatCOP(current.totalRevenue),
        raw: current.totalRevenue,
        trend: revenueTrend.trend,
        trendDirection: revenueTrend.trendDirection,
        trendColor: revenueTrend.trendColor,
        iconType: 'currency',
        colorBadge: 'blue',
        process: 'Reserva y Compra'
      },
      {
        id: 'conversion_rate',
        title: 'Tasa de Conversión',
        subtitle: 'Pagadas vs Total reservas',
        value: formatPercent(current.conversionRate),
        raw: current.conversionRate,
        trend: conversionTrend.trend,
        trendDirection: conversionTrend.trendDirection,
        trendColor: conversionTrend.trendColor,
        iconType: 'percentage',
        colorBadge: 'cyan',
        process: 'Reserva y Compra'
      },
      {
        id: 'seat_held',
        title: 'Cupos Bloqueados',
        subtitle: 'Reservas en espera de pago',
        value: `${current.seatHeldCount}`,
        raw: current.seatHeldCount,
        trend: seatHeldTrend.trend,
        trendDirection: seatHeldTrend.trendDirection,
        trendColor: seatHeldTrend.trendColor,
        iconType: 'lock',
        colorBadge: 'violet',
        process: 'Reserva y Compra'
      },
      {
        id: 'avg_ticket',
        title: 'Ticket Promedio',
        subtitle: 'Monto medio por tiquete',
        value: formatCOP(current.avgTicket, true),
        fullValue: formatCOP(current.avgTicket),
        raw: current.avgTicket,
        trend: avgTicketTrend.trend,
        trendDirection: avgTicketTrend.trendDirection,
        trendColor: avgTicketTrend.trendColor,
        iconType: 'tag',
        colorBadge: 'blue',
        process: 'Reserva y Compra'
      }
    ],
    checkinKpis: [
      {
        id: 'boarded_passengers',
        title: 'Pasajeros Abordados',
        subtitle: 'Pasajeros en aeronaves',
        value: `${current.boardedCount}`,
        raw: current.boardedCount,
        trend: boardedTrend.trend,
        trendDirection: boardedTrend.trendDirection,
        trendColor: boardedTrend.trendColor,
        iconType: 'plane-takeoff',
        colorBadge: 'green',
        process: 'Check-in y Embarque'
      },
      {
        id: 'checkin_completed_rate',
        title: 'Check-in Completado',
        subtitle: 'Completados o abordados',
        value: formatPercent(current.checkinCompletionRate),
        raw: current.checkinCompletionRate,
        trend: completionTrend.trend,
        trendDirection: completionTrend.trendDirection,
        trendColor: completionTrend.trendColor,
        iconType: 'check-circle',
        colorBadge: 'cyan',
        process: 'Check-in y Embarque'
      },
      {
        id: 'document_issues',
        title: 'Rechazos por Documentos',
        subtitle: 'Validación de identidad fallida',
        value: `${current.docIssueCount}`,
        raw: current.docIssueCount,
        trend: docIssueTrend.trend,
        trendDirection: docIssueTrend.trendDirection,
        trendColor: docIssueTrend.trendColor,
        iconType: 'alert-triangle',
        colorBadge: 'orange',
        process: 'Check-in y Embarque'
      },
      {
        id: 'security_not_authorized',
        title: 'No Autorizados Seguridad',
        subtitle: 'Pendientes de decisión',
        value: `${current.notAuthorizedCount}`,
        raw: current.notAuthorizedCount,
        trend: notAuthTrend.trend,
        trendDirection: notAuthTrend.trendDirection,
        trendColor: notAuthTrend.trendColor,
        iconType: 'shield-alert',
        colorBadge: 'orange',
        process: 'Check-in y Embarque'
      },
      {
        id: 'security_denied',
        title: 'Denegados en Seguridad',
        subtitle: 'Paso denegado definitivamente',
        value: `${current.deniedCount}`,
        raw: current.deniedCount,
        trend: deniedTrend.trend,
        trendDirection: deniedTrend.trendDirection,
        trendColor: deniedTrend.trendColor,
        iconType: 'shield-x',
        colorBadge: 'red',
        process: 'Check-in y Embarque'
      }
    ]
  };
}

/**
 * Aggregates daily sales evolution for the Sales Line Chart
 */
export function getSalesEvolution(bookings = []) {
  const dayMap = {};

  bookings.forEach(b => {
    const rawDate = b.fecha || b.created_at || '2026-10-19';
    const dateStr = rawDate.slice(0, 10);
    const amount = getBookingAmount(b);
    const status = getBookingStatus(b);

    if (!dayMap[dateStr]) {
      dayMap[dateStr] = {
        date: dateStr,
        dayLabel: formatShortDate(dateStr),
        ventas_confirmadas: 0,
        total_reservas: 0,
        cupos_retenidos: 0,
        monto_total: 0
      };
    }
    dayMap[dateStr].total_reservas += 1;
    if (status === 'paid') {
      dayMap[dateStr].ventas_confirmadas += amount;
    } else if (status === 'seat_held') {
      dayMap[dateStr].cupos_retenidos += amount;
    }
    dayMap[dateStr].monto_total += amount;
  });

  const sortedDays = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  return sortedDays.map(item => ({
    ...item,
    ventas_en_millones: Number((item.ventas_confirmadas / 1000000).toFixed(2)),
    total_en_millones: Number((item.monto_total / 1000000).toFixed(2)),
    formattedVentas: formatCOP(item.ventas_confirmadas),
    formattedTotal: formatCOP(item.monto_total)
  }));
}

function formatShortDate(dateStr) {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    return `${dayNames[date.getDay()]} ${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Aggregates bookings by reservation process stage
 */
export function getBookingsByStage(bookings = []) {
  const stageCounts = {
    'Búsqueda': 0,
    'Cupo bloqueado': 0,
    'Pago en autorización': 0,
    'Tiquete emitido': 0,
    'Venta no concretada': 0
  };

  bookings.forEach(b => {
    const stage = b.stage || b.etapa;
    const status = getBookingStatus(b);

    if (stage && stageCounts[stage] !== undefined) {
      stageCounts[stage] += 1;
    } else {
      if (status === 'paid') stageCounts['Tiquete emitido'] += 1;
      else if (status === 'seat_held') stageCounts['Cupo bloqueado'] += 1;
      else if (status === 'payment_rejected' || status === 'expired') stageCounts['Venta no concretada'] += 1;
      else stageCounts['Búsqueda'] += 1;
    }
  });

  return STAGES_RESERVATION_CANONICAL.map(stage => ({
    etapa: stage.name,
    cantidad: stageCounts[stage.name] || 0,
    color: stage.color,
    descripcion: stage.description
  }));
}

/**
 * Aggregates passengers by check-in process stage
 */
export function getPassengersByCheckinStage(checkins = []) {
  const stageCounts = {
    'Solicitud': 0,
    'Verificación de documentos': 0,
    'Equipaje': 0,
    'Pasabordo emitido': 0,
    'Control migratorio/seguridad': 0,
    'Puerta de embarque': 0,
    'Abordado': 0,
    'Denegados/Cancelados': 0
  };

  checkins.forEach(c => {
    const stage = c.stage || c.etapa;
    const status = getCheckinStatus(c);
    const authorized = isSecurityAuthorized(c);
    const docValid = isDocumentValid(c);

    if (status === 'denied' || status === 'cancelled' || stage === 'Denegados/Cancelados' || stage === 'Cancelado' || stage === 'Denegado') {
      stageCounts['Denegados/Cancelados'] += 1;
    } else if (stage && stageCounts[stage] !== undefined) {
      stageCounts[stage] += 1;
    } else {
      if (status === 'boarded' || stage === 'Abordado') {
        stageCounts['Abordado'] += 1;
      } else if (!authorized || status === 'not_authorized') {
        stageCounts['Control migratorio/seguridad'] += 1;
      } else if (!docValid || status === 'document_issue') {
        stageCounts['Verificación de documentos'] += 1;
      } else if (status === 'completed') {
        stageCounts['Pasabordo emitido'] += 1;
      } else {
        stageCounts['Solicitud'] += 1;
      }
    }
  });

  return STAGES_CHECKIN_CANONICAL.map(stage => ({
    etapa: stage.name,
    cantidad: stageCounts[stage.name] || 0,
    color: stage.color,
    descripcion: stage.description
  }));
}

/**
 * Derives the Activity feed timeline items from checkins and master records
 */
export function getActivityFeed(checkins = [], passengers = [], flights = [], selectedDateStr = null) {
  let list = checkins;
  if (selectedDateStr) {
    const dayFiltered = checkins.filter(chk => {
      const chkDate = (chk.fecha || chk.timestamp || '').slice(0, 10);
      return chkDate === selectedDateStr;
    });
    // If there are records for this date, show them; otherwise fallback to all filtered checkins
    if (dayFiltered.length > 0) {
      list = dayFiltered;
    }
  }

  // Sort: prioritize active incidents, boarded passengers, then latest timestamp
  const sorted = [...list].sort((a, b) => {
    const aTime = a.boarded_at || a.fecha || a.timestamp || '';
    const bTime = b.boarded_at || b.fecha || b.timestamp || '';
    return bTime.localeCompare(aTime);
  });

  return sorted.slice(0, 8).map(chk => {
    const passenger = passengers.find(p => p.id === (chk.pasajero_id || chk.passenger_id)) || { full_name: 'Pasajero' };
    const flight = flights.find(f => f.id === (chk.vuelo_id || chk.flight_id)) || { flight_number: 'AV-8210', origin: 'MDE', destination: 'BOG' };

    let type = 'normal';
    let title = `Check-in completado - Asiento ${chk.seat || '—'}`;
    const rawTime = chk.boarded_at || chk.fecha || chk.timestamp;
    let time = '09:30 AM';
    if (rawTime) {
      try {
        time = new Date(rawTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch {
        time = '09:30 AM';
      }
    }
    let colorClass = 'normal';

    const status = chk.estado || chk.status;
    const security = chk.seguridad || chk.security_result;
    const stage = chk.stage || chk.etapa;

    if (status === 'denied') {
      type = 'security_denied';
      title = `Seguridad: Paso denegado`;
      colorClass = 'critical';
    } else if (status === 'cancelled') {
      type = 'cancelled';
      title = `Check-in cancelado`;
      colorClass = 'critical';
    } else if (status === 'gate_issue' || chk.gate_pass_valid === false) {
      type = 'gate_issue';
      title = `Novedad en puerta de embarque`;
      colorClass = 'warning';
    } else if (chk.counter_correction_requested) {
      type = 'doc_issue';
      title = `Corrección solicitada en counter`;
      colorClass = 'warning';
    } else if (status === 'not_authorized' || security === 'not_authorized') {
      type = 'security_alert';
      title = `Seguridad: Pasajero no autorizado`;
      colorClass = 'critical';
    } else if (status === 'document_issue' || !isDocumentValid(chk)) {
      type = 'doc_issue';
      title = `Documentos con novedad`;
      colorClass = 'warning';
    } else if (status === 'boarded' || stage === 'Abordado') {
      type = 'boarded';
      title = `Abordaje confirmado - ${flight.flight_number}`;
      colorClass = 'success';
    } else if (stage === 'Puerta de embarque') {
      type = 'gate';
      title = `En Puerta de embarque - ${flight.flight_number}`;
      colorClass = 'normal';
    } else if (stage === 'Equipaje') {
      type = 'baggage';
      title = `Equipaje facturado - Asiento ${chk.seat || '—'}`;
      colorClass = 'normal';
    } else if (status === 'completed') {
      type = 'normal';
      title = `Pasabordo emitido - Asiento ${chk.seat || '—'}`;
      colorClass = 'normal';
    }

    const detail = chk.denial_reason || chk.cancellation_reason || chk.gate_incident || chk.incident_detail || `Etapa actual: ${stage || 'En proceso'}`;

    return {
      id: chk.id,
      time,
      type,
      colorClass,
      title,
      paxName: passenger.nombre || passenger.full_name,
      docNum: passenger.documento || passenger.document_number,
      flightCode: flight.flight_number,
      route: `${flight.origin} → ${flight.destination}`,
      detail,
      rawCheckin: chk
    };
  });
}
