import React, { useState, useEffect } from 'react';
import {
  Compass, PlusCircle, User, ArrowLeft, Star, Send, Users, MapPin,
  Calendar, Clock, ChevronRight, X, Plus, Minus, Award, Settings, Sun, Moon,
  Camera, Image, Trash2, Upload,
} from 'lucide-react';
import MyAccount from './src/components/MyAccount.jsx';
import RouteMap from './src/components/RouteMap.jsx';
import MapLocationPicker from './src/components/MapLocationPicker.jsx';

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
    hardcoreRed: '#D9432E',
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
    hardcoreRed: '#B82E1B',
  }
};

const COLORS = THEMES.night;
const DIFFICULTY = {
  cruiser: { label: 'Cruiser', color: COLORS.moss },
  spirited: { label: 'Spirited', color: COLORS.amber },
  hardcore: { label: 'Hardcore', color: COLORS.hardcoreRed },
};

const ThemeContext = React.createContext({
  theme: 'night',
  colors: THEMES.night,
  difficulty: DIFFICULTY,
});


const INITIAL_RIDERS = [

  { id: 'me', name: 'You (Arjun)', avatar: 'A', color: '#F2B705', bio: 'Weekend rider. Coastal roads over highways, always.', badges: ['Early bird'] },
  { id: 'r2', name: 'Priya Nair', avatar: 'P', color: '#D9622B', bio: 'Touring since 2018. ECR regular, breakfast-stop connoisseur.', badges: ['Trailblazer', '100+ rides hosted'] },
  { id: 'r3', name: 'Karthik R', avatar: 'K', color: '#7A9B5C', bio: 'Himalayan owner. Ghat roads over highways, every time.', badges: ['Night rider'] },
  { id: 'r4', name: 'Fathima S', avatar: 'F', color: '#5B8FA8', bio: 'New rider, still learning the ropes. Always up for a cruiser run.', badges: [] },
  { id: 'r5', name: 'Vignesh M', avatar: 'V', color: '#B968C7', bio: 'Group ride organizer. Safety briefing before every start.', badges: ['Marshal'] },
];

const INITIAL_RIDES = [
  {
    id: 'ride1',
    title: 'ECR Sunrise Run',
    hostId: 'r2',
    date: '2026-09-06',
    time: '5:30 AM',
    points: ['Chennai (ECR start)', 'Mahabalipuram', 'Pondicherry'],
    distanceKm: 160,
    difficulty: 'cruiser',
    maxRiders: 10,
    currentRiders: ['r2', 'r3', 'me'],
    description: 'Early start to beat the heat. We roll out from the ECR toll gate and keep a relaxed pace down to Mahabs for filter coffee, then push on to Pondy for lunch. Back by evening. Fuel up before you arrive, first stop is 40km in.',
    status: 'upcoming',
    chat: [
      { riderId: 'r2', text: 'Meeting at the ECR toll gate, 5:15 sharp. Fuel up before you arrive!', time: '8:12 PM' },
      { riderId: 'r3', text: 'In. Bringing a spare helmet if anyone needs one.', time: '8:20 PM' },
    ],
    reviews: [],
  },
  {
    id: 'ride2',
    title: 'Yelagiri Ghat Loop',
    hostId: 'r5',
    date: '2026-09-13',
    time: '6:00 AM',
    points: ['Chennai', 'Vellore', 'Yelagiri Hills'],
    distanceKm: 230,
    difficulty: 'spirited',
    maxRiders: 8,
    currentRiders: ['r5', 'r4'],
    description: 'Fourteen hairpins up, fourteen back down. Regroup at every third bend, no exceptions. Lake-side lunch at the top before we head back. Decent tyres recommended, the last 6km get loose in patches.',
    status: 'upcoming',
    chat: [],
    reviews: [],
  },
  {
    id: 'ride3',
    title: 'Kolli Hills Hairpin Hunt',
    hostId: 'r3',
    date: '2026-09-20',
    time: '5:00 AM',
    points: ['Chennai', 'Namakkal', 'Kolli Hills (70 hairpins)'],
    distanceKm: 360,
    difficulty: 'hardcore',
    maxRiders: 6,
    currentRiders: ['r3'],
    description: 'Long day in the saddle. All 70 numbered hairpins, one shot, no skipping the top viewpoint. This one is for riders comfortable with tight switchbacks and long stretches — not a first-timer route.',
    status: 'upcoming',
    chat: [],
    reviews: [],
  },
  {
    id: 'ride4',
    title: 'Pondy Coastal Cruise',
    hostId: 'r2',
    date: '2026-08-02',
    time: '6:00 AM',
    points: ['Chennai', 'ECR', 'Pondicherry'],
    distanceKm: 170,
    difficulty: 'cruiser',
    maxRiders: 10,
    currentRiders: ['r2', 'me', 'r4'],
    description: 'Easy coastal cruise down ECR with a proper breakfast stop and a slow return before traffic picked up.',
    status: 'completed',
    chat: [
      { riderId: 'r2', text: 'That breakfast stop at the beach shack was perfect timing.', time: '6:45 AM' },
      { riderId: 'me', text: 'Agreed, best filter coffee on ECR.', time: '6:50 AM' },
      { riderId: 'r4', text: 'Thanks for waiting up on the bends, Priya!', time: '7:30 AM' },
    ],
    reviews: [
      { riderId: 'me', rating: 5, comment: 'Great pace, well organized, and that breakfast stop made the ride.' },
      { riderId: 'r4', rating: 4, comment: 'Fun ride overall, wish we started a little later though.' },
    ],
  },
];

function Avatar({ person, size = 32, glow = false }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '9999px',
        backgroundColor: person.color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Oswald, sans-serif', fontWeight: 600,
        fontSize: size * 0.42, color: COLORS.bg, flexShrink: 0,
        boxShadow: glow ? `0 0 0 2px ${COLORS.bg}, 0 0 12px ${person.color}50` : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {person.avatar}
    </div>
  );
}

function AvatarStack({ people, size = 24 }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  const shown = people.slice(0, 4);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -8, border: `2px solid ${COLORS.surface}`, borderRadius: '9999px' }}>
          <Avatar person={p} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -8, width: size, height: size, borderRadius: '9999px',
            backgroundColor: COLORS.surfaceRaised, border: `2px solid ${COLORS.surface}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, color: COLORS.textMuted, fontFamily: 'IBM Plex Mono, monospace',
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

function DifficultyPill({ level }) {
  const { colors: COLORS, difficulty: DIFFICULTY } = React.useContext(ThemeContext);
  const d = DIFFICULTY[level] || { label: level, color: COLORS.moss };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full font-mono uppercase"
      style={{
        fontSize: 10, letterSpacing: '0.06em', fontWeight: 500,
        backgroundColor: `${d.color}18`, color: d.color,
        border: `1px solid ${d.color}35`,
        boxShadow: `0 0 8px ${d.color}15`,
      }}
    >
      {d.label}
    </span>
  );
}

function RouteStrip({ points, color, compact }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  if (!points || points.length === 0) return null;
  return (
    <div className="w-full">
      <div className="relative flex items-center" style={{ height: compact ? 18 : 26 }}>
        <div
          className="absolute left-0 right-0"
          style={{
            height: 2, top: '50%', transform: 'translateY(-50%)',
            backgroundImage: `repeating-linear-gradient(to right, ${color} 0 7px, transparent 7px 13px)`,
          }}
        />
        <div className="relative flex w-full justify-between">
          {points.map((p, i) => (
            <div
              key={i}
              style={{
                width: compact ? 8 : 10, height: compact ? 8 : 10, borderRadius: '9999px',
                backgroundColor: i === 0 || i === points.length - 1 ? color : COLORS.bg,
                border: `2px solid ${color}`, zIndex: 1,
              }}
            />
          ))}
        </div>
      </div>
      {compact ? (
        <div className="flex justify-between mt-1">
          <span className="font-mono truncate" style={{ fontSize: 10, color: COLORS.textMuted, maxWidth: '46%' }}>{points[0]?.split(',')[0]}</span>
          <span className="font-mono truncate text-right" style={{ fontSize: 10, color: COLORS.textMuted, maxWidth: '46%' }}>{points[points.length - 1]?.split(',')[0]}</span>
        </div>
      ) : (
        <div className="flex justify-between mt-1.5 gap-1">
          {points.map((p, i) => (
            <span
              key={i}
              className="font-mono uppercase text-center truncate block"
              style={{
                fontSize: 9,
                color: i === 0 ? COLORS.moss : i === points.length - 1 ? COLORS.hardcoreRed : COLORS.amber,
                maxWidth: `${Math.floor(100 / points.length)}%`,
                letterSpacing: '0.02em',
              }}
              title={p}
            >
              {p ? p.split(',')[0] : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StarSelector({ value, onChange }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="hover:brightness-110">
          <Star size={22} fill={n <= value ? COLORS.amber : 'none'} color={n <= value ? COLORS.amber : COLORS.textFaint} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value, size = 14 }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= value ? COLORS.amber : 'none'} color={n <= value ? COLORS.amber : COLORS.textFaint} />
      ))}
    </div>
  );
}

function StatBlock({ label, value }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  return (
    <div className="glass-card rounded-xl py-3.5 text-center" style={{ background: `linear-gradient(135deg, ${COLORS.surface}88, ${COLORS.surfaceRaised}44)` }}>
      <p className="font-mono text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{value}</p>
      <p className="uppercase mt-0.5" style={{ fontSize: 9, letterSpacing: '0.06em', color: COLORS.textFaint }}>{label}</p>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  if (/AM|PM/i.test(t)) return t;
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function Label({ children }) {
  const { colors: COLORS } = React.useContext(ThemeContext);
  return <label className="font-semibold uppercase block mb-1.5" style={{ fontSize: 11, letterSpacing: '0.05em', color: COLORS.textMuted }}>{children}</label>;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('getalong_theme') || 'night');
  const [riders, setRiders] = useState(INITIAL_RIDERS);
  const [rides, setRides] = useState(INITIAL_RIDES);
  const [currentUser, setCurrentUser] = useState('me'); // 'guest' | 'me'
  const [showGuestNotice, setShowGuestNotice] = useState(false);
  const [view, setView] = useState('feed');
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState('me');
  const [cameFrom, setCameFrom] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [garageTab, setGarageTab] = useState('hosted');
  const [filter, setFilter] = useState('all');
  const [chatInput, setChatInput] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [stopInput, setStopInput] = useState('');
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState('start'); // 'start' | 'end'
  const [uploadPhotoPreview, setUploadPhotoPreview] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoLightbox, setSelectedPhotoLightbox] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '', start: '', end: '', stops: [], date: '', time: '',
    difficulty: 'cruiser', maxRiders: 8, distanceKm: '', description: '',
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'night' ? 'day' : 'night';
    setTheme(nextTheme);
    localStorage.setItem('getalong_theme', nextTheme);
  };

  const COLORS = THEMES[theme];
  const DIFFICULTY = {
    cruiser: { label: 'Cruiser', color: COLORS.moss },
    spirited: { label: 'Spirited', color: COLORS.amber },
    hardcore: { label: 'Hardcore', color: COLORS.hardcoreRed },
  };

  const inputClass = 'w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none premium-input';
  const inputStyle = { backgroundColor: `${COLORS.surface}cc`, color: COLORS.textPrimary, border: `1px solid ${COLORS.border}88`, transition: 'all 0.2s ease' };


  const fetchRidesAndRiders = async () => {
    try {
      const [ridesRes, ridersRes] = await Promise.all([
        fetch('/api/rides'),
        fetch('/api/riders')
      ]);
      if (ridesRes.ok) {
        const ridesData = await ridesRes.json();
        if (Array.isArray(ridesData) && ridesData.length > 0) setRides(ridesData);
      }
      if (ridersRes.ok) {
        const ridersData = await ridersRes.json();
        if (Array.isArray(ridersData) && ridersData.length > 0) setRiders(ridersData);
      }
    } catch (err) {
      console.warn('DB API sync warning:', err.message);
    }
  };

  useEffect(() => {
    fetchRidesAndRiders();
  }, []);

  const [isExiting, setIsExiting] = useState(false);

  const navigateWithBlur = (action) => {
    setIsExiting(true);
    setTimeout(() => {
      action();
      setIsExiting(false);
    }, 140);
  };

  const getRider = (id) => riders.find((r) => r.id === id) || riders[0];

  const openRide = (id) => {
    navigateWithBlur(() => {
      setSelectedRideId(id);
      setDetailTab('overview');
      setView('detail');
    });
  };

  const openProfile = (id, from = null) => {
    navigateWithBlur(() => {
      if (from) setCameFrom(from); else setCameFrom(null);
      setSelectedProfileId(id);
      setGarageTab('hosted');
      setView('garage');
    });
  };

  const goBack = () => {
    navigateWithBlur(() => {
      if (view === 'garage' && cameFrom) {
        setView(cameFrom.view);
        if (cameFrom.rideId) setSelectedRideId(cameFrom.rideId);
        setCameFrom(null);
        return;
      }
      setView('feed');
    });
  };

  // Ensure token is fetched when connecting as Arjun
  const ensureAuthToken = async () => {
    let token = localStorage.getItem('getalong_token');
    if (!token) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'me' })
        });
        if (res.ok) {
          const data = await res.json();
          token = data.token;
          localStorage.setItem('getalong_token', token);
        }
      } catch (err) {
        console.warn('Auth token login error:', err);
      }
    }
    return token;
  };

  const getAuthHeaders = async () => {
    const token = await ensureAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Toggle Join / Leave Ride (Guest Mode Enforcement)
  const toggleJoin = async (rideId) => {
    if (currentUser === 'guest') {
      setShowGuestNotice(true);
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ riderId: 'me' })
      });
      if (res.ok) {
        const updated = await res.json();
        setRides((prev) => prev.map((r) => r.id === rideId ? updated : r));
      }
    } catch (err) {
      console.error('Error toggling join:', err);
    }
  };

  // Send Group Chat Message
  const sendChat = async (rideId) => {
    if (currentUser === 'guest') {
      setShowGuestNotice(true);
      return;
    }
    if (!chatInput.trim()) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ riderId: 'me', text: chatInput.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setRides((prev) => prev.map((r) => r.id === rideId ? updated : r));
        setChatInput('');
      }
    } catch (err) {
      console.error('Error sending chat:', err);
    }
  };

  // Submit Ride Review
  const submitReview = async (rideId) => {
    if (currentUser === 'guest') {
      setShowGuestNotice(true);
      return;
    }
    if (!reviewText.trim()) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ riderId: 'me', rating: reviewStars, comment: reviewText.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setRides((prev) => prev.map((r) => r.id === rideId ? updated : r));
        setReviewText('');
        setReviewStars(5);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const addStop = () => { if (stopInput.trim()) { setCreateForm((f) => ({ ...f, stops: [...f.stops, stopInput.trim()] })); setStopInput(''); } };
  const removeStop = (i) => setCreateForm((f) => ({ ...f, stops: f.stops.filter((_, idx) => idx !== i) }));

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Photo must be smaller than 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (rideId) => {
    if (!uploadPhotoPreview) return;
    if (currentUser === 'guest') {
      setShowGuestNotice(true);
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/photos`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uploaderId: currentUser, photoUrl: uploadPhotoPreview, caption: uploadCaption.trim() }),
      });
      if (res.ok) {
        const updatedRide = await res.json();
        setRides((prev) => prev.map((r) => (r.id === updatedRide.id ? updatedRide : r)));
        setShowUploadPhotoModal(false);
        setUploadPhotoPreview('');
        setUploadCaption('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const deletePhoto = async (rideId, photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/photos/${photoId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ callerId: currentUser }),
      });
      if (res.ok) {
        const updatedRide = await res.json();
        setRides((prev) => prev.map((r) => (r.id === updatedRide.id ? updatedRide : r)));
        setSelectedPhotoLightbox(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete photo');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete photo');
    }
  };

  const cancelRide = async (rideId) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ callerId: currentUser }),
      });
      if (res.ok) {
        setRides((prev) => prev.filter((r) => r.id !== rideId));
        setShowCancelConfirmModal(false);
        setView('feed');
        setSelectedRideId(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to cancel ride');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel ride');
    }
  };

  const removeRider = async (rideId, riderId) => {
    const rider = getRider(riderId);
    if (!confirm(`Are you sure you want to remove ${rider.name} from this ride?`)) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/rides/${rideId}/participants/${riderId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ callerId: currentUser }),
      });
      if (res.ok) {
        const updatedRide = await res.json();
        setRides((prev) => prev.map((r) => (r.id === updatedRide.id ? updatedRide : r)));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to remove rider');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to remove rider');
    }
  };

  // Create Group Ride
  const submitCreate = async () => {
    if (currentUser === 'guest') {
      setShowGuestNotice(true);
      return;
    }
    const f = createForm;

    if (!f.title.trim() || !f.start.trim() || !f.end.trim() || !f.date || !f.time) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (f.date < todayStr) {
      alert('Ride date cannot be in the past. Please select today or a future date.');
      return;
    }

    try {

      const payload = {
        title: f.title.trim(),
        hostId: 'me',
        date: f.date,
        time: f.time,
        points: [f.start.trim(), ...f.stops, f.end.trim()],
        distanceKm: f.distanceKm ? Number(f.distanceKm) : null,
        difficulty: f.difficulty,
        maxRiders: f.maxRiders,
        description: f.description.trim(),
      };

      const headers = await getAuthHeaders();
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });


      if (res.ok) {
        const newRide = await res.json();
        setRides((prev) => [newRide, ...prev]);
        setCreateForm({ title: '', start: '', end: '', stops: [], date: '', time: '', difficulty: 'cruiser', maxRiders: 8, distanceKm: '', description: '' });
        setSelectedRideId(newRide.id);
        setDetailTab('overview');
        setView('detail');
      }
    } catch (err) {
      console.error('Error hosting ride:', err);
    }
  };

  function renderRideCard(ride, idx = 0) {
    const host = getRider(ride.hostId);
    const d = DIFFICULTY[ride.difficulty];
    return (
      <div
        key={ride.id}
        onClick={() => openRide(ride.id)}
        className="ride-card glass-card cursor-pointer rounded-2xl p-4 mb-3 animate-slide-up"
        style={{
          '--accent-color': d.color,
          '--glow-color': `${d.color}25`,
          animationDelay: `${idx * 0.07}s`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <DifficultyPill level={ride.difficulty} />
          <div className="flex items-center gap-2">
            {ride.distanceKm && (
              <span className="font-mono px-2 py-0.5 rounded-md" style={{ fontSize: 10, backgroundColor: `${COLORS.textFaint}15`, color: COLORS.textMuted }}>
                {ride.distanceKm} km
              </span>
            )}
            <span className="font-mono" style={{ fontSize: 11, color: COLORS.textFaint }}>{formatDate(ride.date)} · {formatTime(ride.time)}</span>
          </div>
        </div>
        <h3 className="mb-2" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 19, color: COLORS.textPrimary, letterSpacing: '0.01em' }}>{ride.title}</h3>
        <RouteStrip points={ride.points} color={d.color} compact />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Avatar person={host} size={22} />
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>Hosted by {ride.hostId === 'me' ? 'you' : host.name.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-3">
            <AvatarStack people={ride.currentRiders.map(getRider)} size={20} />
            <span className="font-mono flex items-center gap-1" style={{ fontSize: 11, color: COLORS.textMuted }}>
              {ride.currentRiders.length}/{ride.maxRiders}
            </span>
          </div>
        </div>
      </div>
    );
  }

  function renderFeed() {
    const upcoming = rides.filter((r) => r.status === 'upcoming');
    const filtered = filter === 'all' ? upcoming : upcoming.filter((r) => r.difficulty === filter);
    return (
      <div>
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="gradient-text"
                style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 32, letterSpacing: '0.04em', lineHeight: 1 }}
              >
                GET ALONG
              </h1>
              <p className="text-sm mt-1.5" style={{ color: COLORS.textMuted, textShadow: `0 0 20px ${COLORS.amber}15` }}>
                Find your next ride out.
              </p>
            </div>
            {upcoming.length > 0 && (
              <span
                className="font-mono px-2.5 py-1 rounded-full"
                style={{
                  fontSize: 10,
                  backgroundColor: `${COLORS.amber}18`,
                  color: COLORS.amber,
                  border: `1px solid ${COLORS.amber}33`,
                  letterSpacing: '0.03em',
                }}
              >
                {upcoming.length} upcoming
              </span>
            )}
          </div>
        </div>
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
          {['all', 'cruiser', 'spirited', 'hardcore'].map((f) => {
            const active = filter === f;
            const activeColor = f === 'all' ? COLORS.amber : DIFFICULTY[f].color;
            return (
              <button
                key={f} onClick={() => setFilter(f)}
                className="px-3.5 py-1.5 rounded-full font-medium capitalize flex-shrink-0 flex items-center gap-1.5"
                style={{
                  fontSize: 12,
                  backgroundColor: active ? activeColor : COLORS.surface,
                  color: active ? COLORS.bg : COLORS.textMuted,
                  border: `1px solid ${active ? 'transparent' : COLORS.border}`,
                  boxShadow: active ? `0 0 14px ${activeColor}40, 0 0 4px ${activeColor}30` : 'none',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: COLORS.bg, flexShrink: 0 }} />}
                {f}
              </button>
            );
          })}
        </div>
        <div className="px-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6">
              <div className="p-4 rounded-full" style={{ backgroundColor: `${COLORS.textFaint}10` }}>
                <Compass size={32} color={COLORS.textFaint} />
              </div>
              <p className="mt-4 font-medium" style={{ color: COLORS.textPrimary }}>No rides out here yet.</p>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>Be the first to host one in this category.</p>
            </div>
          ) : filtered.map((ride, idx) => renderRideCard(ride, idx))}
        </div>
      </div>
    );
  }

  function renderDetail() {
    const ride = rides.find((r) => r.id === selectedRideId);
    if (!ride) return null;
    const host = getRider(ride.hostId);
    const d = DIFFICULTY[ride.difficulty];
    const isMember = ride.currentRiders.includes('me');
    const isHost = ride.hostId === 'me';
    const isFull = ride.currentRiders.length >= ride.maxRiders;
    const myReview = ride.reviews.find((r) => r.riderId === 'me');

    return (
      <div>
        {/* Hero header gradient */}
        <div className="px-4 pt-5" style={{ background: `linear-gradient(180deg, ${d.color}12 0%, transparent 100%)` }}>
          <DifficultyPill level={ride.difficulty} />
          <h2 className="mt-3 mb-3" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 24, color: COLORS.textPrimary, letterSpacing: '0.01em' }}>{ride.title}</h2>
          <RouteStrip points={ride.points} color={d.color} />
          <div className="flex flex-wrap gap-3 mt-4 mb-4">
            <span className="flex items-center gap-1.5 text-sm" style={{ color: COLORS.textMuted }}><Calendar size={14} />{formatDate(ride.date)}</span>
            <span className="flex items-center gap-1.5 text-sm" style={{ color: COLORS.textMuted }}><Clock size={14} />{formatTime(ride.time)}</span>
            <span className="flex items-center gap-1.5 text-sm font-mono" style={{ color: COLORS.textMuted }}><MapPin size={14} />{ride.distanceKm ? `${ride.distanceKm} km` : '— km'}</span>
          </div>

          <button
            onClick={() => openProfile(ride.hostId, { view: 'detail', rideId: ride.id })}
            className="w-full flex items-center justify-between glass-card rounded-xl p-3 mb-4"
            style={{ transition: 'transform 0.15s ease' }}
          >
            <div className="flex items-center gap-3">
              <Avatar person={host} size={38} glow />
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{ride.hostId === 'me' ? 'You' : host.name}</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted }}>Hosting this ride</p>
              </div>
            </div>
            <ChevronRight size={16} color={COLORS.textFaint} />
          </button>

          <p className="uppercase mb-2" style={{ fontSize: 11, letterSpacing: '0.05em', color: COLORS.textFaint }}>Riders ({ride.currentRiders.length}/{ride.maxRiders})</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ride.currentRiders.map((id) => {
              const rider = getRider(id);
              const isRideHost = id === ride.hostId;
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 pr-2.5 pl-1 py-1 rounded-full border"
                  style={{ backgroundColor: isRideHost ? `${COLORS.amber}18` : COLORS.surfaceRaised, borderColor: isRideHost ? `${COLORS.amber}44` : COLORS.border }}
                >
                  <button onClick={() => openProfile(id, { view: 'detail', rideId: ride.id })} className="flex items-center gap-1.5">
                    <Avatar person={rider} size={22} glow={isRideHost} />
                    <span className="text-xs font-medium" style={{ color: isRideHost ? COLORS.amber : COLORS.textPrimary }}>
                      {id === 'me' ? 'You' : rider.name.split(' ')[0]}
                    </span>
                    {isRideHost && (
                      <span className="font-mono px-1 rounded text-2xs font-semibold" style={{ backgroundColor: `${COLORS.amber}25`, color: COLORS.amber, fontSize: 9 }}>👑 HOST</span>
                    )}
                  </button>
                  {isHost && !isRideHost && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeRider(ride.id, id); }}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/20 text-red-400"
                      title={`Remove ${rider.name}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isHost ? (
            <div className="flex gap-2 mb-5">
              <div className="flex-1 text-center py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5" style={{ backgroundColor: `${COLORS.amber}15`, color: COLORS.amber, border: `1px solid ${COLORS.amber}33` }}>
                ⭐ You're Hosting This Ride
              </div>
              <button
                onClick={() => setShowCancelConfirmModal(true)}
                className="px-4 py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/20"
                style={{ backgroundColor: `${COLORS.hardcoreRed}15`, color: COLORS.hardcoreRed, border: `1px solid ${COLORS.hardcoreRed}44`, transition: 'all 0.2s ease' }}
              >
                <X size={15} /> Cancel Ride
              </button>
            </div>
          ) : (
            <button
              onClick={() => toggleJoin(ride.id)}
              disabled={isFull && !isMember}
              className="w-full py-3 rounded-full font-semibold mb-5 hover:brightness-110"
              style={{
                backgroundColor: isMember ? 'transparent' : isFull ? COLORS.surfaceRaised : COLORS.amber,
                color: isMember ? COLORS.amber : isFull ? COLORS.textFaint : COLORS.bg,
                border: isMember ? `1px solid ${COLORS.amber}` : '1px solid transparent',
                cursor: isFull && !isMember ? 'not-allowed' : 'pointer',
              }}
            >
              {isMember ? 'Leave ride' : isFull ? 'Ride full' : 'Join ride'}
            </button>
          )}

          <div className="flex mb-4" style={{ borderBottom: `1px solid ${COLORS.border}44` }}>
            {['overview', 'photos', 'chat', 'reviews'].map((tab) => {
              const photoCount = ride.photos ? ride.photos.length : 0;
              return (
                <button
                  key={tab} onClick={() => setDetailTab(tab)}
                  className="flex-1 py-2.5 text-sm font-medium capitalize relative flex items-center justify-center gap-1"
                  style={{ color: detailTab === tab ? COLORS.amber : COLORS.textMuted, transition: 'color 0.2s ease' }}
                >
                  {tab}
                  {tab === 'photos' && photoCount > 0 && (
                    <span className="font-mono px-1.5 py-0.2 rounded-full" style={{ fontSize: 9, backgroundColor: `${COLORS.amber}22`, color: COLORS.amber }}>
                      {photoCount}
                    </span>
                  )}
                  {detailTab === tab && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2,
                      backgroundColor: COLORS.amber, borderRadius: 2,
                      boxShadow: `0 0 6px ${COLORS.amber}60`,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-4">
          {detailTab === 'overview' && (
            <div>
              <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>{ride.description || 'No description yet.'}</p>
              {/* Route map section */}
              <div className="mt-5">
                <p
                  className="uppercase mb-3"
                  style={{ fontSize: 11, letterSpacing: '0.05em', color: COLORS.textFaint }}
                >
                  Route Map
                </p>
                <RouteMap ride={ride} colors={COLORS} theme={theme} />
              </div>
            </div>
          )}

          {detailTab === 'photos' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>Ride Gallery</h4>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    {ride.photos && ride.photos.length > 0 ? `${ride.photos.length} photo${ride.photos.length > 1 ? 's' : ''} shared` : 'Share photos from this ride'}
                  </p>
                </div>
                {(isMember || isHost) ? (
                  <button
                    onClick={() => {
                      if (currentUser === 'guest') { setShowGuestNotice(true); return; }
                      setShowUploadPhotoModal(true);
                    }}
                    className="premium-btn px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                    style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
                  >
                    <Camera size={14} /> Upload Photo
                  </button>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ backgroundColor: `${COLORS.surfaceRaised}`, borderColor: COLORS.border, color: COLORS.textMuted }}>
                    🔒 Join ride to post
                  </span>
                )}
              </div>

              {!isMember && !isHost && (
                <div className="mb-4 p-3 rounded-xl border flex items-center gap-2" style={{ backgroundColor: `${COLORS.amber}10`, borderColor: `${COLORS.amber}33` }}>
                  <Users size={16} color={COLORS.amber} className="flex-shrink-0" />
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>
                    Only confirmed ride participants and the host can upload photos. <strong style={{ color: COLORS.amber }}>Join this ride</strong> to contribute to the photo gallery!
                  </p>
                </div>
              )}

              {(!ride.photos || ride.photos.length === 0) ? (
                <div className="glass-card rounded-2xl p-8 text-center flex flex-col items-center justify-center border" style={{ borderColor: COLORS.border }}>
                  <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.amber}15`, color: COLORS.amber }}>
                    <Image size={24} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: COLORS.textPrimary }}>No photos shared yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: COLORS.textMuted }}>
                    Have you taken scenic stops or group shots on this ride? Be the first to add to the gallery!
                  </p>
                  {(isMember || isHost) && (
                    <button
                      onClick={() => {
                        if (currentUser === 'guest') { setShowGuestNotice(true); return; }
                        setShowUploadPhotoModal(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      style={{ backgroundColor: `${COLORS.amber}20`, color: COLORS.amber, border: `1px solid ${COLORS.amber}44` }}
                    >
                      <Camera size={14} /> Add First Photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {ride.photos.map((p) => {
                    const uploader = getRider(p.uploaderId);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPhotoLightbox({ photo: p, rideId: ride.id })}
                        className="group relative cursor-pointer overflow-hidden rounded-xl glass-card border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                        style={{ aspectRatio: '4/3', borderColor: COLORS.border }}
                      >
                        <img src={p.photoUrl} alt={p.caption || 'Ride photo'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Avatar person={uploader} size={18} />
                            <span className="truncate text-2xs font-medium text-gray-200">{p.uploaderId === 'me' ? 'You' : uploader.name.split(' ')[0]}</span>
                          </div>
                          {p.caption && (
                            <span className="text-2xs bg-black/60 px-1.5 py-0.5 rounded text-amber-300 truncate max-w-[50%]">
                              {p.caption}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {detailTab === 'chat' && (
            <div>
              {ride.chat.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>No messages yet — say hey to the group.</p>
                </div>
              ) : ride.chat.map((msg, i) => {
                const sender = getRider(msg.riderId);
                const isMe = msg.riderId === 'me';
                const isSenderHost = msg.riderId === ride.hostId;
                return (
                  <div key={i} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && <Avatar person={sender} size={26} glow={isSenderHost} />}
                    <div className="mx-2" style={{ maxWidth: '72%' }}>
                      <div
                        className="rounded-2xl px-3 py-2"
                        style={{ backgroundColor: isMe ? `${COLORS.amber}1F` : COLORS.surfaceRaised, border: isMe ? `1px solid ${COLORS.amber}55` : `1px solid ${COLORS.border}` }}
                      >
                        {!isMe && (
                          <p className="font-semibold mb-0.5 flex items-center gap-1" style={{ fontSize: 12, color: COLORS.textMuted }}>
                            {sender.name.split(' ')[0]}
                            {isSenderHost && (
                              <span className="font-mono px-1 rounded text-2xs font-semibold" style={{ backgroundColor: `${COLORS.amber}25`, color: COLORS.amber, fontSize: 9 }}>👑 HOST</span>
                            )}
                          </p>
                        )}
                        <p className="text-sm" style={{ color: COLORS.textPrimary }}>{msg.text}</p>
                      </div>
                      <p className="mt-1" style={{ fontSize: 10, color: COLORS.textFaint, textAlign: isMe ? 'right' : 'left' }}>{msg.time}</p>
                    </div>
                    {isMe && <Avatar person={sender} size={26} glow={isSenderHost} />}
                  </div>
                );
              })}
              {(isMember || isHost) ? (
                <div className="flex items-center gap-2 mt-3">
                  <input
                    value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendChat(ride.id); }}
                    placeholder="Say something to the group"
                    className={inputClass} style={{ ...inputStyle, borderRadius: '9999px' }}
                  />
                  <button onClick={() => sendChat(ride.id)} className="rounded-full p-2.5 hover:brightness-110 flex-shrink-0" style={{ backgroundColor: COLORS.amber }}>
                    <Send size={16} color={COLORS.bg} />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-center mt-2" style={{ color: COLORS.textFaint }}>Join the ride to chat with the group.</p>
              )}
            </div>
          )}

          {detailTab === 'reviews' && (
            <div>
              {ride.status !== 'completed' ? (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: COLORS.textMuted }}>Reviews unlock once the ride wraps up.</p>
                </div>
              ) : (
                <>
                  {ride.reviews.length === 0 && (
                    <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>No reviews yet.</p>
                  )}
                  {ride.reviews.map((rev, i) => {
                    const reviewer = getRider(rev.riderId);
                    return (
                      <div key={i} className="rounded-xl p-3 mb-3" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Avatar person={reviewer} size={24} />
                            <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{rev.riderId === 'me' ? 'You' : reviewer.name.split(' ')[0]}</span>
                          </div>
                          <StarDisplay value={rev.rating} />
                        </div>
                        <p className="text-sm" style={{ color: COLORS.textMuted }}>{rev.comment}</p>
                      </div>
                    );
                  })}
                  {(isMember || isHost) && !myReview && (
                    <div className="rounded-xl p-3 mt-2" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                      <p className="uppercase mb-2" style={{ fontSize: 11, letterSpacing: '0.05em', color: COLORS.textFaint }}>Leave a review</p>
                      <div className="mb-3"><StarSelector value={reviewStars} onChange={setReviewStars} /></div>
                      <textarea
                        value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                        placeholder="How was the ride?" rows={3}
                        className={inputClass} style={inputStyle}
                      />
                      <button
                        onClick={() => submitReview(ride.id)}
                        className="mt-2 px-4 py-2 rounded-full text-sm font-semibold hover:brightness-110"
                        style={{ backgroundColor: reviewText.trim() ? COLORS.amber : COLORS.surfaceRaised, color: reviewText.trim() ? COLORS.bg : COLORS.textFaint, cursor: reviewText.trim() ? 'pointer' : 'not-allowed' }}
                      >
                        Post review
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }


  function renderCreate() {
    if (currentUser === 'guest') {
      return (
        <div className="p-8 text-center animate-blur-in flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${COLORS.amber}22`, color: COLORS.amber }}>
            <User size={24} />
          </div>
          <h3 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: COLORS.textPrimary }}>Registered Rider Required</h3>
          <p className="text-xs my-3 leading-relaxed" style={{ color: COLORS.textMuted, maxWidth: 300 }}>
            Guest users can browse rides, routes, and reviews. To host a group ride, please connect with a registered rider profile.
          </p>
          <button
            onClick={() => { setCurrentUser('me'); }}
            className="px-6 py-2.5 rounded-full text-xs font-semibold hover:brightness-110 mt-2"
            style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
          >
            Connect as Arjun
          </button>
        </div>
      );
    }

    const f = createForm;
    const todayStr = new Date().toISOString().split('T')[0];
    const canSubmit = f.title.trim() && f.start.trim() && f.end.trim() && f.date && f.time && f.date >= todayStr;
    const completedRequiredCount = [f.title.trim(), f.start.trim(), f.end.trim(), f.date && f.date >= todayStr, f.time].filter(Boolean).length;

    return (
      <div className="px-4 pt-4 pb-6">
        {/* Mandatory Fields Indicator Banner */}
        <div
          className="mb-4 p-2.5 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: `${COLORS.amber}0d`,
            borderColor: `${COLORS.amber}28`,
          }}
        >
          <span className="text-xs" style={{ color: COLORS.textMuted }}>
            Fields marked with <strong style={{ color: COLORS.hardcoreRed }}>*</strong> are required to host
          </span>
          <span
            className="font-mono text-2xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: canSubmit ? `${COLORS.moss}22` : `${COLORS.amber}22`,
              color: canSubmit ? COLORS.moss : COLORS.amber,
            }}
          >
            {completedRequiredCount}/5 required
          </span>
        </div>

        <div className="mb-4">
          <Label>
            Ride title <span style={{ color: COLORS.hardcoreRed, fontWeight: 'bold' }}>*</span>
          </Label>
          <input value={f.title} onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))} placeholder="e.g. ECR Sunrise Run" className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Starting point <span style={{ color: COLORS.hardcoreRed, fontWeight: 'bold' }}>*</span>
              </Label>
              <button
                type="button"
                onClick={() => { setMapPickerTarget('start'); setShowMapPicker(true); }}
                className="text-2xs font-mono flex items-center gap-0.5 hover:underline"
                style={{ color: COLORS.moss, fontSize: 10 }}
              >
                <MapPin size={10} /> Map
              </button>
            </div>
            <div className="relative">
              <input
                value={f.start}
                onChange={(e) => setCreateForm((s) => ({ ...s, start: e.target.value }))}
                placeholder="Chennai"
                className={inputClass}
                style={{ ...inputStyle, paddingRight: 32 }}
              />
              <button
                type="button"
                onClick={() => { setMapPickerTarget('start'); setShowMapPicker(true); }}
                className="absolute right-2 top-2.5 hover:brightness-125"
                style={{ color: COLORS.moss }}
                title="Select Starting Point on Google Map"
              >
                <MapPin size={15} />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>
                Destination <span style={{ color: COLORS.hardcoreRed, fontWeight: 'bold' }}>*</span>
              </Label>
              <button
                type="button"
                onClick={() => { setMapPickerTarget('end'); setShowMapPicker(true); }}
                className="text-2xs font-mono flex items-center gap-0.5 hover:underline"
                style={{ color: COLORS.hardcoreRed, fontSize: 10 }}
              >
                <MapPin size={10} /> Map
              </button>
            </div>
            <div className="relative">
              <input
                value={f.end}
                onChange={(e) => setCreateForm((s) => ({ ...s, end: e.target.value }))}
                placeholder="Pondicherry"
                className={inputClass}
                style={{ ...inputStyle, paddingRight: 32 }}
              />
              <button
                type="button"
                onClick={() => { setMapPickerTarget('end'); setShowMapPicker(true); }}
                className="absolute right-2 top-2.5 hover:brightness-125"
                style={{ color: COLORS.hardcoreRed }}
                title="Select Destination on Google Map"
              >
                <MapPin size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Map Selection Button */}
        <button
          type="button"
          onClick={() => { setMapPickerTarget(f.start ? 'end' : 'start'); setShowMapPicker(true); }}
          className="w-full py-2 px-3 mb-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:brightness-110"
          style={{
            backgroundColor: `${COLORS.amber}12`,
            borderColor: `${COLORS.amber}33`,
            color: COLORS.amber,
          }}
        >
          <MapPin size={14} />
          {f.start && f.end ? 'Change Route on Google Map' : 'Select Start & Destination on Google Map'}
        </button>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <Label>Stops (optional, within S and D)</Label>
            <button
              type="button"
              onClick={() => { setMapPickerTarget('add_stop'); setShowMapPicker(true); }}
              className="text-2xs font-mono flex items-center gap-0.5 hover:underline"
              style={{ color: COLORS.amber, fontSize: 10 }}
            >
              <MapPin size={10} /> Add on Map
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={stopInput} onChange={(e) => setStopInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStop(); } }}
              placeholder="Add a stop along the way" className={inputClass} style={inputStyle}
            />
            <button type="button" onClick={addStop} className="rounded-lg px-3 flex items-center justify-center hover:brightness-110 flex-shrink-0" style={{ backgroundColor: COLORS.surfaceRaised, border: `1px solid ${COLORS.border}` }}>
              <Plus size={18} color={COLORS.textPrimary} />
            </button>
            <button
              type="button"
              onClick={() => { setMapPickerTarget('add_stop'); setShowMapPicker(true); }}
              className="rounded-lg px-3 flex items-center justify-center hover:brightness-110 flex-shrink-0"
              style={{ backgroundColor: `${COLORS.amber}18`, border: `1px solid ${COLORS.amber}44`, color: COLORS.amber }}
              title="Add intermediate stop on Google Map"
            >
              <MapPin size={16} />
            </button>
          </div>
          {f.stops.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2.5">
              {f.stops.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border animate-fadein"
                  style={{
                    backgroundColor: `${COLORS.surfaceRaised}aa`,
                    borderColor: `${COLORS.border}88`,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-2xs flex-shrink-0"
                      style={{
                        backgroundColor: `${COLORS.amber}22`,
                        color: COLORS.amber,
                        border: `1px solid ${COLORS.amber}44`,
                      }}
                    >
                      #{i + 1}
                    </span>
                    <span className="text-xs font-medium truncate" style={{ color: COLORS.textPrimary }} title={s}>
                      {s}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStop(i)}
                    className="p-1 rounded-md text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                    title={`Remove stop ${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {f.start.trim() && f.end.trim() && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
            <p className="uppercase mb-2" style={{ fontSize: 10, letterSpacing: '0.05em', color: COLORS.textFaint }}>Route preview</p>
            <RouteStrip points={[f.start, ...f.stops, f.end]} color={DIFFICULTY[f.difficulty].color} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <Label>
              Date <span style={{ color: COLORS.hardcoreRed, fontWeight: 'bold' }}>*</span>
            </Label>
            <input type="date" min={todayStr} value={f.date} onChange={(e) => setCreateForm((s) => ({ ...s, date: e.target.value }))} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <Label>
              Time <span style={{ color: COLORS.hardcoreRed, fontWeight: 'bold' }}>*</span>
            </Label>
            <input type="time" value={f.time} onChange={(e) => setCreateForm((s) => ({ ...s, time: e.target.value }))} className={inputClass} style={inputStyle} />
          </div>
        </div>


        <div className="mb-4">
          <Label>Distance (km, optional)</Label>
          <input type="number" value={f.distanceKm} onChange={(e) => setCreateForm((s) => ({ ...s, distanceKm: e.target.value }))} placeholder="160" className={inputClass} style={inputStyle} />
        </div>

        <div className="mb-4">
          <Label>Difficulty</Label>
          <div className="flex gap-2">
            {Object.keys(DIFFICULTY).map((key) => {
              const active = f.difficulty === key;
              return (
                <button
                  key={key} type="button" onClick={() => setCreateForm((s) => ({ ...s, difficulty: key }))}
                  className="flex-1 py-2 rounded-lg text-sm font-medium capitalize hover:brightness-110"
                  style={{ backgroundColor: active ? DIFFICULTY[key].color : COLORS.surface, color: active ? COLORS.bg : COLORS.textMuted, border: `1px solid ${active ? 'transparent' : COLORS.border}` }}
                >
                  {DIFFICULTY[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <Label>Max riders</Label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setCreateForm((s) => ({ ...s, maxRiders: Math.max(2, s.maxRiders - 1) }))} className="rounded-full p-2 hover:brightness-110" style={{ backgroundColor: COLORS.surfaceRaised }}>
              <Minus size={16} color={COLORS.textPrimary} />
            </button>
            <span className="font-mono text-lg w-6 text-center" style={{ color: COLORS.textPrimary }}>{f.maxRiders}</span>
            <button type="button" onClick={() => setCreateForm((s) => ({ ...s, maxRiders: Math.min(30, s.maxRiders + 1) }))} className="rounded-full p-2 hover:brightness-110" style={{ backgroundColor: COLORS.surfaceRaised }}>
              <Plus size={16} color={COLORS.textPrimary} />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <Label>Description</Label>
          <textarea
            value={f.description} onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))}
            placeholder="Meeting point, pace, what riders should bring..." rows={4}
            className={inputClass} style={inputStyle}
          />
        </div>

        <button
          onClick={submitCreate}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-full font-semibold text-sm ${canSubmit ? 'premium-btn' : ''}`}
          style={{
            backgroundColor: canSubmit ? COLORS.amber : COLORS.surfaceRaised,
            color: canSubmit ? COLORS.bg : COLORS.textFaint,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? `0 4px 20px ${COLORS.amber}40` : 'none',
            transition: 'all 0.25s ease',
            letterSpacing: '0.02em',
          }}
        >
          🏍️ Host this ride
        </button>

        {!canSubmit && (
          <p className="text-center text-xs mt-2" style={{ color: COLORS.textFaint }}>
            {!f.title.trim()
              ? 'Required: Add a ride title'
              : !f.start.trim() || !f.end.trim()
              ? 'Required: Set Starting point and Destination'
              : !f.date
              ? 'Required: Set a ride date'
              : f.date < todayStr
              ? 'Ride date cannot be in the past'
              : !f.time
              ? 'Required: Set a ride start time'
              : ''}
          </p>
        )}
      </div>
    );
  }

  function renderGarage() {
    if (showMyAccount && selectedProfileId === 'me') {
      return (
        <MyAccount
          onClose={() => {
            setShowMyAccount(false);
            fetchRidesAndRiders();
          }}
          onProfileUpdated={fetchRidesAndRiders}
          theme={theme}
        />

      );
    }

    const profile = getRider(selectedProfileId);
    const hostedRides = rides.filter((r) => r.hostId === profile.id);
    const joinedRides = rides.filter((r) => r.currentRiders.includes(profile.id) && r.hostId !== profile.id);
    const receivedReviews = hostedRides.flatMap((r) => r.reviews.map((rev) => ({ ...rev, rideTitle: r.title })));
    const avgRating = receivedReviews.length ? (receivedReviews.reduce((s, r) => s + r.rating, 0) / receivedReviews.length).toFixed(1) : null;

    return (
      <div>
        <div className="flex flex-col items-center pt-6 pb-4 px-4 text-center">
          <Avatar person={profile} size={72} glow />
          <h2 className="mt-3" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 21, color: COLORS.textPrimary }}>{profile.id === 'me' ? 'You' : profile.name}</h2>
          <p className="text-sm mt-1" style={{ color: COLORS.textMuted, maxWidth: 280 }}>{profile.bio}</p>
          
          {selectedProfileId === 'me' && (
            <button
              onClick={() => setShowMyAccount(true)}
              className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:brightness-110"
              style={{ backgroundColor: COLORS.surfaceRaised, color: COLORS.amber, border: `1px solid ${COLORS.amber}55` }}
            >
              <Settings size={14} /> MyAccount Settings
            </button>
          )}

          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {[...new Set(profile.badges)].map((b, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ fontSize: 11, backgroundColor: `${COLORS.amber}18`, color: COLORS.amber, border: `1px solid ${COLORS.amber}44` }}>
                  <Award size={12} />{b}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 mb-5">
          <StatBlock label="Hosted" value={hostedRides.length} />
          <StatBlock label="Joined" value={joinedRides.length} />
          <StatBlock label="Rating" value={avgRating ? `★ ${avgRating}` : '—'} />
        </div>


        <div className="flex border-b mb-4 px-4" style={{ borderColor: COLORS.border }}>
          {['hosted', 'joined', 'reviews'].map((tab) => (
            <button
              key={tab} onClick={() => setGarageTab(tab)}
              className="flex-1 py-2 text-sm font-medium capitalize"
              style={{ color: garageTab === tab ? COLORS.amber : COLORS.textMuted, borderBottom: garageTab === tab ? `2px solid ${COLORS.amber}` : '2px solid transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          {garageTab === 'hosted' && (hostedRides.length === 0
            ? <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>No rides hosted yet.</p>
            : hostedRides.map(renderRideCard))}
          {garageTab === 'joined' && (joinedRides.length === 0
            ? <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>No rides joined yet.</p>
            : joinedRides.map(renderRideCard))}
          {garageTab === 'reviews' && (receivedReviews.length === 0
            ? <p className="text-sm text-center py-8" style={{ color: COLORS.textMuted }}>No reviews yet — host a ride to start earning them.</p>
            : receivedReviews.map((rev, i) => {
              const reviewer = getRider(rev.riderId);
              return (
                <div key={i} className="rounded-xl p-3 mb-3" style={{ backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar person={reviewer} size={24} />
                      <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>{rev.riderId === 'me' ? 'You' : reviewer.name.split(' ')[0]}</span>
                    </div>
                    <StarDisplay value={rev.rating} />
                  </div>
                  <p className="text-sm mb-1" style={{ color: COLORS.textMuted }}>{rev.comment}</p>
                  <p style={{ fontSize: 11, color: COLORS.textFaint }}>on {rev.rideTitle}</p>
                </div>
              );
            }))}
        </div>
      </div>
    );
  }

  const showBack = view !== 'feed' && !(view === 'garage' && selectedProfileId === 'me' && !cameFrom);
  let headerTitle = '';
  if (view === 'detail') headerTitle = rides.find((r) => r.id === selectedRideId)?.title || '';
  else if (view === 'create') headerTitle = 'Host a ride';
  else if (view === 'garage') { const p = getRider(selectedProfileId); headerTitle = selectedProfileId === 'me' ? 'Your garage' : `${p.name.split(' ')[0]}'s garage`; }

  const activeNav = view === 'detail' ? 'feed' : view;

  return (
    <ThemeContext.Provider value={{ theme, colors: COLORS, difficulty: DIFFICULTY }}>
      <div style={{ height: '100vh', backgroundColor: COLORS.bg, display: 'flex', justifyContent: 'center' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        button, [role="button"], a, input[type="submit"], input[type="button"], input[type="checkbox"], select, option, label, .cursor-pointer { cursor: pointer !important; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        input::placeholder, textarea::placeholder { color: ${COLORS.textFaint}; }
        input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(${theme === 'night' ? '0.6' : '0.3'}); cursor: pointer; }

        .glass-card {
          background: ${theme === 'night' ? 'rgba(30, 33, 38, 0.65)' : 'rgba(255, 255, 255, 0.55)'} !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${theme === 'night' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important;
        }
        .glass-nav {
          background: ${theme === 'night' ? 'rgba(21, 23, 27, 0.75)' : 'rgba(245, 244, 239, 0.8)'} !important;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid ${theme === 'night' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} !important;
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: 460, height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.bg, position: 'relative' }}>

        {/* ── Premium Top Bar ── */}
        <div
          className="glass-nav flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ fontSize: 11, borderBottom: `1px solid ${COLORS.border}44` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="animate-dot-pulse"
              style={{
                width: 7, height: 7, borderRadius: '50%',
                backgroundColor: currentUser === 'guest' ? COLORS.rust : COLORS.moss,
                boxShadow: `0 0 6px ${currentUser === 'guest' ? COLORS.rust : COLORS.moss}80`,
              }}
            />
            <span style={{ color: COLORS.textMuted }}>
              <strong style={{ color: COLORS.textPrimary }}>{currentUser === 'guest' ? 'Guest' : 'Arjun'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${COLORS.amber}12`,
                color: COLORS.amber,
                border: `1px solid ${COLORS.amber}25`,
                transition: 'all 0.2s ease',
              }}
              title={theme === 'night' ? 'Switch to Day Theme' : 'Switch to Night Theme'}
            >
              {theme === 'night' ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button
              onClick={() => setCurrentUser(currentUser === 'guest' ? 'me' : 'guest')}
              className="px-3 py-1 rounded-full font-medium"
              style={{
                fontSize: 11,
                backgroundColor: `${COLORS.amber}12`,
                color: COLORS.amber,
                border: `1px solid ${COLORS.amber}25`,
                transition: 'all 0.2s ease',
              }}
            >
              {currentUser === 'guest' ? 'Log in' : 'Guest mode'}
            </button>
          </div>
        </div>

        {/* Guest Notice Modal */}
        {showGuestNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="glass-card w-full max-w-sm p-6 rounded-2xl text-center animate-blur-in" style={{ borderColor: `${COLORS.amber}44` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${COLORS.amber}15`, color: COLORS.amber, boxShadow: `0 0 20px ${COLORS.amber}20` }}>
                <User size={22} />
              </div>
              <h3 className="font-semibold mb-1.5" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 19, color: COLORS.textPrimary }}>Registered Rider Required</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: COLORS.textMuted }}>
                Guest users can browse rides, routes, and reviews. To join or host a ride, connect with a rider profile.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGuestNotice(false)}
                  className="flex-1 py-2.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: COLORS.surfaceRaised, border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, transition: 'all 0.2s ease' }}
                >
                  Browse
                </button>
                <button
                  onClick={() => { setCurrentUser('me'); setShowGuestNotice(false); }}
                  className="premium-btn flex-1 py-2.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: COLORS.amber, color: COLORS.bg }}
                >
                  Connect as Arjun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Photo Modal */}
        {showUploadPhotoModal && selectedRideId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="glass-card w-full max-w-sm p-5 rounded-2xl animate-blur-in" style={{ borderColor: `${COLORS.amber}44` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${COLORS.amber}15`, color: COLORS.amber }}>
                    <Camera size={18} />
                  </div>
                  <h3 className="font-semibold" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, color: COLORS.textPrimary }}>Upload Ride Photo</h3>
                </div>
                <button
                  onClick={() => { setShowUploadPhotoModal(false); setUploadPhotoPreview(''); setUploadCaption(''); }}
                  className="p-1 rounded-full hover:brightness-125" style={{ color: COLORS.textMuted }}
                >
                  <X size={18} />
                </button>
              </div>

              {!uploadPhotoPreview ? (
                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-amber-400" style={{ borderColor: `${COLORS.border}aa`, backgroundColor: `${COLORS.surfaceRaised}55` }}>
                  <Upload size={32} color={COLORS.amber} className="mb-2" />
                  <p className="text-xs font-semibold" style={{ color: COLORS.textPrimary }}>Select an image file</p>
                  <p className="text-2xs mt-1" style={{ color: COLORS.textMuted }}>PNG, JPG or WEBP (Max 10MB)</p>
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border" style={{ maxHeight: 200, borderColor: COLORS.border }}>
                    <img src={uploadPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setUploadPhotoPreview('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div>
                    <Label>Caption (Optional)</Label>
                    <input
                      type="text"
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="e.g. Scenic coffee stop along ECR"
                      className={inputClass}
                      style={inputStyle}
                      maxLength={100}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => { setShowUploadPhotoModal(false); setUploadPhotoPreview(''); setUploadCaption(''); }}
                  className="flex-1 py-2.5 rounded-full text-xs font-medium border"
                  style={{ backgroundColor: COLORS.surfaceRaised, borderColor: COLORS.border, color: COLORS.textMuted }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => uploadPhoto(selectedRideId)}
                  disabled={!uploadPhotoPreview || isUploadingPhoto}
                  className={`flex-1 py-2.5 rounded-full text-xs font-semibold ${uploadPhotoPreview && !isUploadingPhoto ? 'premium-btn' : ''}`}
                  style={{
                    backgroundColor: uploadPhotoPreview ? COLORS.amber : COLORS.surfaceRaised,
                    color: uploadPhotoPreview ? COLORS.bg : COLORS.textFaint,
                    cursor: uploadPhotoPreview && !isUploadingPhoto ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isUploadingPhoto ? 'Uploading...' : 'Post Photo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Photo Lightbox Modal */}
        {selectedPhotoLightbox && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 animate-blur-in"
            style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            {/* Top Bar */}
            <div className="w-full max-w-lg flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const uploader = getRider(selectedPhotoLightbox.photo.uploaderId);
                  return (
                    <>
                      <Avatar person={uploader} size={28} glow />
                      <div>
                        <p className="text-xs font-semibold text-white">{uploader.name}</p>
                        <p style={{ fontSize: 10, color: COLORS.textMuted }}>{selectedPhotoLightbox.photo.time || 'Shared on ride'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const currentRide = rides.find((r) => r.id === selectedPhotoLightbox.rideId);
                  const isHost = currentRide && currentRide.hostId === currentUser;
                  const isUploader = selectedPhotoLightbox.photo.uploaderId === currentUser;
                  if (isHost || isUploader) {
                    return (
                      <button
                        onClick={() => deletePhoto(selectedPhotoLightbox.rideId, selectedPhotoLightbox.photo.id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/30"
                        title="Delete photo"
                      >
                        <Trash2 size={16} />
                      </button>
                    );
                  }
                  return null;
                })()}
                <button
                  onClick={() => setSelectedPhotoLightbox(null)}
                  className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center w-full max-w-lg my-auto p-2">
              <img
                src={selectedPhotoLightbox.photo.photoUrl}
                alt={selectedPhotoLightbox.photo.caption || 'Ride photo'}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
            </div>

            {/* Caption & Bottom Details */}
            <div className="w-full max-w-lg pb-6 px-3 text-center">
              {selectedPhotoLightbox.photo.caption ? (
                <p className="text-sm font-medium text-amber-300 bg-amber-950/40 border border-amber-500/30 py-2 px-4 rounded-xl inline-block">
                  "{selectedPhotoLightbox.photo.caption}"
                </p>
              ) : (
                <p className="text-xs text-gray-400">Motorcycle Group Ride Memory</p>
              )}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirmModal && selectedRideId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <div className="glass-card w-full max-w-sm p-6 rounded-2xl text-center animate-blur-in" style={{ borderColor: `${COLORS.hardcoreRed}55` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${COLORS.hardcoreRed}20`, color: COLORS.hardcoreRed, boxShadow: `0 0 20px ${COLORS.hardcoreRed}30` }}>
                <X size={24} />
              </div>
              <h3 className="font-semibold mb-1.5" style={{ fontFamily: 'Oswald, sans-serif', fontSize: 19, color: COLORS.textPrimary }}>Cancel Group Ride?</h3>
              <p className="text-xs mb-5 leading-relaxed" style={{ color: COLORS.textMuted }}>
                Are you sure you want to cancel this ride? This action cannot be undone and the ride will be removed for all participants.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-full text-xs font-medium border"
                  style={{ backgroundColor: COLORS.surfaceRaised, borderColor: COLORS.border, color: COLORS.textMuted }}
                >
                  Keep Ride
                </button>
                <button
                  onClick={() => cancelRide(selectedRideId)}
                  className="flex-1 py-2.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: COLORS.hardcoreRed, color: '#FFFFFF', boxShadow: `0 4px 16px ${COLORS.hardcoreRed}40` }}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Location Picker Modal */}
        {showMapPicker && (
          <MapLocationPicker
            initialStart={createForm.start}
            initialEnd={createForm.end}
            initialStops={createForm.stops}
            initialDistanceKm={createForm.distanceKm}
            initialTarget={mapPickerTarget}
            theme={theme}
            colors={COLORS}
            onSelectRoute={({ start, end, stops, distanceKm }) => {
              setCreateForm((s) => ({
                ...s,
                start: start || s.start,
                end: end || s.end,
                stops: stops !== undefined ? stops : s.stops,
                distanceKm: distanceKm ? String(distanceKm) : s.distanceKm,
              }));
            }}
            onClose={() => setShowMapPicker(false)}
          />
        )}

        {/* Page Header */}
        {showBack || view !== 'feed' ? (
          <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${COLORS.border}44` }}>
            {showBack && (
              <button onClick={goBack} className="p-1 -ml-1 rounded-full hover:brightness-110" style={{ transition: 'transform 0.15s ease' }}>
                <ArrowLeft size={20} color={COLORS.textPrimary} />
              </button>
            )}
            <h2 className="truncate" style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 17, color: COLORS.textPrimary, letterSpacing: '0.02em' }}>{headerTitle}</h2>
          </div>
        ) : null}

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="pb-20">
          <div key={`${view}-${selectedRideId || ''}-${selectedProfileId}`} className={isExiting ? "animate-blur-out" : "animate-blur-in"}>
            {view === 'feed' && renderFeed()}
            {view === 'detail' && renderDetail()}
            {view === 'create' && renderCreate()}
            {view === 'garage' && renderGarage()}
          </div>
        </div>

        {/* ── Floating Glass Bottom Nav ── */}
        <div
          className="glass-nav absolute bottom-0 left-0 right-0 flex items-center justify-around py-2.5"
          style={{ borderTop: `1px solid ${COLORS.border}33`, borderRadius: '20px 20px 0 0' }}
        >
          {[
            { key: 'feed', icon: Compass, label: 'Rides' },
            { key: 'create', icon: PlusCircle, label: 'Host' },
            { key: 'garage', icon: User, label: 'Garage' },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === activeNav && view !== 'detail') return;
                  if (item.key === 'create' && currentUser === 'guest') {
                    setShowGuestNotice(true);
                    return;
                  }
                  navigateWithBlur(() => {
                    if (item.key === 'feed') setView('feed');
                    else if (item.key === 'create') setView('create');
                    else openProfile('me');
                  });
                }}
                className="flex flex-col items-center gap-1 px-5 py-1 relative"
                style={{ transition: 'transform 0.15s ease' }}
              >
                <Icon size={21} color={active ? COLORS.amber : COLORS.textFaint} style={{ transition: 'color 0.2s ease', transform: active ? 'scale(1.1)' : 'scale(1)' }} />
                <span style={{ fontSize: 9, color: active ? COLORS.amber : COLORS.textFaint, fontWeight: active ? 600 : 400, transition: 'all 0.2s ease', letterSpacing: '0.03em' }}>{item.label}</span>
                {active && (
                  <span style={{
                    position: 'absolute', bottom: -2, width: 4, height: 4, borderRadius: '50%',
                    backgroundColor: COLORS.amber,
                    boxShadow: `0 0 8px ${COLORS.amber}80`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </ThemeContext.Provider>
  );
}