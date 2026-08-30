import React from 'react';
import { Compass, Navigation, Clock, ShieldAlert } from 'lucide-react';

export default function RideDayBanner({ ride, onOpenDetails }) {
  if (!ride) return null;

  return (
    <div
      className="animate-pulse-glow"
      style={{
        backgroundColor: '#1E2126',
        border: '1px solid var(--amber)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'var(--amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#121417',
          }}
        >
          <Navigation size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Clock size={12} /> TODAY IS RIDE DAY • ROLLOUT AT {ride.time}
          </div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            {ride.title}
          </h4>
        </div>
      </div>

      <button
        onClick={() => onOpenDetails(ride)}
        style={{
          backgroundColor: 'var(--amber)',
          color: '#121417',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 16px',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Compass size={16} /> OPEN ROLLOUT CHANNEL & MAP
      </button>
    </div>
  );
}
