import React, { useState, useEffect } from 'react';
import { User, Bike, ShieldAlert, Award, Plus, Trash2, CheckCircle2, Save, X, Settings, Shield } from 'lucide-react';

export default function MyAccount({ onClose, onProfileUpdated, userProfile }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'garage' | 'safety'
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Profile State
  const [profile, setProfile] = useState({
    name: userProfile?.name || 'Arjun Kumar',
    bio: userProfile?.bio || 'Weekend rider. Coastal roads over highways, always.',
    city: userProfile?.city || 'Chennai',
    experience_level: userProfile?.experience || 'Intermediate',
    email: userProfile?.email || 'arjun.rider@getalong.dev',
    phone: userProfile?.phone || '+91 98765 43210',
  });

  const [bikes, setBikes] = useState(
    userProfile?.primaryBike
      ? [{ id: 1, make: userProfile.primaryBike.make, model: userProfile.primaryBike.model, year: userProfile.primaryBike.year, engine_cc: 452, reg_number: 'TN-07-BW-1234', is_primary: true }]
      : [{ id: 1, make: 'Royal Enfield', model: 'Himalayan 450', year: 2024, engine_cc: 452, reg_number: 'TN-07-BW-1234', is_primary: true }]
  );

  const [badges, setBadges] = useState(
    userProfile?.badges || ['Early Bird', 'Coastal Regular', 'Marshal Certified']
  );

  const [preferences, setPreferences] = useState({
    emergency_name: userProfile?.sosContact?.name || 'Ramesh Kumar',
    emergency_phone: userProfile?.sosContact?.phone || '+91 98765 43210',
    blood_group: 'O+',
    medical_notes: 'No allergies. Tetanus shot up to date.',
  });

  const [showAddBike, setShowAddBike] = useState(false);
  const [bikeForm, setBikeForm] = useState({
    make: '', model: '', year: new Date().getFullYear(), engine_cc: '', reg_number: '', is_primary: false
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('getalong_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      const res = await fetch('/api/account', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.name) setProfile(data.user);
        if (data.motorcycles && data.motorcycles.length > 0) setBikes(data.motorcycles);
        if (data.badges && data.badges.length > 0) setBadges(data.badges);
        if (data.preferences && data.preferences.emergency_name) setPreferences(data.preferences);
      }
    } catch (err) {
      console.warn('Backend API offline, utilizing local profile:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile)
      });
      if (res.ok && onProfileUpdated) onProfileUpdated();
      setStatusMsg('Rider profile updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetch('/api/account/preferences', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      setStatusMsg('Safety SOS contacts & medical details saved!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Error saving safety contacts:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBike = (e) => {
    e.preventDefault();
    if (!bikeForm.make || !bikeForm.model) return;
    const newBikeObj = {
      id: Date.now(),
      make: bikeForm.make,
      model: bikeForm.model,
      year: bikeForm.year,
      engine_cc: bikeForm.engine_cc || 350,
      reg_number: bikeForm.reg_number,
      is_primary: bikeForm.is_primary || bikes.length === 0,
    };
    if (newBikeObj.is_primary) {
      setBikes((prev) => prev.map((b) => ({ ...b, is_primary: false })).concat(newBikeObj));
    } else {
      setBikes((prev) => [...prev, newBikeObj]);
    }
    setShowAddBike(false);
    setBikeForm({ make: '', model: '', year: new Date().getFullYear(), engine_cc: '', reg_number: '', is_primary: false });
    setStatusMsg('New motorcycle added to garage!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSetPrimaryBike = (bikeId) => {
    setBikes((prev) => prev.map((b) => ({ ...b, is_primary: b.id === bikeId })));
  };

  const handleDeleteBike = (bikeId) => {
    if (bikes.length <= 1) {
      alert('You must have at least one motorcycle in your garage.');
      return;
    }
    setBikes((prev) => prev.filter((b) => b.id !== bikeId));
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--surface-raised)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '11px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.92rem',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className="glass-panel animate-ios-card" style={{ borderRadius: 'var(--radius-md)', padding: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="var(--amber)" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rider Account & Garage
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Manage profile, bikes, and emergency SOS</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ios-pressable" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10B981',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
          }}
        >
          <CheckCircle2 size={16} /> {statusMsg}
        </div>
      )}

      {/* iOS Liquid Segmented Tab Bar Header */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          marginBottom: '24px',
        }}
      >
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'garage', label: `Garage (${bikes.length})`, icon: Bike },
          { id: 'safety', label: 'Safety SOS', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ios-pressable liquid-pill ${isActive ? 'liquid-pill-active' : ''}`}
              style={{
                backgroundColor: isActive ? 'transparent' : 'transparent',
                color: isActive ? '#07090C' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '9px 0',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Icon size={14} color={isActive ? '#07090C' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Rider Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Rider Bio & Preferred Terrain</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Base City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Experience Level</label>
              <select
                value={profile.experience_level}
                onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                style={inputStyle}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced / Marshal">Advanced / Marshal</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Earned Badges Section */}
          <div style={{ pt: '8px' }}>
            <label style={labelStyle}>Earned Badges ({badges.length})</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {badges.map((b, idx) => {
                const badgeTitle = typeof b === 'string' ? b : (b.badge_name || b.name || b.title || 'Rider Badge');
                return (
                  <span
                    key={typeof b === 'object' && b.id ? b.id : idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(242, 183, 5, 0.14)',
                      border: '1px solid rgba(242, 183, 5, 0.4)',
                      color: 'var(--amber)',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <Award size={14} color="var(--amber)" />
                    {badgeTitle}
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="ios-pressable"
            style={{
              marginTop: '10px',
              width: '100%',
              backgroundColor: 'var(--amber)',
              color: '#0B0E11',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '13px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px var(--amber-glow)',
            }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {/* Garage Tab */}
      {activeTab === 'garage' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Motorcycles Collection
            </span>
            <button
              onClick={() => setShowAddBike(true)}
              className="ios-pressable"
              style={{
                backgroundColor: 'var(--amber)',
                color: '#0B0E11',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> Add Machine
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bikes.map((bike) => (
              <div
                key={bike.id}
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: `1px solid ${bike.is_primary ? 'var(--amber)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {bike.make} {bike.model}
                    </h4>
                    {bike.is_primary && (
                      <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--amber)', color: '#0B0E11', fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        PRIMARY BIKE
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    {bike.year} • {bike.engine_cc} cc {bike.reg_number ? `• ${bike.reg_number}` : ''}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!bike.is_primary && (
                    <button
                      onClick={() => handleSetPrimaryBike(bike.id)}
                      className="ios-pressable"
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-full)',
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBike(bike.id)}
                    className="ios-pressable"
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '6px' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Bike Form Modal */}
          {showAddBike && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
              onClick={() => setShowAddBike(false)}
            >
              <div
                className="glass-panel animate-ios-card"
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: '440px', borderRadius: 'var(--radius-md)', padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Add New Motorcycle
                  </h4>
                  <button onClick={() => setShowAddBike(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddBike} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Make</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Enfield"
                        required
                        value={bikeForm.make}
                        onChange={(e) => setBikeForm({ ...bikeForm, make: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Himalayan 450"
                        required
                        value={bikeForm.model}
                        onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>Year</label>
                      <input
                        type="number"
                        value={bikeForm.year}
                        onChange={(e) => setBikeForm({ ...bikeForm, year: Number(e.target.value) })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Engine (CC)</label>
                      <input
                        type="number"
                        placeholder="452"
                        value={bikeForm.engine_cc}
                        onChange={(e) => setBikeForm({ ...bikeForm, engine_cc: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Reg No.</label>
                      <input
                        type="text"
                        placeholder="TN-07-XX-1234"
                        value={bikeForm.reg_number}
                        onChange={(e) => setBikeForm({ ...bikeForm, reg_number: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pt: '4px' }}>
                    <input
                      type="checkbox"
                      id="is_primary_checkbox"
                      checked={bikeForm.is_primary}
                      onChange={(e) => setBikeForm({ ...bikeForm, is_primary: e.target.checked })}
                    />
                    <label htmlFor="is_primary_checkbox" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Set as primary motorcycle</label>
                  </div>

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
                      padding: '12px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Save to Garage
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safety & Emergency SOS Tab */}
      {activeTab === 'safety' && (
        <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'rgba(224, 86, 40, 0.12)',
              border: '1px solid rgba(224, 86, 40, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldAlert size={24} color="var(--rust)" flexShrink={0} />
            <div style={{ fontSize: '0.84rem' }}>
              <strong style={{ color: 'var(--rust)' }}>Emergency SOS Contact Card</strong>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Safety contact information encrypted for group ride marshals during emergencies.
              </p>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Emergency Contact Person Name</label>
            <input
              type="text"
              required
              value={preferences.emergency_name}
              onChange={(e) => setPreferences({ ...preferences, emergency_name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Emergency Phone Number</label>
              <input
                type="tel"
                required
                value={preferences.emergency_phone}
                onChange={(e) => setPreferences({ ...preferences, emergency_phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Blood Group</label>
              <select
                value={preferences.blood_group}
                onChange={(e) => setPreferences({ ...preferences, blood_group: e.target.value })}
                style={inputStyle}
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Medical Notes & Allergies</label>
            <textarea
              rows={3}
              value={preferences.medical_notes}
              onChange={(e) => setPreferences({ ...preferences, medical_notes: e.target.value })}
              style={{ ...inputStyle, resize: 'none' }}
              placeholder="e.g. No known drug allergies, tetanus updated..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="ios-pressable"
            style={{
              marginTop: '10px',
              width: '100%',
              backgroundColor: 'var(--amber)',
              color: '#0B0E11',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '13px',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px var(--amber-glow)',
            }}
          >
            <Shield size={18} /> {saving ? 'Saving...' : 'Save Emergency SOS Info'}
          </button>
        </form>
      )}
    </div>
  );
}
