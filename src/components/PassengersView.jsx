import React, { useState } from 'react';
import { Users, Search, Award, Phone, Mail, FileText, Ticket } from 'lucide-react';

export default function PassengersView({ passengers = [], bookings = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const filteredPassengers = passengers.filter(p => {
    const tier = (p.nivel_lealtad || p.frequent_flyer_tier || '').toLowerCase();
    if (tierFilter !== 'all' && tier !== tierFilter.toLowerCase()) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (p.nombre || p.full_name || '').toLowerCase().includes(q);
      const matchDoc = (p.documento || p.document_number || '').includes(q);
      const matchEmail = (p.email || '').toLowerCase().includes(q);
      if (!matchName && !matchDoc && !matchEmail) return false;
    }
    return true;
  });

  const getTierBadge = (tier = '') => {
    const t = tier.toLowerCase();
    if (t === 'platinum') {
      return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', label: 'Platinum' };
    }
    if (t === 'gold') {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Gold' };
    }
    if (t === 'silver') {
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: 'Silver' };
    }
    return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: 'General' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Directorio de Pasajeros</h2>
          <p style={styles.subtitle}>
            Historial de clientes, niveles de fidelización y documentación registrada
          </p>
        </div>
      </div>

      <div style={styles.controlsRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text"
            placeholder="Buscar por nombre, documento de identidad o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <select 
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">Todos los niveles de lealtad</option>
          <option value="platinum">Platinum</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
          <option value="regular">General / Regular</option>
        </select>
      </div>

      <div style={styles.tableCard} className="ui-card">
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Pasajero</th>
              <th style={styles.th}>Documento</th>
              <th style={styles.th}>Nivel de Lealtad</th>
              <th style={styles.th}>Contacto</th>
              <th style={styles.th}>Reservas Activas</th>
            </tr>
          </thead>
          <tbody>
            {filteredPassengers.map(pax => {
              const paxBookings = bookings.filter(b => b.pasajero_id === pax.id || b.passenger_id === pax.id);
              const tierStyle = getTierBadge(pax.nivel_lealtad || pax.frequent_flyer_tier);

              return (
                <tr key={pax.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.paxCell}>
                      <div style={styles.paxAvatar}>
                        {(pax.nombre || pax.full_name || 'P')[0]}
                      </div>
                      <span style={styles.paxName}>{pax.nombre || pax.full_name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.docText}>
                      {pax.documento || `${pax.document_type || 'CC'}-${pax.document_number}`}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.tierBadge,
                      backgroundColor: tierStyle.bg,
                      color: tierStyle.text,
                      borderColor: tierStyle.border
                    }}>
                      <Award size={12} />
                      {tierStyle.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.contactEmail}>{pax.email || 'correo@ejemplo.com'}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.bookingCountBadge}>
                      <Ticket size={13} color="#1e6bff" />
                      <strong>{paxBookings.length}</strong> tiquetes
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: '0.84rem',
    color: '#64748b'
  },
  controlsRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '9px 18px',
    flex: 1,
    minWidth: '280px'
  },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: '0.84rem',
    width: '100%'
  },
  select: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    padding: '9px 16px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '16px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  trHead: {
    borderBottom: '1px solid #e8ecf2'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.84rem'
  },
  paxCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  paxAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#1e6bff',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.84rem'
  },
  paxName: {
    fontWeight: '700',
    color: '#0f172a'
  },
  docText: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#475569'
  },
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.71875rem',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '9999px',
    border: '1px solid transparent'
  },
  contactEmail: {
    color: '#64748b'
  },
  bookingCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    padding: '4px 10px',
    borderRadius: '8px',
    color: '#334155'
  }
};
