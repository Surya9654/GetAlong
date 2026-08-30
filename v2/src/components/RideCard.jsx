import React from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  cruiser: { label: 'Cruiser', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(10, 185, 129, 0.35)', color: '#10B981' },
  spirited: { label: 'Spirited', bg: 'rgba(242, 183, 5, 0.14)', border: 'rgba(242, 183, 5, 0.4)', color: '#F2B705' },
  hardcore: { label: 'Hardcore', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' },
};

export default function RideCard({ ride, host, isJoined, onSelect, onQuickJoin }) {
  const diff = DIFFICULTY_CONFIG[ride.difficulty] || DIFFICULTY_CONFIG.cruiser;
  const spotsLeft = ride.maxRiders - (ride.currentRiders?.length || 0);

  const startPoint = ride.points[0] || 'Start';
  const endPoint = ride.points[ride.points.length - 1] || 'Destination';
  const viaPointsCount = Math.max(0, ride.points.length - 2);

  return (
    <div
      onClick={() => onSelect(ride)}
      className="glass-panel ios-pressable"
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        marginBottom: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Gradient Accent Pill */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: diff.color,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface-raised)', padding: '3px 9px', borderRadius: 'var(--radius-full)' }}>
            <Calendar size={13} color="var(--amber)" />
            {ride.date}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface-raised)', padding: '3px 9px', borderRadius: 'var(--radius-full)' }}>
            <Clock size={13} color="var(--amber)" />
            {ride.time}
          </span>
        </div>

        <span
          style={{
            backgroundColor: diff.bg,
            border: `1px solid ${diff.border}`,
            color: diff.color,
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          {diff.label}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          letterSpacing: '-0.2px',
          lineHeight: '1.25',
        }}
      >
        {ride.title}
      </h3>

      {/* iOS Route Strip */}
      <div
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '0.88rem',
        }}
      >
        <MapPin size={16} color="var(--amber)" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{startPoint}</span>
        {viaPointsCount > 0 && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            +{viaPointsCount} stop{viaPointsCount > 1 ? 's' : ''}
          </span>
        )}
        <ChevronRight size={14} color="var(--text-faint)" />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{endPoint}</span>
      </div>

      {/* Card Footer Logistics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ride.distanceKm} <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)' }}>KM</span></span>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} />
            <strong style={{ color: spotsLeft <= 2 ? 'var(--hardcore-red)' : 'var(--text-primary)', fontWeight: 600 }}>
              {spotsLeft > 0 ? `${spotsLeft} spots` : 'Full'}
            </strong>
          </span>
        </div>

        {/* iOS Touch Action Button */}
        {isJoined ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#10B981',
              fontWeight: 700,
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
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
            className="ios-pressable"
            style={{
              backgroundColor: 'var(--amber)',
              color: '#0B0E11',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '7px 16px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 3px 12px var(--amber-glow)',
            }}
          >
            <Zap size={14} fill="#0B0E11" /> 1-Tap Join
          </button>
        )}
      </div>
    </div>
  );
}
