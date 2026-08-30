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

  const inputStyle = {
    width: '100%',
    backgroundColor: 'rgba(18, 22, 29, 0.62)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.92rem',
    fontFamily: 'var(--font-body)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.78)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-host-expand"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.18)',
          transformOrigin: 'top right',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ color: 'var(--amber)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              30-Second Ride Creator
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Host a Group Ride
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ios-pressable"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Start Presets */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            <Sparkles size={14} color="var(--amber)" /> 1-Tap Preset Templates
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {RIDE_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="ios-pressable"
                  style={{
                    backgroundColor: isSelected ? 'var(--amber)' : 'rgba(28, 34, 46, 0.65)',
                    color: isSelected ? '#0B0E11' : 'var(--text-primary)',
                    border: `1px solid ${isSelected ? 'var(--amber)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 6px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 15px var(--amber-glow)' : 'none',
                    textAlign: 'center',
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Ride Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Date & Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Rollout Time</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Distance & Difficulty Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Distance (KM)</label>
              <input
                type="number"
                required
                value={formData.distanceKm}
                onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Pace / Difficulty Dropdown</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                style={inputStyle}
              >
                <option value="cruiser">Cruiser (Relaxed Pace)</option>
                <option value="spirited">Spirited (Brisk Pace)</option>
                <option value="hardcore">Hardcore (Expert Pace)</option>
              </select>
            </div>
          </div>

          {/* Waypoints */}
          <div>
            <label style={labelStyle}>Route Waypoints (Comma separated)</label>
            <input
              type="text"
              required
              value={formData.pointsStr}
              onChange={(e) => setFormData({ ...formData, pointsStr: e.target.value })}
              placeholder="e.g. Start Point, Breakfast Stop, Final Stop"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Pace Guidelines & Notes</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="ios-pressable"
            style={{
              marginTop: '8px',
              width: '100%',
              backgroundColor: 'var(--amber)',
              color: '#0B0E11',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '14px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 25px var(--amber-glow)',
              letterSpacing: '0.5px',
            }}
          >
            CREATE & PUBLISH RIDE
          </button>
        </form>
      </div>
    </div>
  );
}
