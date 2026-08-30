import React, { useState, useEffect } from 'react';
import {
  Compass, PlusCircle, User, ArrowLeft, Star, Send, Users, MapPin,
  Calendar, Clock, ChevronRight, X, Plus, Award, Settings, Sun, Moon,
  ShieldCheck, Bike, Sparkles, SlidersHorizontal, Layers
} from 'lucide-react';
import MyAccount from './components/MyAccount.jsx';
import RouteMap from './components/RouteMap.jsx';
import MapLocationPicker from './components/MapLocationPicker.jsx';
import RideCard from './components/RideCard.jsx';
import QuickJoinSheet from './components/QuickJoinSheet.jsx';
import HostRideModal from './components/HostRideModal.jsx';
import RideChat from './components/RideChat.jsx';
import RideDayBanner from './components/RideDayBanner.jsx';

const INITIAL_RIDERS = [
  { id: 'me', name: 'You (Arjun)', avatar: 'A', color: '#F2B705', bio: 'Weekend rider. Coastal roads over highways.', badges: ['Early Bird'] },
  { id: 'r2', name: 'Priya Nair', avatar: 'P', color: '#D9622B', bio: 'Touring since 2018. ECR regular.', badges: ['Trailblazer', '100+ Rides'] },
  { id: 'r3', name: 'Karthik R', avatar: 'K', color: '#7A9B5C', bio: 'Himalayan owner. Ghat roads regular.', badges: ['Night Rider'] },
  { id: 'r4', name: 'Fathima S', avatar: 'F', color: '#5B8FA8', bio: 'Cruiser enthusiast.', badges: ['Safety First'] },
  { id: 'r5', name: 'Vignesh M', avatar: 'V', color: '#B968C7', bio: 'Group ride marshal.', badges: ['Marshal'] },
];

const INITIAL_RIDES = [
  {
    id: 'ride1',
    title: 'ECR Sunrise & Filter Coffee',
    hostId: 'r2',
    date: new Date().toISOString().split('T')[0], // Today's date for RideDayBanner demo
    time: '5:30 AM',
    points: ['Chennai (ECR Toll)', 'Mahabalipuram Beach Shack', 'Pondicherry Promenade'],
    distanceKm: 160,
    difficulty: 'cruiser',
    maxRiders: 10,
    currentRiders: ['r2', 'r3', 'me'],
    description: 'Early morning rollout down ECR for fresh filter coffee and breakfast by the waves. Return before noon traffic.',
    status: 'upcoming',
    chat: [
      { riderId: 'r2', riderName: 'Priya Nair', text: '📍 Meeting at ECR toll gate, 5:15 AM sharp. Fuel up before arrival!', time: '8:12 PM' },
      { riderId: 'r3', riderName: 'Karthik R', text: '👍 In. Bringing spare rain visor if anyone needs one.', time: '8:20 PM' },
    ],
    reviews: [],
  },
  {
    id: 'ride2',
    title: 'Yelagiri Hairpin Hunt',
    hostId: 'r5',
    date: '2026-09-12',
    time: '6:00 AM',
    points: ['Chennai Toll', 'Vellore Highway', 'Yelagiri Hills Top'],
    distanceKm: 230,
    difficulty: 'spirited',
    maxRiders: 8,
    currentRiders: ['r5', 'r4'],
    description: 'Fourteen hairpins up, fourteen back down. Regrouping at every 3rd bend. Decent tyres recommended.',
    status: 'upcoming',
    chat: [],
    reviews: [],
  },
  {
    id: 'ride3',
    title: 'Kolli Hills 70 Bends Challenge',
    hostId: 'r3',
    date: '2026-09-20',
    time: '5:00 AM',
    points: ['Chennai', 'Namakkal', 'Kolli Hills Viewpoint'],
    distanceKm: 360,
    difficulty: 'hardcore',
    maxRiders: 6,
    currentRiders: ['r3'],
    description: 'All 70 numbered hairpins in one shot. Reserved for riders comfortable with tight switchbacks and long saddle hours.',
    status: 'upcoming',
    chat: [],
    reviews: [],
  },
];

export default function App() {
  const [theme, setTheme] = useState('night');
  const [currentTab, setCurrentTab] = useState('feed'); // 'feed' | 'account' | 'details'
  const [filter, setFilter] = useState('all'); // 'all' | 'cruiser' | 'spirited' | 'hardcore'
  const [rides, setRides] = useState(INITIAL_RIDES);
  const [selectedRide, setSelectedRide] = useState(null);
  const [quickJoinRide, setQuickJoinRide] = useState(null);
  const [showHostModal, setShowHostModal] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Arjun Kumar',
    city: 'Chennai',
    experience: 'Intermediate',
    badges: ['Early Bird', 'Coastal Regular', 'Marshal Certified'],
    primaryBike: { make: 'Royal Enfield', model: 'Himalayan 450', year: 2024 },
    sosContact: { name: 'Ramesh Kumar', phone: '+91 98765 43210', relation: 'Father' },
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Find ride scheduled for today that user has joined
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRide = rides.find((r) => r.date === todayStr && r.currentRiders.includes('me'));

  const handleQuickJoinConfirm = (rideId, bikeName) => {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId && !r.currentRiders.includes('me')
          ? { ...r, currentRiders: [...r.currentRiders, 'me'] }
          : r
      )
    );
    setQuickJoinRide(null);
  };

  const handleHostRideCreate = (newRideData) => {
    const newRide = {
      id: `ride_${Date.now()}`,
      ...newRideData,
      hostId: 'me',
      currentRiders: ['me'],
      status: 'upcoming',
      chat: [],
      reviews: [],
    };
    setRides([newRide, ...rides]);
    setShowHostModal(false);
  };

  const handleSendMessage = (msgText) => {
    if (!selectedRide) return;
    const newMsg = {
      riderId: 'me',
      riderName: 'You (Arjun)',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedRide = { ...selectedRide, chat: [...(selectedRide.chat || []), newMsg] };
    setSelectedRide(updatedRide);
    setRides((prev) => prev.map((r) => (r.id === selectedRide.id ? updatedRide : r)));
  };

  const filteredRides = rides.filter((r) => {
    if (filter === 'all') return true;
    return r.difficulty === filter;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', pb: '40px' }}>
      {/* iOS Liquid Navigation Header */}
      <header
        className="glass-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          onClick={() => setCurrentTab('feed')}
          className="ios-pressable"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--amber-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--amber-glow)' }}>
            <Compass size={22} color="#0B0E11" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                GET ALONG
              </span>
              <span style={{ fontSize: '0.65rem', background: 'var(--amber-gradient)', color: '#0B0E11', fontWeight: 800, padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                v2.0
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowHostModal(true)}
            className={`ios-pressable liquid-pill ${showHostModal ? 'liquid-pill-active' : ''}`}
            style={{
              backgroundColor: showHostModal ? 'transparent' : 'var(--surface-raised)',
              color: showHostModal ? '#0B0E11' : 'var(--text-primary)',
              border: showHostModal ? '1px solid var(--amber)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={16} color={showHostModal ? '#0B0E11' : 'var(--text-primary)'} /> Host
          </button>

          <button
            onClick={() => setCurrentTab(currentTab === 'account' ? 'feed' : 'account')}
            className={`ios-pressable liquid-pill ${currentTab === 'account' ? 'liquid-pill-active' : ''}`}
            style={{
              backgroundColor: currentTab === 'account' ? 'transparent' : 'var(--surface-raised)',
              color: currentTab === 'account' ? '#0B0E11' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.86rem',
            }}
          >
            <User size={16} color={currentTab === 'account' ? '#0B0E11' : 'var(--text-primary)'} /> Profile
          </button>

          <button
            onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}
            className="ios-pressable"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {theme === 'night' ? <Sun size={17} color="var(--amber)" /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Main Content Area with Blur-Out & Blur-In Page Navigation */}
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
        {currentTab === 'account' ? (
          <div key="account-tab" className="animate-liquid-blur-in">
            <MyAccount
              userProfile={userProfile}
              onClose={() => setCurrentTab('feed')}
              onUpdateProfile={(updated) => setUserProfile({ ...userProfile, ...updated })}
            />
          </div>
        ) : currentTab === 'details' && selectedRide ? (
          <div key="details-tab" className="animate-liquid-blur-in">
            {/* Back Navigation Button */}
            <button
              onClick={() => setCurrentTab('feed')}
              className="ios-pressable liquid-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                color: 'var(--amber)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
            >
              <ArrowLeft size={16} /> Back to Feed
            </button>

            {/* Ride Details Header */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {selectedRide.difficulty} Pace
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  📅 {selectedRide.date} @ {selectedRide.time}
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.4px' }}>
                {selectedRide.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.65', marginBottom: '18px' }}>
                {selectedRide.description}
              </p>

              {/* Waypoints Strip */}
              <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: 'var(--amber)' }}>Waypoints:</strong> {selectedRide.points.join(' ➔ ')} ({selectedRide.distanceKm} km)
              </div>
            </div>

            {/* Route Map */}
            <div style={{ marginBottom: '20px' }}>
              <RouteMap waypoints={selectedRide.points} />
            </div>

            {/* iOS Ride Chat */}
            <RideChat
              chatMessages={selectedRide.chat}
              onSendMessage={handleSendMessage}
              currentRiderId="me"
            />
          </div>
        ) : (
          <div key="feed-tab" className="animate-liquid-blur-in">
            {/* Live Ride-Day Banner */}
            {todayRide && (
              <RideDayBanner
                ride={todayRide}
                onOpenDetails={(r) => {
                  setSelectedRide(r);
                  setCurrentTab('details');
                }}
              />
            )}

            {/* Liquid Flow Segmented Filter Pills Bar */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '4px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                marginBottom: '24px',
              }}
            >
              {['all', 'cruiser', 'spirited', 'hardcore'].map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
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
                      textTransform: 'capitalize',
                      textAlign: 'center',
                    }}
                  >
                    {f === 'all' ? 'All Rides' : f}
                  </button>
                );
              })}
            </div>

            {/* Rides List */}
            {filteredRides.map((ride) => {
              const isJoined = ride.currentRiders.includes('me');
              return (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  host={INITIAL_RIDERS.find((r) => r.id === ride.hostId)}
                  isJoined={isJoined}
                  onSelect={(r) => {
                    setSelectedRide(r);
                    setCurrentTab('details');
                  }}
                  onQuickJoin={(r) => setQuickJoinRide(r)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* 1-Tap Quick Join Bottom Sheet */}
      {quickJoinRide && (
        <QuickJoinSheet
          ride={quickJoinRide}
          primaryBike={userProfile.primaryBike}
          sosConfigured={Boolean(userProfile.sosContact?.phone)}
          onConfirm={handleQuickJoinConfirm}
          onClose={() => setQuickJoinRide(null)}
        />
      )}

      {/* Host Ride Modal */}
      {showHostModal && (
        <HostRideModal
          onHostRide={handleHostRideCreate}
          onClose={() => setShowHostModal(false)}
        />
      )}
    </div>
  );
}
