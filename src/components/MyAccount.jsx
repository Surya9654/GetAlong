import React, { useState, useEffect } from 'react';
import { User, Bike, ShieldAlert, Award, Plus, Trash2, CheckCircle2, Save, X, Settings } from 'lucide-react';

const THEMES = {
  night: {
    bg: '#15171B',
    surface: '#1E2126',
    surfaceRaised: '#262A30',
    border: '#33373D',
    textPrimary: '#F2EFE9',
    textMuted: '#9297A0',
    textFaint: '#5B5F66',
    amber: '#F2B705',
    rust: '#D9622B',
    moss: '#7A9B5C',
  },
  day: {
    bg: '#F5F4EF',
    surface: '#FFFFFF',
    surfaceRaised: '#EAE8DF',
    border: '#D8D5C8',
    textPrimary: '#17191C',
    textMuted: '#5C6068',
    textFaint: '#8C9099',
    amber: '#D98B00',
    rust: '#C44E1A',
    moss: '#5B7A40',
  }
};

export default function MyAccount({ onClose, onProfileUpdated, theme = 'night' }) {
  const COLORS = THEMES[theme] || THEMES.night;
  const inputClass = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';
  const inputStyle = { backgroundColor: COLORS.surface, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}` };

  const [activeTab, setActiveTab] = useState('profile'); // profile | garage | safety
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Account State
  const [profile, setProfile] = useState({
    name: '', bio: '', city: 'Chennai', experience_level: 'Intermediate', email: '', phone: ''
  });
  const [bikes, setBikes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [preferences, setPreferences] = useState({
    emergency_name: '', emergency_phone: '', preferred_difficulty: 'cruiser', notifications_enabled: true
  });

  // Add Bike Modal State
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

  // Fetch Account Details from Backend API
  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/account', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setProfile(data.user);
        if (data.motorcycles) setBikes(data.motorcycles);
        if (data.badges) setBadges(data.badges);
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (err) {
      console.error('Failed to fetch account data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setStatusMsg('Profile updated successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save Preferences & Emergency Contacts
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/account/preferences', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        setStatusMsg('Safety contacts & preferences saved!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  // Add Motorcycle
  const handleAddBike = async (e) => {
    e.preventDefault();
    if (!bikeForm.make || !bikeForm.model) return;
    try {
      setSaving(true);
      const res = await fetch('/api/account/bikes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bikeForm)
      });
      if (res.ok) {
        await fetchAccountData();
        setShowAddBike(false);
        setBikeForm({ make: '', model: '', year: new Date().getFullYear(), engine_cc: '', reg_number: '', is_primary: false });
        setStatusMsg('New bike added to your garage!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error adding bike:', err);
    } finally {
      setSaving(false);
    }
  };

  // Set Primary Motorcycle
  const handleSetPrimaryBike = async (bike) => {
    try {
      const res = await fetch(`/api/account/bikes/${bike.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...bike, is_primary: true })
      });
      if (res.ok) fetchAccountData();
    } catch (err) {
      console.error('Error setting primary bike:', err);
    }
  };

  // Delete Motorcycle
  const handleDeleteBike = async (bikeId) => {
    if (!confirm('Are you sure you want to remove this bike from your garage?')) return;
    try {
      const res = await fetch(`/api/account/bikes/${bikeId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) fetchAccountData();
    } catch (err) {
      console.error('Error deleting bike:', err);
    }
  };


  if (loading) {
    return (
      <div className="p-6 text-center" style={{ color: COLORS.textMuted }}>
        <p>Loading MyAccount profile from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: COLORS.bg, color: COLORS.textPrimary }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center gap-2">
          <Settings size={20} color={COLORS.amber} />
          <h2 style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 18 }}>MyAccount Settings</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:brightness-110">
            <X size={20} color={COLORS.textMuted} />
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="mx-4 mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2" style={{ backgroundColor: `${COLORS.moss}22`, color: COLORS.moss, border: `1px solid ${COLORS.moss}55` }}>
          <CheckCircle2 size={16} />
          {statusMsg}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b px-4 mt-2" style={{ borderColor: COLORS.border }}>
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'garage', label: `Garage (${bikes.length})`, icon: Bike },
          { id: 'safety', label: 'Safety & Emergency', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold capitalize"
              style={{
                color: active ? COLORS.amber : COLORS.textMuted,
                borderBottom: active ? `2px solid ${COLORS.amber}` : '2px solid transparent'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Rider Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={inputClass} style={inputStyle} required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Bio & Riding Style</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className={inputClass} style={inputStyle}
                placeholder="Share your riding experience, preferred routes, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Base City</label>
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className={inputClass} style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Experience Level</label>
                <select
                  value={profile.experience_level || 'Intermediate'}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                  className={inputClass} style={inputStyle}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced / Marshal">Advanced / Marshal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className={inputClass} style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className={inputClass} style={inputStyle}
                />
              </div>
            </div>

            {/* Badges Display */}
            {badges.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs uppercase font-semibold mb-1.5" style={{ color: COLORS.textMuted }}>Earned Badges</label>
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <span key={b.id} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${COLORS.amber}18`, color: COLORS.amber, border: `1px solid ${COLORS.amber}44` }}>
                      <Award size={12} /> {b.badge_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110"
              style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        )}

        {/* Garage Tab */}
        {activeTab === 'garage' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold" style={{ color: COLORS.textMuted }}>Your Motorcycles</span>
              <button
                onClick={() => setShowAddBike(true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:brightness-110"
                style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
              >
                <Plus size={14} /> Add Bike
              </button>
            </div>

            {/* Bike List */}
            {bikes.length === 0 ? (
              <div className="text-center py-10 border rounded-xl" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                <Bike size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No motorcycles added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bikes.map((bike) => (
                  <div
                    key={bike.id}
                    className="p-3.5 rounded-xl border relative"
                    style={{ backgroundColor: COLORS.surface, borderColor: bike.is_primary ? COLORS.amber : COLORS.border }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>
                            {bike.make} {bike.model}
                          </h4>
                          {bike.is_primary && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS.amber}22`, color: COLORS.amber, border: `1px solid ${COLORS.amber}55` }}>
                              Primary Bike
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                          {bike.year} • {bike.engine_cc} cc {bike.reg_number ? `• ${bike.reg_number}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!bike.is_primary && (
                          <button
                            onClick={() => handleSetPrimaryBike(bike)}
                            className="text-xs px-2.5 py-1 rounded-md border hover:brightness-110"
                            style={{ backgroundColor: COLORS.surfaceRaised, borderColor: COLORS.border, color: COLORS.textMuted }}
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBike(bike.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/20"
                          style={{ color: '#E53E3E' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Bike Modal / Form Overlay */}
            {showAddBike && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                <div className="w-full max-w-sm p-5 rounded-2xl border animate-blur-in" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.amber }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>Add New Motorcycle</h4>
                    <button onClick={() => setShowAddBike(false)}><X size={16} color={COLORS.textMuted} /></button>
                  </div>


                <form onSubmit={handleAddBike} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase font-medium mb-1" style={{ color: COLORS.textMuted }}>Make</label>
                      <input
                        type="text" placeholder="e.g. Royal Enfield"
                        value={bikeForm.make} onChange={(e) => setBikeForm({ ...bikeForm, make: e.target.value })}
                        className={inputClass} style={inputStyle} required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-medium mb-1" style={{ color: COLORS.textMuted }}>Model</label>
                      <input
                        type="text" placeholder="e.g. Himalayan 450"
                        value={bikeForm.model} onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })}
                        className={inputClass} style={inputStyle} required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] uppercase font-medium mb-1" style={{ color: COLORS.textMuted }}>Year</label>
                      <input
                        type="number" value={bikeForm.year}
                        onChange={(e) => setBikeForm({ ...bikeForm, year: parseInt(e.target.value, 10) })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-medium mb-1" style={{ color: COLORS.textMuted }}>Engine (CC)</label>
                      <input
                        type="number" placeholder="452" value={bikeForm.engine_cc}
                        onChange={(e) => setBikeForm({ ...bikeForm, engine_cc: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase font-medium mb-1" style={{ color: COLORS.textMuted }}>Reg. No.</label>
                      <input
                        type="text" placeholder="TN-07-XX-1234" value={bikeForm.reg_number}
                        onChange={(e) => setBikeForm({ ...bikeForm, reg_number: e.target.value })}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox" id="is_primary"
                      checked={bikeForm.is_primary}
                      onChange={(e) => setBikeForm({ ...bikeForm, is_primary: e.target.checked })}
                    />
                    <label htmlFor="is_primary" className="text-xs" style={{ color: COLORS.textPrimary }}>Set as primary motorcycle</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 hover:brightness-110"
                    style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
                  >
                    Save Motorcycle
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}


        {/* Safety & Emergency Contacts Tab */}
        {activeTab === 'safety' && (
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="p-3 rounded-lg border" style={{ backgroundColor: `${COLORS.rust}15`, borderColor: `${COLORS.rust}44` }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: COLORS.rust }}>
                <ShieldAlert size={18} />
                <h4 className="font-semibold text-sm">Emergency SOS Contact</h4>
              </div>
              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                Essential for group ride safety briefs. Ride marshals can access this in case of roadside emergencies.
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Contact Person Name</label>
              <input
                type="text"
                placeholder="e.g. Rohan (Brother)"
                value={preferences.emergency_name || ''}
                onChange={(e) => setPreferences({ ...preferences, emergency_name: e.target.value })}
                className={inputClass} style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Emergency Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={preferences.emergency_phone || ''}
                onChange={(e) => setPreferences({ ...preferences, emergency_phone: e.target.value })}
                className={inputClass} style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold mb-1" style={{ color: COLORS.textMuted }}>Default Ride Difficulty Preference</label>
              <select
                value={preferences.preferred_difficulty || 'cruiser'}
                onChange={(e) => setPreferences({ ...preferences, preferred_difficulty: e.target.value })}
                className={inputClass} style={inputStyle}
              >
                <option value="cruiser">Cruiser (Relaxed pace)</option>
                <option value="spirited">Spirited (Brisk twisties & highway)</option>
                <option value="hardcore">Hardcore (Endurance & steep ghats)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-110"
              style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Safety Contact'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
