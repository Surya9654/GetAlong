import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Bike, AlertCircle, Zap } from 'lucide-react';

export default function QuickJoinSheet({ ride, primaryBike, sosConfigured, onConfirm, onClose }) {
  const [selectedBike, setSelectedBike] = useState(
    primaryBike?.model ? `${primaryBike.make} ${primaryBike.model}` : 'Royal Enfield Himalayan 450'
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!ride) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="animate-ios-sheet glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          padding: '24px 20px 32px 20px',
          boxShadow: '0 -15px 40px rgba(0,0,0,0.6)',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* iOS Drag Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '5px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '9999px' }} />
        </div>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              <Zap size={13} fill="var(--amber)" /> iOS 1-TAP CONFIRMATION
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {ride.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="ios-pressable"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Ride Logistics Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.86rem',
            color: 'var(--text-muted)',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>📅 <strong>{ride.date}</strong> @ {ride.time}</span>
          <span style={{ fontWeight: 700, color: 'var(--amber)' }}>{ride.distanceKm} KM</span>
        </div>

        {/* Machine Selection Card */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            <Bike size={15} color="var(--amber)" /> Registered Machine
          </label>
          <div
            style={{
              backgroundColor: 'var(--surface-solid)',
              border: '1px solid var(--border-amber)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{selectedBike}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned to your rider profile</div>
            </div>
            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--amber)', color: '#0B0E11', fontWeight: 800, padding: '3px 9px', borderRadius: 'var(--radius-full)', letterSpacing: '0.5px' }}>
              GARAGE PRIMARY
            </span>
          </div>
        </div>

        {/* SOS Verification Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: sosConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(242, 183, 5, 0.1)',
            border: `1px solid ${sosConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(242, 183, 5, 0.3)'}`,
            marginBottom: '24px',
          }}
        >
          {sosConfigured ? (
            <CheckCircle2 size={20} color="#10B981" flexShrink={0} />
          ) : (
            <AlertCircle size={20} color="var(--amber)" flexShrink={0} />
          )}
          <div style={{ fontSize: '0.82rem' }}>
            <strong style={{ color: sosConfigured ? '#10B981' : 'var(--amber)' }}>
              {sosConfigured ? 'Emergency SOS Contact Verified' : 'Emergency Contact Pre-filled'}
            </strong>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.78rem' }}>
              Encrypted access granted to host during ride rollout.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onConfirm(ride.id, selectedBike)}
          className="ios-pressable"
          style={{
            width: '100%',
            backgroundColor: 'var(--amber)',
            color: '#0B0E11',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '15px',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.1rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px var(--amber-glow)',
            letterSpacing: '0.5px',
          }}
        >
          <ShieldCheck size={22} />
          CONFIRM & JOIN RIDE
        </button>
      </div>
    </div>
  );
}
