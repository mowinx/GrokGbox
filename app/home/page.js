'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function HomeApp() {
  const router = useRouter();
  const [tab, setTab] = useState('home');
  const [eventSub, setEventSub] = useState('general');
  const [screen, setScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [attending, setAttending] = useState([]);
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [referrals, setReferrals] = useState(0);
  const [giftStats, setGiftStats] = useState({ anon: 0, named: 0 });
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [cashByEvent, setCashByEvent] = useState([]);
  const [bank, setBank] = useState({ bank_name: '', account_name: '', account_number: '' });
  const [notif, setNotif] = useState({ gifts: true, live: true, raffles: true, promos: false });
  const [privacy, setPrivacy] = useState({ defaultAnon: false, showBday: true, discoverable: true });
  const [eventForm, setEventForm] = useState({ type: 'birthday', title: '', date: '', time: '', locType: 'physical', location: '', desc: '', isPublic: true });
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [myLikes, setMyLikes] = useState({});
  const [uploadPreview, setUploadPreview] = useState(null);
  const [cart, setCart] = useState([]);
  const [anon, setAnon] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [feed, setFeed] = useState([]);
  const feedBase = useRef([]);
  const [campaigns, setCampaigns] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({ title: '', shareTarget: 5, prizes: ['', '', ''] });
  const [participants, setParticipants] = useState([]);
  const [desired, setDesired] = useState(profile?.desired_gift || '');
  const PRIZE_GIFTS = [
    { id: 'prize-1', name: 'Gift 1', image: '/prize-1.jpg' },
    { id: 'prize-2', name: 'Gift 2', image: '/prize-2.jpg' },
    { id: 'prize-3', name: 'Gift 3', image: '/prize-3.jpg' },
  ];

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 60000);
    return () => clearTimeout(t);
  }, []);

  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) return;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    if (p?.desired_gift) setDesired(p.desired_gift);
    const { data: code, error: codeErr } = await supabase.rpc('ensure_my_referral_code');
    if (code) {
      setProfile(prev => ({ ...(prev || p || {}), referral_code: code }));
    } else if (codeErr && p && !p.referral_code) {
      const fallback = (p.full_name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) + Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('profiles').update({ referral_code: fallback }).eq('id', user.id);
      if (!error) setProfile(prev => ({ ...(prev || p), referral_code: fallback }));
    }
    const pendingRef = typeof window !== 'undefined' ? localStorage.getItem('giftland_ref') : '';
    if (pendingRef) {
      const { error: claimErr } = await supabase.rpc('claim_referral', { code: pendingRef });
      if (!claimErr) localStorage.removeItem('giftland_ref');
    }
    const { data: ev } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    const list = ev || [];
    const today = new Date().toISOString().slice(0, 10);
    const active = list.filter(e => !e.event_date || e.event_date >= today);
    setEvents(active.filter(e => e.is_public));
    const seed = user.id.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
    const shuffled = [...active].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + seed) % 97;
      const hb = (b.id.charCodeAt(0) + seed) % 97;
      return ha - hb;
    });
    feedBase.current = shuffled;
    setFeed(shuffled);
    const { data: mine } = await supabase.from('events').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
    setMyEvents(mine || []);
    const { data: attending } = await supabase.from('event_attendees').select('event_id, events(*)').eq('user_id', user.id).eq('status', 'attending');
    setAttending((attending || []).map(a => a.events).filter(Boolean));
    const { data: camps } = await supabase.from('campaigns').select('*').eq('active', true);
    setCampaigns(camps || []);
    const { data: mineCamps } = await supabase.from('campaigns').select('*').eq('host_id', user.id);
    setMyCampaigns(mineCamps || []);
    setProducts(pr || []);
    const { data: likeRows } = await supabase.from('event_likes').select('event_id, user_id');
    const counts = {};
    const liked = {};
    (likeRows || []).forEach(l => {
      counts[l.event_id] = (counts[l.event_id] || 0) + 1;
      if (l.user_id === user.id) liked[l.event_id] = true;
    });
    setLikes(counts);
    setMyLikes(liked);
    const { data: w } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    setWallet(w);
    const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id);
    setReferrals(count || 0);
    const { data: sent } = await supabase.from('gifts').select('is_anonymous').eq('sender_id', user.id);
    const anonC = (sent || []).filter(g => g.is_anonymous).length;
    setGiftStats({ anon: anonC, named: (sent || []).length - anonC });
    const { data: cash } = await supabase.from('gifts').select('amount, event_id, events(title)').eq('is_cash', true);
    const mineIds = (mine || []).map(e => e.id);
    const grouped = {};
    (cash || []).filter(g => mineIds.includes(g.event_id)).forEach(g => {
      const t = g.events?.title || 'Event';
      grouped[g.event_id] = { title: t, amount: (grouped[g.event_id]?.amount || 0) + Number(g.amount || 0) };
    });
    setCashByEvent(Object.values(grouped));
    if (p) setBank({ bank_name: p.bank_name || '', account_name: p.account_name || '', account_number: p.account_number || '' });
  }

  function qualify(type) {
    if (!profile?.birthday_day || !profile?.birthday_month) return { ok: false, reason: 'Add your birthday in Profile to qualify.' };
    const today = new Date();
    const d = profile.birthday_day, m = profile.birthday_month;
    if (type === 'daily') return { ok: today.getDate() === d && today.getMonth() + 1 === m, reason: today.getDate() === d && today.getMonth() + 1 === m ? 'You qualify for today’s draw.' : 'Your birthday is not today.' };
    if (type === 'weekly') {
      const start = new Date(today); start.setDate(today.getDate() - today.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      const bday = new Date(today.getFullYear(), m - 1, d);
      const ok = bday >= start && bday <= end;
      return { ok, reason: ok ? 'Your birthday falls this week.' : 'Your birthday is not this week.' };
    }
    if (type === 'monthly') return { ok: today.getMonth() + 1 === m, reason: today.getMonth() + 1 === m ? 'Your birthday is this month.' : 'Your birthday is not this month.' };
    return { ok: true, reason: 'Everyone registered qualifies for the yearly draw.' };
  }

  async function toggleLike(eventId) {
    if (!supabase || !user) return;
    if (myLikes[eventId]) {
      await supabase.from('event_likes').delete().eq('event_id', eventId).eq('user_id', user.id);
    } else {
      await supabase.from('event_likes').insert({ event_id: eventId, user_id: user.id });
    }
    load();
  }

  function handleDoubleTap(eventId) {
    if (!myLikes[eventId]) toggleLike(eventId);
  }

  function resizeImage(file, setter) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setter(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function openEvent(ev) { setSelectedEvent(ev); setScreen('event-detail'); setCart([]); }

  async function openCampaign(c) {
    setSelectedCampaign(c);
    const { data: prizes } = await supabase.from('campaign_prizes').select('*, profiles(username)').eq('campaign_id', c.id);
    const { data: parts } = await supabase.from('campaign_participants').select('*, profiles(username, full_name)').eq('campaign_id', c.id);
    setSelectedCampaign({ ...c, prizes: prizes || [] });
    setParticipants(parts || []);
    setScreen('campaign-detail');
  }

  const CASH_GIFTS = [
    { id: 'cash-25000', name: 'Cash Gift', price: 25000, is_cash: true },
    { id: 'cash-50000', name: 'Cash Gift', price: 50000, is_cash: true },
    { id: 'cash-100000', name: 'Cash Gift', price: 100000, is_cash: true },
  ];

  function toggleWish(item) {
    setWishlist(list => list.some(x => x.id === item.id) ? list.filter(x => x.id !== item.id) : [...list, item]);
  }

  function toggleCart(item) {
    setCart(c => c.find(x => x.id === item.id) ? c.filter(x => x.id !== item.id) : [...c, item]);
  }

  const bdayLabel = profile?.birthday_day && profile?.birthday_month
    ? `${profile.birthday_day} ${MONTHS[profile.birthday_month - 1]}` : 'Not set';

  return (
    <div className="phone" style={{ background: '#FFFBFB' }}>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#DC2626' }}>🎁 Giftland</div>
        <button style={{ background: 'none', border: 'none', fontSize: 22 }} onClick={() => setScreen('notifications')}>🔔</button>
      </div>

      <div className="phone-content">
        {!screen && tab === 'home' && (
          <>
            <h1 style={{ margin: 0 }}>Live Celebrations</h1>
            {showHint && <p className="subtitle">Scroll for more</p>}
            <div onScroll={e => {
              const el = e.currentTarget;
              const itemH = el.clientHeight;
              if (!itemH || feed.length < 2 || el.dataset.looping) return;
              if (el.scrollTop + itemH >= el.scrollHeight - 8) {
                el.dataset.looping = '1';
                setFeed(prev => [...prev, { ...prev[0], _k: prev[0].id + '-' + Date.now() }]);
                setTimeout(() => { el.dataset.looping = ''; }, 300);
              } else if (el.scrollTop >= itemH) {
                el.dataset.looping = '1';
                el.scrollTop = el.scrollTop - itemH;
                setFeed(prev => prev.slice(1));
                setTimeout(() => { el.dataset.looping = ''; }, 50);
              }
            }} style={{ height: 'calc(100vh - 160px)', overflowY: 'auto', scrollSnapType: 'y mandatory' }}>
            {feed.map(ev => (
              <div key={ev._k || ev.id} onDoubleClick={() => handleDoubleTap(ev.id)} style={{ height: '100%', scrollSnapAlign: 'start', position: 'relative', background: '#000', color: 'white' }}>
                {ev.image_url ? (
                  <img src={ev.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                ) : null}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,.6))' }} />
                <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                  <span className="tag" style={{ background: '#fff', color: '#DC2626' }}>{ev.event_type === 'video' ? 'UPLOAD' : ev.event_type === 'live' ? 'LIVE' : 'EVENT'}</span>
                  <div style={{ fontWeight: 800, fontSize: 20, marginTop: 8 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>{ev.event_date || ''} {ev.location ? '• ' + ev.location : ''}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button className="btn btn-sm" style={{ background: 'white', color: '#DC2626' }} onClick={() => openEvent(ev)}>View Event</button>
                    <button className="btn btn-sm" onClick={() => toggleLike(ev.id)}>♥ {likes[ev.id] || 0}</button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            {campaigns.map(c => {
              const end = c.end_date ? new Date(c.end_date + 'T00:00:00') : null;
              const days = end ? Math.max(0, Math.ceil((end - new Date()) / 86400000)) : 0;
              return (
                <div key={c.id} className="card" onClick={() => { setSelectedCampaign(c); setScreen('campaign-rules'); }} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                  {c.image_url && <img src={c.image_url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                  <div style={{ padding: 12 }}>
                    <strong>{c.title}</strong>
                    <div style={{ color: '#DC2626', fontWeight: 700 }}>{days} days to birthday</div>
                  </div>
                </div>
              );
            })}
            {!feed.length && <div className="card">No events yet. Create one from the + button.</div>}
          </>
        )}

        {!screen && tab === 'events' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[['general','General'],['mine','My Events'],['raffle','Raffle']].map(([k,l]) => (
                <button key={k} className={`btn btn-sm ${eventSub === k ? '' : 'btn-outline'}`} onClick={() => setEventSub(k)}>{l}</button>
              ))}
            </div>
            {eventSub === 'general' && (events.length ? events : []).map(ev => (
              <div key={ev.id} className="card" onClick={() => openEvent(ev)} style={{ cursor: 'pointer' }}>
                <strong>{ev.title}</strong>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Public • Anonymous gifting</p>
              </div>
            ))}
            {eventSub === 'mine' && (attending.length ? attending : []).map(ev => (
              <div key={ev.id} className="card" onClick={() => openEvent(ev)} style={{ cursor: 'pointer' }}>
                <strong>{ev.title}</strong>
                <p style={{ fontSize: 13, color: '#6B7280' }}>You’re attending</p>
              </div>
            ))}
            {eventSub === 'mine' && !attending.length && <div className="card">Open an invite link and tap I’m attending to see it here.</div>}
            {eventSub === 'raffle' && (
              <>
                {['daily','weekly','monthly','yearly'].map(t => {
                  const q = qualify(t);
                  return (
                    <div key={t} className="card" onClick={() => setScreen('raffle-' + t)} style={{ cursor: 'pointer' }}>
                      <strong>{t === 'daily' ? '📅 Daily' : t === 'weekly' ? '📆 Weekly' : t === 'monthly' ? '🗓️ Monthly' : '🎊 Yearly'}</strong>
                      <p style={{ fontSize: 13, color: q.ok ? '#059669' : '#6B7280' }}>{q.reason}</p>
                    </div>
                  );
                })}
                <div className="card" onClick={() => setScreen('raffle-signup')} style={{ cursor: 'pointer' }}>
                  <strong>🎁 Sign Up Raffle</strong>
                  <p style={{ fontSize: 13, color: '#6B7280' }}>{referrals}/10 friends referred</p>
                </div>
                <button className="btn" onClick={() => setScreen('campaign-setup')}>Host a birthday campaign</button>
                {myCampaigns.map(c => (
                  <div key={c.id} className="card" onClick={() => openCampaign(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{c.title}</strong>
                      <span className="tag tag-red">{c.active ? 'Active' : 'Off'}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
            {!events.length && eventSub === 'general' && <div className="card">No public events yet.</div>}
          </>
        )}

        {!screen && tab === 'create' && (
          <>
            <h1>Create Your Event</h1>
            <p className="subtitle">Let's create a beautiful celebration!</p>
            <label className="label">Event Type</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className={`btn btn-sm ${eventForm.type === 'birthday' ? '' : 'btn-outline'}`} onClick={() => setEventForm(f => ({ ...f, type: 'birthday' }))}>🎂 Birthday</button>
              <button className={`btn btn-sm ${eventForm.type === 'live' ? '' : 'btn-outline'}`} onClick={() => setScreen('live-setup')}>🔴 Live</button>
              <button className={`btn btn-sm ${eventForm.type === 'video' ? '' : 'btn-outline'}`} onClick={() => setScreen('upload-video')}>📹 Upload Video</button>
            </div>
            <label className="label">Event Image</label>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Use a portrait photo so it fills the home screen.</p>
            <input type="file" accept="image/*" onChange={e => resizeImage(e.target.files?.[0], setUploadPreview)} />
            {uploadPreview && <img src={uploadPreview} alt="" style={{ width: '100%', borderRadius: 12, margin: '8px 0' }} />}
            <label className="label">Event Title</label>
            <input className="input" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Emma's 10th Birthday Bash" />
            <label className="label">Date</label>
            <input className="input" type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
            <label className="label">Time</label>
            <input className="input" type="time" value={eventForm.time} onChange={e => setEventForm(f => ({ ...f, time: e.target.value }))} />
            <label className="label">Location Type</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className={`btn btn-sm ${eventForm.locType === 'physical' ? '' : 'btn-outline'}`} onClick={() => setEventForm(f => ({ ...f, locType: 'physical' }))}>📍 Physical</button>
              <button className={`btn btn-sm ${eventForm.locType === 'virtual' ? '' : 'btn-outline'}`} onClick={() => setEventForm(f => ({ ...f, locType: 'virtual' }))}>💻 Virtual</button>
            </div>
            <label className="label">Location</label>
            <input className="input" value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue or link" />
            <label className="label">Description</label>
            <input className="input" value={eventForm.desc} onChange={e => setEventForm(f => ({ ...f, desc: e.target.value }))} placeholder="Join us for cake, games, and a day full of fun!" />
            <label className="label">Visibility</label>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>🌐 Public — Anyone can view and join</div>
              <div onClick={() => setEventForm(f => ({ ...f, isPublic: !f.isPublic }))} style={{ width: 44, height: 24, background: eventForm.isPublic ? '#DC2626' : '#E5E7EB', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: eventForm.isPublic ? 22 : 2 }} />
              </div>
            </div>
            <button className="btn" onClick={async () => {
              if (!supabase || !user || !eventForm.title || !eventForm.date) { alert('Add a title and a date'); return; }
              const { data } = await supabase.from('events').insert({
                host_id: user.id, title: eventForm.title, event_type: eventForm.type,
                event_date: eventForm.date || null, location: eventForm.location,
                is_public: eventForm.isPublic, share_code: Math.random().toString(36).slice(2, 8),
                image_url: uploadPreview || null,
              }).select().single();
              if (data) { setSelectedEvent(data); setScreen('build-wishlist'); load(); }
            }}>Next: Choose Wishlist Gifts</button>
          </>
        )}

        {!screen && tab === 'gifts' && (
          <>
            <h1>myGifts</h1>
            <p className="subtitle">Events you are hosting. Tap to see gifts received.</p>
            {myEvents.map(ev => (
              <div key={ev.id} className="card" onClick={async () => {
                setSelectedEvent(ev);
                if (supabase) {
                  const { data } = await supabase.from('gifts').select('*, profiles(full_name)').eq('event_id', ev.id);
                  setReceivedGifts(data || []);
                }
                setScreen('gifts-received');
              }} style={{ cursor: 'pointer' }}>
                <strong>{ev.title}</strong>
                <p style={{ fontSize: 13, color: '#6B7280' }}>{ev.event_date || 'Ongoing'}</p>
              </div>
            ))}
            {!myEvents.length && <div className="card">You haven’t hosted an event yet.</div>}
          </>
        )}

        {!screen && tab === 'profile' && (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>👤</div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{profile?.full_name || user?.email || 'Guest'}</div>
              <div style={{ color: '#DC2626' }}>@{profile?.username || 'user'}</div>
              <span className="tag tag-green">{profile?.kyc_status === 'verified' ? 'KYC Verified' : 'KYC Pending'}</span>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Birthday</span><strong>{bdayLabel}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Phone</span><strong>{profile?.phone || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Email</span><strong>{profile?.email || user?.email || '—'}</strong></div>
            </div>
            <button className="btn btn-outline" onClick={() => setScreen('edit-profile')}>Edit profile</button>
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Gifting activity</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}><span>Raffle entries</span><strong>Daily · Weekly</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}><span>Anonymous gifts sent</span><strong>{giftStats.anon}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Named gifts sent</span><strong>{giftStats.named}</strong></div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Birthday wish</div>
              {desired ? (
                <div>
                  <img src={PRIZE_GIFTS.find(g => g.id === desired)?.image} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <div>You picked {PRIZE_GIFTS.find(g => g.id === desired)?.name} as your desired gift to be won on your birthday.</div>
                </div>
              ) : <div style={{ fontSize: 13, color: '#6B7280' }}>Chosen when you signed up.</div>}
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Event history</div>
              {myEvents.filter(e => e.event_date && e.event_date < new Date().toISOString().slice(0, 10)).length
                ? myEvents.filter(e => e.event_date && e.event_date < new Date().toISOString().slice(0, 10)).map(ev => (
                  <div key={ev.id} style={{ padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>{ev.title} · {ev.event_date}</div>
                ))
                : <div style={{ fontSize: 13, color: '#6B7280' }}>Ended events you hosted will appear here.</div>}
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Settings</div>
              <div style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }} onClick={() => setScreen('notif-prefs')}>Notification preferences</div>
              <div style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }} onClick={() => setScreen('privacy')}>Privacy</div>
              <div style={{ padding: '10px 0', cursor: 'pointer' }} onClick={() => setScreen('wallet')}>Wallet</div>
            </div>
            <button className="btn btn-outline" onClick={async () => { await supabase?.auth.signOut(); router.push('/'); }}>Sign out</button>
          </>
        )}

        {screen === 'event-detail' && selectedEvent && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>{selectedEvent.title}</h1>
            <p className="subtitle">{selectedEvent.event_date || ''} {selectedEvent.location ? '• ' + selectedEvent.location : ''}</p>
            <div className="card" style={{ background: '#F9FAFB' }}>
              <div style={{ fontSize: 12, color: '#6B7280' }}>EVENT LINK</div>
              <div style={{ fontWeight: 700, wordBreak: 'break-all' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/e/{selectedEvent.share_code}</div>
            </div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>Give anonymously</strong><div style={{ fontSize: 12, color: '#6B7280' }}>Host won’t see your name</div></div>
              <div onClick={() => setAnon(a => !a)} style={{ width: 48, height: 28, background: anon ? '#DC2626' : '#E5E7EB', borderRadius: 14, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: anon ? 22 : 2, transition: '0.2s' }} />
              </div>
            </div>
            <h2>Wishlist</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Tap to add or remove</p>
            {CASH_GIFTS.map(p => {
              const on = cart.find(x => x.id === p.id);
              return (
                <button type="button" key={p.id} className="card" onClick={() => toggleCart(p)} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6', background: on ? '#FEE2E2' : 'white' }}>
                  <strong>{p.name}</strong>
                  <div style={{ color: '#DC2626', fontWeight: 700 }}>₦{p.price.toLocaleString()}</div>
                  {on && <span className="tag tag-red">Selected</span>}
                </button>
              );
            })}
            {products.map(p => {
              const on = cart.find(x => x.id === p.id);
              return (
                <button type="button" key={p.id} className="card" onClick={() => toggleCart(p)} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6', background: on ? '#FEE2E2' : 'white' }}>
                  <strong>{p.name}</strong>
                  <div style={{ color: '#DC2626', fontWeight: 700 }}>₦{Number(p.price).toLocaleString()}</div>
                  {on && <span className="tag tag-red">Selected</span>}
                </button>
              );
            })}
            {cart.length > 0 && <button className="btn" onClick={() => setScreen('checkout')}>Gift items</button>}
          </>
        )}

        {screen === 'checkout' && (
          <>
            <button onClick={() => setScreen('event-detail')} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Gift items</h1>
            <p className="subtitle">{anon ? 'Sending anonymously' : `From ${profile?.full_name || 'you'}`}</p>
            {cart.map(c => <div key={c.id} className="card"><strong>{c.name}</strong></div>)}
            <button className="btn" onClick={async () => {
              if (supabase && user && selectedEvent) {
                for (const item of cart) {
                  await supabase.from('gifts').insert({
                    event_id: selectedEvent.id,
                    sender_id: user.id,
                    product_id: item.is_cash ? null : item.id,
                    is_anonymous: anon,
                    is_cash: !!item.is_cash,
                    amount: item.price || 0,
                  });
                }
              }
              setScreen('gift-success');
            }}>Pay & Gift</button>
          </>
        )}

        {screen === 'gift-success' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48 }}>🎉</div>
            <h1 style={{ textAlign: 'center' }}>Gift Sent!</h1>
            <p className="subtitle" style={{ textAlign: 'center' }}>Items gifted to this event:</p>
            {cart.map(c => <div key={c.id} className="card"><strong>{c.name}</strong></div>)}
            <button className="btn" onClick={() => { setScreen(null); setCart([]); }}>Done</button>
          </>
        )}

        {screen?.startsWith('raffle-') && screen !== 'raffle-signup' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Raffles</button>
            <h1>{screen.replace('raffle-', '').replace(/^\w/, c => c.toUpperCase())} Raffle</h1>
            <div className="card">
              <div>Hello, <strong>{profile?.full_name || 'there'}</strong></div>
              <div style={{ marginTop: 6 }}>Birthday: <strong>{bdayLabel}</strong></div>
              <div style={{ marginTop: 8, color: qualify(screen.replace('raffle-', '')).ok ? '#059669' : '#DC2626' }}>
                {qualify(screen.replace('raffle-', '')).reason}
              </div>
            </div>
          </>
        )}

        {screen === 'raffle-signup' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Raffles</button>
            <h1>Sign Up Raffle</h1>
            <p className="subtitle">Refer 10 friends to qualify for a free gift.</p>
            <div className="card">
              <div>Name: <strong>{profile?.full_name || '—'}</strong></div>
              <div>Birthday: <strong>{bdayLabel}</strong></div>
              <div style={{ marginTop: 8 }}>Friends signed up</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>{referrals} / 10</div>
              <div style={{ fontSize: 13, color: referrals >= 10 ? '#059669' : '#6B7280' }}>
                {referrals >= 10 ? 'You qualify for the free gift!' : `${10 - referrals} more to qualify`}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#6B7280' }}>YOUR REFERRAL LINK</div>
              <div style={{ fontWeight: 700, wordBreak: 'break-all' }}>
                {profile?.username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${profile.username}` : 'Set a username in Edit profile first'}
              </div>
              <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => {
                if (!profile?.username) return;
                const link = window.location.origin + '/?ref=' + profile.username;
                navigator.clipboard?.writeText(link);
                alert('Referral link copied. Friends who sign up with it are counted for you.');
              }}>Copy link</button>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>Friends who sign up with this link are counted on your account.</p>
            </div>
          </>
        )}

        {screen === 'gifts-received' && selectedEvent && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← myGifts</button>
            <h1>Gifts for {selectedEvent.title}</h1>
            {receivedGifts.length ? receivedGifts.map(g => (
              <div key={g.id} className="card">
                <strong>{g.is_cash ? `Cash ₦${Number(g.amount || 0).toLocaleString()}` : 'Gift item'}</strong>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{g.is_anonymous ? 'Anonymous' : (g.profiles?.full_name || 'Named')}</div>
              </div>
            )) : <div className="card">No gifts yet.</div>}
          </>
        )}

        {screen === 'edit-profile' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Profile</button>
            <h1>Edit profile</h1>
            <input className="input" placeholder="Full name" defaultValue={profile?.full_name || ''} id="ep-name" />
            <input className="input" placeholder="Username" defaultValue={profile?.username || ''} id="ep-user" />
            <input className="input" placeholder="Phone" defaultValue={profile?.phone || ''} id="ep-phone" />
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" id="ep-day" defaultValue={profile?.birthday_day || ''}>
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="input" id="ep-month" defaultValue={profile?.birthday_month || ''}>
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <button className="btn" onClick={async () => {
              const username = document.getElementById('ep-user').value.trim();
              if (supabase && user) {
                const { error } = await supabase.from('profiles').update({
                  full_name: document.getElementById('ep-name').value,
                  username,
                  phone: document.getElementById('ep-phone').value,
                  birthday_day: Number(document.getElementById('ep-day').value) || null,
                  birthday_month: Number(document.getElementById('ep-month').value) || null,
                }).eq('id', user.id);
                if (error) { alert(error.message.includes('unique') ? 'Username already taken' : error.message); return; }
                load(); setScreen(null);
              }
            }}>Save</button>
          </>
        )}

        {screen === 'notif-prefs' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Profile</button>
            <h1>Notifications</h1>
            <p className="subtitle">Choose what you want to be notified about.</p>
            <div className="card">
              {[['gifts','Gift received'],['live','Live streams'],['raffles','Raffle results'],['promos','Promotions']].map(([k, label]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div><strong>{label}</strong></div>
                  <div onClick={() => setNotif(n => ({ ...n, [k]: !n[k] }))} style={{ width: 48, height: 28, background: notif[k] ? '#DC2626' : '#E5E7EB', borderRadius: 14, position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 24, height: 24, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: notif[k] ? 22 : 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {screen === 'privacy' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Profile</button>
            <h1>Privacy</h1>
            <p className="subtitle">Control how you appear when gifting.</p>
            <div className="card">
              {[['defaultAnon','Default anonymous'],['showBday','Show birthday publicly'],['discoverable','Profile discoverable']].map(([k, label]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div><strong>{label}</strong></div>
                  <div onClick={() => setPrivacy(n => ({ ...n, [k]: !n[k] }))} style={{ width: 48, height: 28, background: privacy[k] ? '#DC2626' : '#E5E7EB', borderRadius: 14, position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 24, height: 24, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: privacy[k] ? 22 : 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {screen === 'wallet' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Profile</button>
            <h1>Wallet</h1>
            <p className="subtitle">Cash gifts are held here until you withdraw.</p>
            <div className="card" style={{ textAlign: 'center', background: '#FEE2E2' }}>
              <div>Available</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>₦{(wallet?.balance || 0).toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent cash gifts</div>
              {cashByEvent.length ? cashByEvent.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span>{c.title}</span><strong>₦{c.amount.toLocaleString()}</strong>
                </div>
              )) : <div style={{ fontSize: 13, color: '#6B7280' }}>No cash gifts yet.</div>}
            </div>
            <div className="card" onClick={() => setScreen('payment-method')} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 700 }}>Payment method</div>
              <div>{bank.bank_name || 'Add bank'}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{bank.account_name || 'Tap to add details'}</div>
              {bank.account_number && <div style={{ fontSize: 13 }}>•••• {bank.account_number.slice(-4)}</div>}
            </div>
            <button className="btn" onClick={() => {}}>Withdraw to bank</button>
          </>
        )}

        {screen === 'payment-method' && (
          <>
            <button onClick={() => setScreen('wallet')} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Wallet</button>
            <h1>Payment method</h1>
            <input className="input" placeholder="Bank" value={bank.bank_name} onChange={e => setBank(b => ({ ...b, bank_name: e.target.value }))} />
            <input className="input" placeholder="Bank account name" value={bank.account_name} onChange={e => setBank(b => ({ ...b, account_name: e.target.value }))} />
            <input className="input" placeholder="Bank account number" value={bank.account_number} onChange={e => setBank(b => ({ ...b, account_number: e.target.value }))} />
            <button className="btn" onClick={async () => {
              if (supabase && user) {
                await supabase.from('profiles').update(bank).eq('id', user.id);
                setScreen('wallet');
              }
            }}>Save</button>
          </>
        )}

        {screen === 'build-wishlist' && (
          <>
            <button type="button" onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Choose Wishlist</h1>
            <p className="subtitle">Tap a gift to add it. Tap again to remove it.</p>
            <button type="button" className="btn btn-outline" style={{ marginBottom: 12 }} onClick={() => setWishlist([...CASH_GIFTS, ...products])}>Select All</button>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Cash gifts</div>
            {CASH_GIFTS.map(p => {
              const on = wishlist.some(x => x.id === p.id);
              return (
                <button type="button" key={p.id} className="card" onClick={() => toggleWish(p)} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6', background: on ? '#FEE2E2' : 'white' }}>
                  <strong>Cash · ₦{p.price.toLocaleString()}</strong>
                  {on && <div><span className="tag tag-red">Added</span></div>}
                </button>
              );
            })}
            {products.length > 0 && <div style={{ fontWeight: 700, margin: '12px 0 8px' }}>Store gifts</div>}
            {products.map(p => {
              const on = wishlist.some(x => x.id === p.id);
              return (
                <button type="button" key={p.id} className="card" onClick={() => toggleWish(p)} style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6', background: on ? '#FEE2E2' : 'white' }}>
                  <strong>{p.name}</strong>
                  <div style={{ color: '#DC2626' }}>₦{Number(p.price).toLocaleString()}</div>
                  {on && <span className="tag tag-red">Added</span>}
                </button>
              );
            })}
            {!products.length && <p style={{ fontSize: 13, color: '#6B7280' }}>Store gifts will appear here once a vendor adds them. Cash gifts are ready now.</p>}
            <button type="button" className="btn" onClick={async () => {
              if (!wishlist.length) { alert('Tap at least one gift to add it.'); return; }
              if (supabase && selectedEvent) {
                const rows = wishlist.map(item => ({
                  event_id: selectedEvent.id,
                  product_id: item.is_cash ? null : item.id,
                  is_cash: !!item.is_cash,
                  amount: item.is_cash ? item.price : item.price,
                }));
                const { error } = await supabase.from('wishlist_items').insert(rows);
                if (error) { alert('Could not save wishlist: ' + error.message); return; }
              }
              setScreen('event-created');
            }}>Create Event</button>
          </>
        )}

        {screen === 'event-created' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48 }}>🎉</div>
            <h1 style={{ textAlign: 'center' }}>Event Created!</h1>
            <div className="card">
              <div style={{ fontSize: 12, color: '#6B7280' }}>UNIQUE EVENT LINK</div>
              <div style={{ fontWeight: 700 }}>{typeof window !== 'undefined' ? window.location.origin : ''}/e/{selectedEvent?.share_code || 'event'}</div>
            </div>
            <button className="btn" onClick={() => { setScreen(null); setTab('home'); }}>Done</button>
          </>
        )}

        {screen === 'live-setup' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Go Live</h1>
            <p className="subtitle">Stream your celebration so people can gift in real time.</p>
            <button className="btn" onClick={() => setScreen(null)}>Start Live Stream</button>
          </>
        )}

        {screen === 'upload-video' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Upload Photo</h1>
            <p className="subtitle">Use a portrait photo so it fills the home screen. Video upload is coming soon.</p>
            <label className="label">Name</label>
            <input className="input" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Event name" />
            <label className="label">Date</label>
            <input className="input" type="date" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
            <label className="label">Type</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className={`btn btn-sm ${eventForm.locType === 'physical' ? '' : 'btn-outline'}`} onClick={() => setEventForm(f => ({ ...f, locType: 'physical' }))}>Physical</button>
              <button className={`btn btn-sm ${eventForm.locType === 'virtual' ? '' : 'btn-outline'}`} onClick={() => setEventForm(f => ({ ...f, locType: 'virtual' }))}>Virtual</button>
            </div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Share with the public</div>
              <div onClick={() => setEventForm(f => ({ ...f, isPublic: !f.isPublic }))} style={{ width: 44, height: 24, background: eventForm.isPublic ? '#DC2626' : '#E5E7EB', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: eventForm.isPublic ? 22 : 2 }} />
              </div>
            </div>
            <input type="file" accept="image/*" onChange={e => resizeImage(e.target.files?.[0], setUploadPreview)} />
            {uploadPreview && <img src={uploadPreview} alt="Preview" style={{ width: '100%', borderRadius: 12, margin: '8px 0' }} />}
            <div style={{ fontWeight: 700, margin: '12px 0 8px' }}>Cash gifts for this upload</div>
            {CASH_GIFTS.map(p => {
              const on = wishlist.some(x => x.id === p.id);
              return (
                <button type="button" key={p.id} className="card" onClick={() => toggleWish(p)} style={{ display: 'block', width: '100%', textAlign: 'left', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6', background: on ? '#FEE2E2' : 'white' }}>
                  Cash · ₦{p.price.toLocaleString()} {on ? '· Added' : ''}
                </button>
              );
            })}
            <button className="btn" onClick={async () => {
              if (!user) { alert('Please sign in first'); return; }
              if (!eventForm.title) { alert('Add a name'); return; }
              if (!eventForm.date) { alert('Pick a date. The event ends on that date.'); return; }
              if (!uploadPreview) { alert('Choose a photo first'); return; }
              const { data, error } = await supabase.from('events').insert({
                host_id: user.id,
                title: eventForm.title,
                event_type: 'video',
                event_date: eventForm.date,
                location: eventForm.locType,
                image_url: uploadPreview,
                is_public: eventForm.isPublic,
                share_code: Math.random().toString(36).slice(2, 8),
              }).select().single();
              if (error) { alert('Could not save: ' + error.message); return; }
              if (wishlist.length && data) {
                await supabase.from('wishlist_items').insert(wishlist.map(item => ({ event_id: data.id, is_cash: true, amount: item.price })));
              }
              setUploadPreview(null);
              load();
              setScreen(null);
            }}>Save Photo</button>
          </>
        )}

        {screen === 'campaign-setup' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Host a campaign</h1>
            <p className="subtitle">Ends on your birthday. You pay for the 3 prizes. Friends complete tasks to qualify.</p>
            <input className="input" placeholder="Campaign name" value={campaignForm.title} onChange={e => setCampaignForm(f => ({ ...f, title: e.target.value }))} />
            <label className="label">Campaign image (portrait)</label>
            <input type="file" accept="image/*" onChange={e => resizeImage(e.target.files?.[0], setUploadPreview)} />
            {uploadPreview && <img src={uploadPreview} alt="" style={{ width: '100%', borderRadius: 12, margin: '8px 0' }} />}
            <label className="label">Share the link to at least</label>
            <input className="input" type="number" value={campaignForm.shareTarget} onChange={e => setCampaignForm(f => ({ ...f, shareTarget: e.target.value }))} />
            <label className="label">3 prizes to be won</label>
            {[0,1,2].map(i => (
              <input key={i} className="input" placeholder={'Prize ' + (i + 1)} value={campaignForm.prizes[i]} onChange={e => setCampaignForm(f => { const prizes = [...f.prizes]; prizes[i] = e.target.value; return { ...f, prizes }; })} />
            ))}
            <div className="card">
              <strong>Rules</strong>
              <p>1. Share the link to at least {campaignForm.shareTarget} friends.</p>
              <p>2. Gift the host at least 2 items on the wishlist.</p>
              <p>3. Leave a birthday wish for the host.</p>
            </div>
            <button className="btn" onClick={async () => {
              if (!user || !campaignForm.title || campaignForm.prizes.some(p => !p)) { alert('Add a name and 3 prizes'); return; }
              const month = String(profile?.birthday_month || 1).padStart(2, '0');
              const day = String(profile?.birthday_day || 1).padStart(2, '0');
              const year = new Date().getMonth() + 1 > (profile?.birthday_month || 1) ? new Date().getFullYear() + 1 : new Date().getFullYear();
              const end = `${year}-${month}-${day}`;
              const code = Math.random().toString(36).slice(2, 8);
              const { data, error } = await supabase.from('campaigns').insert({
                host_id: user.id, title: campaignForm.title, image_url: uploadPreview, end_date: end,
                share_target: Number(campaignForm.shareTarget) || 5, share_code: code,
              }).select().single();
              if (error) { alert(error.message); return; }
              await supabase.from('campaign_prizes').insert(campaignForm.prizes.map((name, i) => ({ campaign_id: data.id, name, position: i + 1 })));
              setUploadPreview(null);
              load();
              setScreen(null);
            }}>Create campaign</button>
          </>
        )}

        {screen === 'campaign-rules' && selectedCampaign && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>{selectedCampaign.title}</h1>
            {selectedCampaign.image_url && <img src={selectedCampaign.image_url} alt="" style={{ width: '100%', borderRadius: 12 }} />}
            <div className="card">
              <strong>Rules to join</strong>
              <p>1. Share the link to at least {selectedCampaign.share_target} friends.</p>
              <p>2. Gift the host at least 2 wishlist items.</p>
              <p>3. Leave a birthday wish for the host.</p>
            </div>
            <button className="btn" onClick={async () => {
              if (!user) { alert('Sign in to join'); return; }
              const { error } = await supabase.from('campaign_participants').insert({ campaign_id: selectedCampaign.id, user_id: user.id });
              if (error && !error.message.includes('duplicate')) { alert(error.message); return; }
              alert('Joined. Your share link is ready on the raffle tab.');
              setScreen(null);
            }}>Join campaign</button>
          </>
        )}

        {screen === 'campaign-detail' && selectedCampaign && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>{selectedCampaign.title}</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active</span>
              <div onClick={async () => {
                await supabase.from('campaigns').update({ active: !selectedCampaign.active }).eq('id', selectedCampaign.id);
                openCampaign({ ...selectedCampaign, active: !selectedCampaign.active });
              }} style={{ width: 44, height: 24, background: selectedCampaign.active ? '#DC2626' : '#E5E7EB', borderRadius: 12, position: 'relative' }}>
                <div style={{ width: 20, height: 20, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: selectedCampaign.active ? 22 : 2 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
              {(selectedCampaign.prizes || []).map(p => (
                <div key={p.id} className="card" style={{ flex: 1, textAlign: 'center' }}>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 20 }}>{p.profiles?.username ? '@' + p.profiles.username : '?'}</div>
                  {!p.winner_id && (
                    <select onChange={async e => {
                      if (!e.target.value) return;
                      await supabase.from('campaign_prizes').update({ winner_id: e.target.value }).eq('id', p.id);
                      openCampaign(selectedCampaign);
                    }}>
                      <option value="">Award</option>
                      {participants.map(part => <option key={part.user_id} value={part.user_id}>{part.profiles?.username}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
            <div className="card">
              <strong>Participants</strong>
              {participants.map(part => (
                <div key={part.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span>@{part.profiles?.username}</span>
                  <span>{part.shares} shares</span>
                </div>
              ))}
              {!participants.length && <p>No participants yet.</p>}
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: '#6B7280' }}>YOUR SHARE LINK</div>
              <div style={{ fontWeight: 700, wordBreak: 'break-all' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/c/{selectedCampaign.share_code}?by={profile?.username}</div>
            </div>
          </>
        )}
        {screen === 'notifications' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Notifications</h1>
            <div className="card">No new notifications.</div>
          </>
        )}
      </div>

      <div className="bottom-nav">
        {[
          ['home', <svg key="h" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, 'Home'],
          ['events', <svg key="e" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, 'Events'],
          ['create', null, 'Create'],
          ['gifts', <svg key="g" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, 'myGifts'],
          ['profile', <svg key="p" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, 'Profile'],
        ].map(([k, icon, label]) => (
          <button key={k} className={`nav-item ${tab === k && !screen ? 'active' : ''}`} onClick={() => { setTab(k); setScreen(null); }}>
            {k === 'create' ? <div className="center-plus">+</div> : <div className="icon">{icon}</div>}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
