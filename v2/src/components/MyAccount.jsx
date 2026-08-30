import React, { useState, useEffect } from 'react';
import { User, Bike, ShieldAlert, Award, Plus, Trash2, CheckCircle2, Save, X, Settings, Shield, Camera, Upload, Image } from 'lucide-react';
import LiquidSegmentedControl from './LiquidSegmentedControl.jsx';

const ACCOUNT_TAB_ORDER = ['profile', 'garage', 'safety'];

export default function MyAccount({ onClose, onProfileUpdated, userProfile }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'garage' | 'safety'
  const [slideDirection, setSlideDirection] = useState('right');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleTabChange = (newTab) => {
    const oldIdx = ACCOUNT_TAB_ORDER.indexOf(activeTab);
    const newIdx = ACCOUNT_TAB_ORDER.indexOf(newTab);
    if (newIdx >= oldIdx) {
      setSlideDirection('right');
    } else {
      setSlideDirection('left');
    }
    setActiveTab(newTab);
  };

  // Profile State
  const [profile, setProfile] = useState({
    name: userProfile?.name || 'Arjun Kumar',
    avatar_url: userProfile?.avatar_url || '',
    bio: userProfile?.bio || 'Weekend rider. Coastal roads over highways, always.',
    city: userProfile?.city || 'Chennai',
    experience_level: userProfile?.experience || 'Intermediate',
    email: userProfile?.email || 'arjun.rider@getalong.dev',
    phone: userProfile?.phone || '+91 98765 43210',
  });

  const [bikes, setBikes] = useState(
    userProfile?.primaryBike
      ? [{ id: 1, make: userProfile.primaryBike.make, model: userProfile.primaryBike.model, year: userProfile.primaryBike.year, engine_cc: 452, reg_number: 'TN-07-BW-1234', is_primary: true, photo_url: '' }]
      : [{ id: 1, make: 'Royal Enfield', model: 'Himalayan 450', year: 2024, engine_cc: 452, reg_number: 'TN-07-BW-1234', is_primary: true, photo_url: '' }]
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
    make: '', model: '', year: new Date().getFullYear(), engine_cc: '', reg_number: '', is_primary: false, photo_url: ''
  });

  // Lock body scroll when Add Bike Popup is active
  useEffect(() => {
    if (showAddBike) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddBike]);

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

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, avatar_url: reader.result }));
        setStatusMsg('Profile photo updated!');
        setTimeout(() => setStatusMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBikePhotoUpload = (bikeId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBikes((prev) =>
          prev.map((b) => (b.id === bikeId ? { ...b, photo_url: reader.result } : b))
        );
        setStatusMsg('Motorcycle photo uploaded to garage!');
        setTimeout(() => setStatusMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile)
      });
      if (onProfileUpdated) onProfileUpdated();
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
      photo_url: bikeForm.photo_url || '',
    };
    if (newBikeObj.is_primary) {
      setBikes((prev) => prev.map((b) => ({ ...b, is_primary: false })).concat(newBikeObj));
    } else {
      setBikes((prev) => [...prev, newBikeObj]);
    }
    setShowAddBike(false);
    setBikeForm({ make: '', model: '', year: new Date().getFullYear(), engine_cc: '', reg_number: '', is_primary: false, photo_url: '' });
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
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '5px',
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
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Manage profile, bike photos, and emergency SOS</span>
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

      {/* Elastic Liquid Sliding Tab Control */}
      <div style={{ marginBottom: '24px' }}>
        <LiquidSegmentedControl
          options={[
            { value: 'profile', label: 'Profile', icon: User },
            { value: 'garage', label: `Garage (${bikes.length})`, icon: Bike },
            { value: 'safety', label: 'Safety SOS', icon: ShieldAlert },
          ]}
          value={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div key="tab-profile" className={slideDirection === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left'}>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User Profile Photo Uploader */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)', padding: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--amber)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#0B0E11',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px var(--amber-glow)',
                  }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profile.name.charAt(0)
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--amber)', color: '#0B0E11', borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px var(--amber-glow)' }}>
                  <Camera size={14} /> Upload Profile Photo
                  <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  PNG, JPG or WEBP (Max 5MB)
                </p>
              </div>
            </div>

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
        </div>
      )}

      {/* Garage Tab */}
      {activeTab === 'garage' && (
        <div key="tab-garage" className={slideDirection === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left'}>
          {/* Sticky Header: "Add Machine" always on top! */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: 'var(--surface-solid)',
              border: '1px solid var(--border-amber)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Garage Collection ({bikes.length} Bikes)
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Add and upload photos of your motorcycles</p>
            </div>
            <button
              onClick={() => setShowAddBike(true)}
              className="ios-pressable"
              style={{
                backgroundColor: 'var(--amber)',
                color: '#0B0E11',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--amber-glow)',
              }}
            >
              <Plus size={16} /> Add Machine
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bikes.map((bike) => (
              <div
                key={bike.id}
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: `1px solid ${bike.is_primary ? 'var(--amber)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Bike Photo Preview Banner */}
                {bike.photo_url ? (
                  <div style={{ width: '100%', height: '160px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', position: 'relative' }}>
                    <img src={bike.photo_url} alt={`${bike.make} ${bike.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <label style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#FFF', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      📸 Change Photo
                      <input type="file" accept="image/*" onChange={(e) => handleBikePhotoUpload(bike.id, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-xs)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Bike size={24} color="var(--text-faint)" />
                    <label style={{ backgroundColor: 'var(--surface-solid)', border: '1px solid var(--border-color)', color: 'var(--amber)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      📸 Upload Bike Photo
                      <input type="file" accept="image/*" onChange={(e) => handleBikePhotoUpload(bike.id, e)} style={{ display: 'none' }} />
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
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
              </div>
            ))}
          </div>

          {/* Add Bike Form Modal Popup */}
          {showAddBike && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(5, 7, 10, 0.78)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
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
                style={{ width: '100%', maxWidth: '460px', borderRadius: 'var(--radius-lg)', padding: '24px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Add Motorcycle to Garage
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
                      padding: '13px',
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
        <div key="tab-safety" className={slideDirection === 'right' ? 'animate-slide-from-right' : 'animate-slide-from-left'}>
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
        </div>
      )}
    </div>
  );
}
