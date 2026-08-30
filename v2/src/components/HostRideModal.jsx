import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Clock, Gauge, Compass } from 'lucide-react';

const RIDE_PRESETS = [
  {
    id: 'breakfast',
    name: '☕ Breakfast Run',
    title: 'ECR Sunrise & Filter Coffee',
    difficulty: 'cruiser',
    time: '5:30 AM',
    distanceKm: 120,
    maxRiders: 10,
    points: ['Chennai (ECR Start)', 'Mahabalipuram Beach Shack', 'Chennai Return'],
    description: 'Early morning coastal cruise down ECR for fresh filter coffee and breakfast by the waves. Return before traffic picks up.',
  },
  {
    id: 'ghats',
    name: '⛰️ Ghats & Hairpins',
    title: 'Yelagiri Hairpin Hunt',
    difficulty: 'spirited',
    time: '5:00 AM',
    distanceKm: 230,
    maxRiders: 8,
    points: ['Chennai Toll', 'Vellore Highway', 'Yelagiri Hills Top'],
    description: '14 hairpin bends up and down. Regrouping at every 3rd bend. Decent tyres required.',
  },
  {
    id: 'sunset',
    name: '🌅 Sunset Highway',
    title: 'Pondy Coastal Sunset Cruise',
    difficulty: 'cruiser',
    time: '4:00 PM',
    distanceKm: 160,
    maxRiders: 12,
    points: ['Chennai', 'Kovalam Beach', 'Pondicherry Promenade'],
    description: 'Relaxed afternoon rollout along the coast into Pondicherry for dinner.',
  },
];

export default function HostRideModal({ onHostRide, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState(RIDE_PRESETS[0]);
  const [formData, setFormData] = useState({
    title: RIDE_PRESETS[0].title,
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: RIDE_PRESETS[0].time,
    distanceKm: RIDE_PRESETS[0].distanceKm,
    difficulty: RIDE_PRESETS[0].difficulty,
    maxRiders: RIDE_PRESETS[0].maxRiders,
    description: RIDE_PRESETS[0].description,
    pointsStr: RIDE_PRESETS[0].points.join(', '),
  });

  const applyPreset = (preset) => {
    setSelectedPreset(preset);
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      time: preset.time,
      distanceKm: preset.distanceKm,
      difficulty: preset.difficulty,
      maxRiders: preset.maxRiders,
      description: preset.description,
      pointsStr: preset.points.join(', '),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pointsArr = formData.pointsStr.split(',').map((p) => p.trim()).filter(Boolean);
    onHostRide({
      ...formData,
      distanceKm: Number(formData.distanceKm),
      maxRiders: Number(formData.maxRiders),
      points: pointsArr.length > 0 ? pointsArr : ['Start Point', 'Destination'],
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-ios-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ color: 'var(--amber)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              30-Second Host Wizard
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              Host a Group Ride
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Presets Chips */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--amber)', marginBottom: '8px' }}>
            <Sparkles size={14} /> Quick Start Presets
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {RIDE_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    backgroundColor: isSelected ? 'var(--amber)' : 'var(--surface-raised)',
                    color: isSelected ? '#121417' : 'var(--text-primary)',
                    border: `1px solid ${isSelected ? 'var(--amber)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Ride Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
              }}
            />
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Scheduled Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Rollout Time
              </label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              />
            </div>
          </div>

          {/* Distance & Difficulty Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Distance (KM)
              </label>
              <input
                type="number"
                required
                value={formData.distanceKm}
                onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Pace / Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                }}
              >
                <option value="cruiser">Cruiser (Relaxed)</option>
                <option value="spirited">Spirited (Brisk)</option>
                <option value="hardcore">Hardcore (Expert)</option>
              </select>
            </div>
          </div>

          {/* Waypoints */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Waypoints (Comma separated)
            </label>
            <input
              type="text"
              required
              value={formData.pointsStr}
              onChange={(e) => setFormData({ ...formData, pointsStr: e.target.value })}
              placeholder="e.g. Start Point, Breakfast Stop, Final Stop"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Ride Notes & Briefing
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              marginTop: '6px',
              width: '100%',
              backgroundColor: 'var(--amber)',
              color: '#121417',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            CREATE & PUBLISH RIDE
          </button>
        </form>
      </div>
    </div>
  );
}
