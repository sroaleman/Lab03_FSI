# Estructura de Datos y Modelo de Entidades - Dashboard Operativo de Aerolínea Virtual

Este documento especifica los esquemas de datos y entidades principales para el MVP del **Dashboard Operativo** del Responsable de Operaciones de una aerolínea virtual en Colombia (rutas nacionales e internacionales en pesos colombianos - COP).

El sistema gestiona dos procesos de negocio centrales:
1. **Reserva y compra de ticket**
2. **Check-in y embarque**

---

## 1. AGENTES (`agentes`)
Representa al personal operativo de tierra y mostradores asignados a vuelos, puertas y puntos de atención. Permite la reasignación en tiempo real.

```json
[
  {
    "id": "ag-1",
    "full_name": "Valentina Restrepo",
    "role": "checkin_agent", // "checkin_agent" | "gate_agent" | "supervisor"
    "email": "v.restrepo@aeroops.co",
    "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "assigned_flight_id": "FL-101",
    "location": "Módulo Check-in 4",
    "status": "active" // "active" | "busy" | "on_break"
  }
]
```

---

## 2. ETAPAS DEL PROCESO (`etapas`)
Define las etapas de los dos procesos operativos.

### 2.1 Proceso de Reserva y Compra (`etapas_reserva`)
1. **Búsqueda**: El cliente consulta itinerarios y tarifas.
2. **Cupo bloqueado**: Reserva provisional activa con tiempo límite de pago.
3. **Pago en autorización**: Transacción enviada a la pasarela bancaria.
4. **Tiquete emitido**: Pago aprobado y tiquete electrónico generado.
5. **Venta no concretada**: Reserva expirada o transacción declinada.

### 2.2 Proceso de Check-in y Embarque (`etapas_checkin`)
1. **Solicitud**: Pasajero inicia check-in digital o presencial.
2. **Verificación de documentos**: Validación de documento de identidad y permisos.
3. **Equipaje**: Facturación de equipaje en bodega y control de peso.
4. **Pasabordo emitido**: Generación de tarjeta de embarque con asiento asignado.
5. **Control migratorio/seguridad**: Filtro de seguridad aeroportuario y control de listas restrictivas.
6. **Puerta de embarque**: Espera y llamado a sala de abordaje.
7. **Abordado**: Pasajero ingresa a la aeronave con escaneo final de pasabordo.

---

## 3. PASAJEROS (`pasajeros`)
Registro de viajeros con información de identificación y contacto.

```json
[
  {
    "id": "pax-1",
    "full_name": "Carlos Alberto Murillo",
    "document_type": "CC", // "CC" | "CE" | "PASAPORTE"
    "document_number": "1020485921",
    "email": "carlos.murillo@email.com",
    "phone": "+57 312 458 9210",
    "frequent_flyer_tier": "Gold" // "General" | "Silver" | "Gold" | "Platinum"
  }
]
```

---

## 4. VUELOS (`vuelos`)
Programación de vuelos en rutas colombianas (MDE, BOG, CLO, CTG, BAQ, SMR, ADZ, etc.).

```json
[
  {
    "id": "FL-101",
    "flight_number": "AV-8210",
    "airline": "AeroAndina Virtual",
    "origin": "MDE",
    "destination": "BOG",
    "origin_city": "Medellín (JMC)",
    "destination_city": "Bogotá (BOG)",
    "departure_time": "09:48",
    "arrival_time": "10:45",
    "duration": "0h 57m",
    "gate": "Puerta 4A",
    "counter": "Módulos 12-14",
    "capacity": 150,
    "status": "boarding", // "scheduled" | "boarding" | "delayed" | "departed"
    "assigned_checkin_agent_id": "ag-1",
    "assigned_gate_agent_id": "ag-2"
  }
]
```

---

## 5. RESERVAS (`reservas`)
Tabla de transacciones de compra de tiquetes.

```json
[
  {
    "id": "bk-101",
    "pnr": "HK94TL",
    "passenger_id": "pax-1",
    "flight_id": "FL-101",
    "amount": 485000, // En pesos colombianos (COP)
    "currency": "COP",
    "cabin_class": "Economy", // "Economy" | "Business" | "Premium"
    "booking_channel": "web", // "web" | "app" | "agent"
    "agent_id": null,
    "status": "paid", // "paid" | "payment_rejected" | "expired" | "seat_held"
    "stage": "Tiquete emitido", // "Búsqueda" | "Cupo bloqueado" | "Pago en autorización" | "Tiquete emitido" | "Venta no concretada"
    "payment_gateway": "PSE", // "PSE" | "Wompi" | "Tarjeta de Crédito" | "Bancolombia"
    "created_at": "2026-10-15T09:12:00Z"
  }
]
```

---

## 6. CHECK-INS (`checkins`)
Registro del ciclo de check-in, control de seguridad y embarque de pasajeros.

```json
[
  {
    "id": "chk-101",
    "booking_id": "bk-101",
    "passenger_id": "pax-1",
    "flight_id": "FL-101",
    "seat": "14C",
    "baggage_count": 1,
    "status": "boarded", // "pending" | "document_issue" | "completed" | "not_authorized" | "boarded"
    "stage": "Abordado", // "Solicitud" | "Verificación de documentos" | "Equipaje" | "Pasabordo emitido" | "Control migratorio/seguridad" | "Puerta de embarque" | "Abordado"
    "security_result": "authorized", // "authorized" | "not_authorized" | "pending"
    "document_status": "verified", // "verified" | "issue" | "pending"
    "assigned_agent_id": "ag-2",
    "incident_detail": null,
    "timestamp": "2026-10-15T09:35:00Z"
  }
]
```

---

## 7. Fórmulas de Cálculo de KPIs en Tiempo Real

### Proceso 1: Reserva y Compra
- **Ingresos Totales**: $\sum \text{amount}$ de reservas donde `status === 'paid'`.
- **Tasa de Conversión**: $(\text{Reservas con } status = 'paid' / \text{Total de Reservas}) \times 100$.
- **Cupos Bloqueados**: Conteo de reservas donde `status === 'seat_held'`.
- **Ticket Promedio**: $\text{Ingresos Totales} / \text{Reservas Pagadas}$.

### Proceso 2: Check-in y Embarque
- **Pasajeros Abordados**: Conteo de check-ins con `status === 'boarded'`.
- **Check-in Completado**: $\frac{\text{Check-ins con } (status = 'completed' \lor status = 'boarded')}{\text{Total Check-ins}} \times 100$.
- **Rechazos por Documentos**: Conteo de check-ins con `status === 'document_issue'`.
- **No Autorizados en Seguridad**: Conteo de check-ins con `security_result === 'not_authorized'`.
