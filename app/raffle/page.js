'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Raffle() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="phone">
      <div className="phone-content">
        <Link href="/home" style={{ color: '#DC2626', fontWeight: 600 }}>← Back</Link>
        <h1 style={{ marginTop: 8 }}>Sign Up Raffle</h1>
        <p className="subtitle">Refer 10 friends who sign up through your link to qualify for a free gift.</p>
        {!joined ? (
          <>
            <input className="input" placeholder="Full name" />
            <input className="input" placeholder="Phone" />
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="Day" />
              <input className="input" placeholder="Month" />
            </div>
            <button className="btn" onClick={() => setJoined(true)}>Join Raffle</button>
          </>
        ) : (
          <>
            <div className="card">
              <div style={{ fontSize: 12, color: '#6B7280' }}>YOUR REFERRAL LINK</div>
              <div style={{ fontWeight: 700 }}>giftland.app/r/adaeze</div>
              <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => navigator.clipboard?.writeText('giftland.app/r/adaeze')}>Copy</button>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>4 / 10</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>Friends signed up</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
