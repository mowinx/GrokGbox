'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function HomeApp() {
  const [tab, setTab] = useState('home');
  const [eventSub, setEventSub] = useState('general');
  const [screen, setScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [referrals, setReferrals] = useState(0);
  const [cart, setCart] = useState([]);
  const [anon, setAnon] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) return;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);
    const { data: ev } = await supabase.from('events').select('*').eq('is_public', true).order('created_at', { ascending: false });
    setEvents(ev || []);
    const { data: mine } = await supabase.from('events').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
    setMyEvents(mine || []);
    const { data: pr } = await supabase.from('products').select('*').eq('active', true);
    setProducts(pr || []);
    const { data: w } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    setWallet(w);
    const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id);
    setReferrals(count || 0);
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

  function openEvent(ev) { setSelectedEvent(ev); setScreen('event-detail'); setCart([]); }

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
            <h1>Live Celebrations</h1>
            <p className="subtitle">Infinite scroll of birthday & event streams. Tap to gift like TikTok.</p>
            {(events.length ? events : []).map(ev => (
              <div key={ev.id} className="card" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)', color: 'white', minHeight: 160, position: 'relative' }}>
                <span className="tag" style={{ background: '#fff', color: '#DC2626' }}>LIVE</span>
                <div style={{ fontWeight: 800, fontSize: 18, marginTop: 12 }}>{ev.title}</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>{ev.location || 'Online'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-sm" style={{ background: 'white', color: '#DC2626' }} onClick={() => openEvent(ev)}>View Event</button>
                  <button className="btn btn-sm" onClick={() => openEvent(ev)}>🎁 Gift</button>
                </div>
              </div>
            ))}
            {!events.length && <div className="card">No live events yet. Create one from the + button.</div>}
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
            {eventSub === 'mine' && (myEvents.length ? myEvents : []).map(ev => (
              <div key={ev.id} className="card" onClick={() => openEvent(ev)} style={{ cursor: 'pointer' }}>
                <strong>{ev.title}</strong>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Your event</p>
              </div>
            ))}
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
              <button className="btn btn-sm">🎂 Birthday</button>
              <button className="btn btn-sm btn-outline" onClick={() => setScreen('live-setup')}>🔴 Live</button>
              <button className="btn btn-sm btn-outline" onClick={() => setScreen('upload-video')}>📹 Upload Video</button>
            </div>
            <input className="input" placeholder="Event title" id="ev-title" />
            <input className="input" type="date" id="ev-date" />
            <input className="input" placeholder="Location" id="ev-loc" />
            <button className="btn" onClick={async () => {
              const title = document.getElementById('ev-title').value;
              const date = document.getElementById('ev-date').value;
              const loc = document.getElementById('ev-loc').value;
              if (!supabase || !user || !title) return;
              const { data } = await supabase.from('events').insert({ host_id: user.id, title, event_date: date || null, location: loc, is_public: true, share_code: Math.random().toString(36).slice(2, 8) }).select().single();
              if (data) { setSelectedEvent(data); setScreen('build-wishlist'); load(); }
            }}>Next: Choose Wishlist Gifts</button>
          </>
        )}

        {!screen && tab === 'gifts' && (
          <>
            <h1>myGifts</h1>
            <p className="subtitle">Events you host and gifts received.</p>
            {myEvents.map(ev => (
              <div key={ev.id} className="card" onClick={() => openEvent(ev)} style={{ cursor: 'pointer' }}>
                <strong>{ev.title}</strong>
                <p style={{ fontSize: 13, color: '#6B7280' }}>View gifts received</p>
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
            <div className="card" onClick={() => setScreen('wallet')} style={{ cursor: 'pointer' }}>
              <strong>👛 Wallet</strong>
              <p style={{ fontSize: 13, color: '#6B7280' }}>Balance: ₦{(wallet?.balance || 0).toLocaleString()}</p>
            </div>
          </>
        )}

        {screen === 'event-detail' && selectedEvent && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>{selectedEvent.title}</h1>
            <p className="subtitle">{selectedEvent.event_date || ''} {selectedEvent.location ? '• ' + selectedEvent.location : ''}</p>
            <div className="card" style={{ background: '#FEE2E2' }}>Public event • Anonymous gifting available</div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong>Give anonymously</strong><div style={{ fontSize: 12, color: '#6B7280' }}>Host won’t see your name</div></div>
              <div onClick={() => setAnon(a => !a)} style={{ width: 48, height: 28, background: anon ? '#DC2626' : '#E5E7EB', borderRadius: 14, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: anon ? 22 : 2, transition: '0.2s' }} />
              </div>
            </div>
            <h2>Wishlist</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Tap to add or remove</p>
            {(products.length ? products.slice(0, 6) : [{ id: 'cash', name: 'Cash Gift', price: 0 }]).map(p => {
              const on = cart.find(x => x.id === p.id);
              return (
                <div key={p.id} className="card" onClick={() => toggleCart(p)} style={{ cursor: 'pointer', border: on ? '2px solid #DC2626' : '1px solid #F3F4F6' }}>
                  <strong>{p.name}</strong>
                  <div style={{ color: '#DC2626', fontWeight: 700 }}>{p.price ? `₦${Number(p.price).toLocaleString()}` : 'Choose amount'}</div>
                  {on && <span className="tag tag-red">Selected</span>}
                </div>
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
                  await supabase.from('gifts').insert({ event_id: selectedEvent.id, sender_id: user.id, product_id: item.id === 'cash' ? null : item.id, is_anonymous: anon, is_cash: item.id === 'cash', amount: item.price || 0 });
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
              <div style={{ fontWeight: 700 }}>giftland.app/r/{profile?.referral_code || 'you'}</div>
            </div>
          </>
        )}

        {screen === 'wallet' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Profile</button>
            <h1>Wallet</h1>
            <div className="card" style={{ textAlign: 'center', background: '#FEE2E2' }}>
              <div>Available</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>₦{(wallet?.balance || 0).toLocaleString()}</div>
            </div>
          </>
        )}

        {screen === 'build-wishlist' && (
          <>
            <button onClick={() => setScreen(null)} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600 }}>← Back</button>
            <h1>Choose Wishlist</h1>
            <button className="btn btn-sm" style={{ marginBottom: 8 }} onClick={() => setCart(products)}>Select All</button>
            {products.map(p => (
              <div key={p.id} className="card" onClick={() => toggleCart(p)} style={{ cursor: 'pointer' }}>
                <strong>{p.name}</strong> — ₦{Number(p.price).toLocaleString()}
                {cart.find(x => x.id === p.id) && <span className="tag tag-red">Added</span>}
              </div>
            ))}
            <button className="btn" onClick={() => setScreen('event-created')}>Create Event</button>
          </>
        )}

        {screen === 'event-created' && (
          <>
            <div style={{ textAlign: 'center', fontSize: 48 }}>🎉</div>
            <h1 style={{ textAlign: 'center' }}>Event Created!</h1>
            <div className="card">
              <div style={{ fontSize: 12, color: '#6B7280' }}>UNIQUE EVENT LINK</div>
              <div style={{ fontWeight: 700 }}>giftland.app/e/{selectedEvent?.share_code || 'event'}</div>
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
            <h1>Upload Video</h1>
            <p className="subtitle">Share a video of your celebration.</p>
            <button className="btn" onClick={() => setScreen(null)}>Upload</button>
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
        {[['home','🏠','Home'],['events','📅','Events'],['create','+','Create'],['gifts','🎁','myGifts'],['profile','👤','Profile']].map(([k, icon, label]) => (
          <button key={k} className={`nav-item ${tab === k && !screen ? 'active' : ''}`} onClick={() => { setTab(k); setScreen(null); }}>
            {k === 'create' ? <div className="center-plus">+</div> : <div className="icon">{icon}</div>}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
