import React from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, ShieldCheck } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  cruiser: { label: 'Cruiser', bg: '#7A9B5C1A', border: '#7A9B5C66', color: '#7A9B5C' },
  spirited: { label: 'Spirited', bg: '#F2B7051A', border: '#F2B70566', color: '#F2B705' },
  hardcore: { label: 'Hardcore', bg: '#D9432E1A', border: '#D9432E66', color: '#D9432E' },
};

export default function RideCard({ ride, host, isJoined, onSelect, onQuickJoin }) {
  const diff = DIFFICULTY_CONFIG[ride.difficulty] || DIFFICULTY_CONFIG.cruiser;
  const spotsLeft = ride.maxRiders - (ride.currentRiders?.length || 0);

  const startPoint = ride.points[0] || 'Start';
  const endPoint = ride.points[ride.points.length - 1] || 'Finish';
  const viaPointsCount = Math.max(0, ride.points.length - 2);

  return (
    <div
      onClick={() => onSelect(ride)}
      style={{
        backgroundColor: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        marginBottom: '14px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
      className="animate-fade-in"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--amber)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Calendar size={15} color="var(--amber)" />
          <span>{ride.date}</span>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <Clock size={15} color="var(--amber)" />
          <span>{ride.time}</span>
        </div>
        <span
          style={{
            backgroundColor: diff.bg,
            border: `1px solid ${diff.border}`,
            color: diff.color,
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {diff.label}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.3rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '10px',
          letterSpacing: '0.3px',
        }}
      >
        {ride.title}
      </h3>

      {/* Progressive Route Timeline */}
      <div
        style={{
          backgroundColor: 'var(--surface-raised)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '0.88rem',
          color: 'var(--text-primary)',
        }}
      >
        <MapPin size={16} color="var(--amber)" flexShrink={0} />
        <span style={{ fontWeight: 500 }}>{startPoint}</span>
        {viaPointsCount > 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--border-color)', padding: '1px 6px', borderRadius: '4px' }}>
            +{viaPointsCount} via
          </span>
        )}
        <ChevronRight size={14} color="var(--text-faint)" />
        <span style={{ fontWeight: 500 }}>{endPoint}</span>
      </div>

      {/* Card Footer Logistics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span><strong>{ride.distanceKm}</strong> km</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} />
            <strong style={{ color: spotsLeft <= 2 ? 'var(--hardcore-red)' : 'var(--text-primary)' }}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Ride Full'}
            </strong>
          </span>
        </div>

        {/* Action Button */}
        {isJoined ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--moss)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <ShieldCheck size={16} /> Joined
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickJoin(ride);
            }}
            style={{
              backgroundColor: 'var(--amber)',
              color: '#121417',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E5AD05')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--amber)')}
          >
            1-Tap Join
          </button>
        )}
      </div>
    </div>
  );
}
