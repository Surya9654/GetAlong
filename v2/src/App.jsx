import React, { useState, useEffect } from 'react';
import {
  Compass, PlusCircle, User, ArrowLeft, Star, Send, Users, MapPin,
  Calendar, Clock, ChevronRight, X, Plus, Award, Settings, Sun, Moon,
  ShieldCheck, Bike, Sparkles
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
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(26, 29, 34, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          onClick={() => setCurrentTab('feed')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Compass size={28} color="var(--amber)" />
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-primary)' }}>
              GET ALONG
            </span>
            <span style={{ marginLeft: '6px', fontSize: '0.68rem', backgroundColor: 'var(--amber)', color: '#121417', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
              v2.0
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowHostModal(true)}
            style={{
              backgroundColor: 'var(--amber)',
              color: '#121417',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={17} /> Host Ride
          </button>

          <button
            onClick={() => setCurrentTab(currentTab === 'account' ? 'feed' : 'account')}
            style={{
              backgroundColor: currentTab === 'account' ? 'var(--amber)' : 'var(--surface-raised)',
              color: currentTab === 'account' ? '#121417' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            <User size={17} /> Profile
          </button>

          <button
            onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px',
              cursor: 'pointer',
            }}
          >
            {theme === 'night' ? <Sun size={18} color="var(--amber)" /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 16px' }}>
        {currentTab === 'account' ? (
          <MyAccount
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile({ ...userProfile, ...updated })}
          />
        ) : currentTab === 'details' && selectedRide ? (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setCurrentTab('feed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--amber)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <ArrowLeft size={18} /> Back to Group Rides Feed
            </button>

            {/* Ride Details Header */}
            <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--amber)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedRide.difficulty} Pace
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📅 {selectedRide.date} at {selectedRide.time}
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                {selectedRide.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
                {selectedRide.description}
              </p>

              {/* Waypoint Route Strip */}
              <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)', padding: '12px', fontSize: '0.9rem' }}>
                <strong>Waypoints:</strong> {selectedRide.points.join(' ➔ ')} ({selectedRide.distanceKm} km total)
              </div>
            </div>

            {/* Interactive Route Map Component */}
            <div style={{ marginBottom: '20px' }}>
              <RouteMap waypoints={selectedRide.points} />
            </div>

            {/* Hands-Free Group Chat */}
            <RideChat
              chatMessages={selectedRide.chat}
              onSendMessage={handleSendMessage}
              currentRiderId="me"
            />
          </div>
        ) : (
          <div>
            {/* Hero Ride Day Banner if user has a ride today */}
            {todayRide && (
              <RideDayBanner
                ride={todayRide}
                onOpenDetails={(r) => {
                  setSelectedRide(r);
                  setCurrentTab('details');
                }}
              />
            )}

            {/* Feed Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', pb: '10px', marginBottom: '20px' }}>
              {['all', 'cruiser', 'spirited', 'hardcore'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    backgroundColor: filter === f ? 'var(--amber)' : 'var(--surface-color)',
                    color: filter === f ? '#121417' : 'var(--text-primary)',
                    border: `1px solid ${filter === f ? 'var(--amber)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f === 'all' ? 'All Rides' : `${f} Pace`}
                </button>
              ))}
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

      {/* 30-Second Host Ride Modal */}
      {showHostModal && (
        <HostRideModal
          onHostRide={handleHostRideCreate}
          onClose={() => setShowHostModal(false)}
        />
      )}
    </div>
  );
}
