'use client';
import { useState } from 'react';
import Link from 'next/link';

const screens = {
  home: 'Home',
  events: 'Events',
  create: 'Create',
  gifts: 'myGifts',
  profile: 'Profile',
};

export default function HomeApp() {
  const [tab, setTab] = useState('home');
  const [eventTab, setEventTab] = useState('general');

  return (
    <div className="phone">
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#DC2626' }}>🎁 Giftland</div>
        <span>🔔</span>
      </div>

      <div className="phone-content">
        {tab === 'home' && (
          <>
            <h1>Live Celebrations</h1>
            <p className="subtitle">Tap to gift like TikTok.</p>
            <div className="card" style={{ background: 'linear-gradient(135deg,#DC2626,#EF4444)', color: 'white', minHeight: 200, position: 'relative' }}>
              <span className="tag" style={{ background: '#fff', color: '#DC2626' }}>LIVE</span>
              <div style={{ fontSize: 48, textAlign: 'center', margin: '20px 0' }}>🎂</div>
              <div style={{ fontWeight: 800 }}>Sarah’s 28th Birthday</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>2.4k watching</div>
              <button className="btn" style={{ marginTop: 12, background: 'white', color: '#DC2626' }}>Gift now</button>
            </div>
          </>
        )}

        {tab === 'events' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['general', 'mine', 'raffle'].map(t => (
                <button key={t} className={`btn btn-sm ${eventTab === t ? '' : 'btn-outline'}`} onClick={() => setEventTab(t)}>
                  {t === 'general' ? 'General' : t === 'mine' ? 'My Events' : 'Raffle'}
                </button>
              ))}
            </div>
            {eventTab === 'general' && (
              <>
                <div className="card"><strong>Sarah’s Birthday</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Public • Anonymous gifting</p></div>
                <div className="card"><strong>Emma’s 10th</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Public • Jun 21</p></div>
              </>
            )}
            {eventTab === 'mine' && (
              <div className="card"><strong>Wedding Registry</strong><p style={{ fontSize: 13, color: '#6B7280' }}>You’re invited • Gift sent</p></div>
            )}
            {eventTab === 'raffle' && (
              <>
                <div className="card"><strong>📅 Daily</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Birthday must be today</p></div>
                <div className="card"><strong>📆 Weekly</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Birthday this week</p></div>
                <div className="card"><strong>🗓️ Monthly</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Birthday this month</p></div>
                <div className="card"><strong>🎊 Yearly</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Everyone registered</p></div>
                <Link href="/raffle" className="card" style={{ display: 'block' }}><strong>🎁 Sign Up Raffle</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Refer 10 friends for a free gift</p></Link>
              </>
            )}
          </>
        )}

        {tab === 'create' && (
          <>
            <h1>Create Event</h1>
            <input className="input" placeholder="Event title" />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button className="btn btn-sm">Birthday</button>
              <button className="btn btn-sm btn-outline">Live</button>
              <button className="btn btn-sm btn-outline">Upload Video</button>
            </div>
            <input className="input" placeholder="Date" />
            <input className="input" placeholder="Location" />
            <button className="btn">Next: Choose Wishlist</button>
          </>
        )}

        {tab === 'gifts' && (
          <>
            <h1>myGifts</h1>
            <p className="subtitle">Events you host and gifts received.</p>
            <div className="card"><strong>Emma’s Birthday</strong><p style={{ fontSize: 13, color: '#6B7280' }}>12 gifts received</p></div>
            <div className="card"><strong>Wedding</strong><p style={{ fontSize: 13, color: '#6B7280' }}>8 gifts received</p></div>
          </>
        )}

        {tab === 'profile' && (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>👩</div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>Adaeze Okonkwo</div>
              <div style={{ color: '#DC2626' }}>@adaeze</div>
              <span className="tag tag-green">KYC Verified</span>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12 }}>
                <div><strong>4</strong><div style={{ fontSize: 11, color: '#6B7280' }}>Hosted</div></div>
                <div><strong>27</strong><div style={{ fontSize: 11, color: '#6B7280' }}>Sent</div></div>
                <div><strong>19</strong><div style={{ fontSize: 11, color: '#6B7280' }}>Received</div></div>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Birthday</span><strong>14 June</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Phone</span><strong>+234 801…</strong></div>
            </div>
            <Link href="/wallet" className="card" style={{ display: 'block' }}><strong>👛 Wallet</strong><p style={{ fontSize: 13, color: '#6B7280' }}>Cash gifts & withdrawals</p></Link>
          </>
        )}
      </div>

      <div className="bottom-nav">
        {Object.entries(screens).map(([k, label]) => (
          <button key={k} className={`nav-item ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {k === 'create' ? <div className="center-plus">+</div> : <div className="icon">{k === 'home' ? '🏠' : k === 'events' ? '📅' : k === 'gifts' ? '🎁' : '👤'}</div>}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
