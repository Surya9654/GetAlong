import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Bike, AlertCircle } from 'lucide-react';

export default function QuickJoinSheet({ ride, primaryBike, sosConfigured, onConfirm, onClose }) {
  const [selectedBike, setSelectedBike] = useState(primaryBike?.model ? `${primaryBike.make} ${primaryBike.model}` : 'Royal Enfield Himalayan 450');

  if (!ride) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--surface-color)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal Handle Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ color: 'var(--amber)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Instant Confirmation
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              Join {ride.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Ride Logistics Summary */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            marginBottom: '18px',
          }}
        >
          📅 <strong>{ride.date}</strong> at <strong>{ride.time}</strong> • 📍 {ride.points?.[0]} ➔ {ride.points?.[ride.points?.length - 1]} ({ride.distanceKm} km)
        </div>

        {/* Bike Selection */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Bike size={16} color="var(--amber)" />
            Riding Machine
          </label>
          <div
            style={{
              backgroundColor: 'var(--bg-color)',
              border: '1px solid var(--amber)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{selectedBike}</span>
            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--amber)', color: '#121417', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
              PRIMARY
            </span>
          </div>
        </div>

        {/* Emergency SOS Readiness */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: sosConfigured ? '#7A9B5C1A' : '#F2B7051A',
            border: `1px solid ${sosConfigured ? '#7A9B5C44' : '#F2B70544'}`,
            marginBottom: '22px',
          }}
        >
          {sosConfigured ? (
            <CheckCircle2 size={18} color="var(--moss)" />
          ) : (
            <AlertCircle size={18} color="var(--amber)" />
          )}
          <div style={{ fontSize: '0.82rem' }}>
            <strong style={{ color: sosConfigured ? 'var(--moss)' : 'var(--amber)' }}>
              {sosConfigured ? 'Emergency SOS Verified' : 'Emergency Contact Pre-filled'}
            </strong>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {sosConfigured ? 'Host will have encrypted access to your SOS details.' : 'Default SOS contact associated with your profile.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onConfirm(ride.id, selectedBike)}
          style={{
            width: '100%',
            backgroundColor: 'var(--amber)',
            color: '#121417',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(242, 183, 5, 0.3)',
          }}
        >
          <ShieldCheck size={20} />
          CONFIRM & JOIN RIDE
        </button>
      </div>
    </div>
  );
}
