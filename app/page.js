'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', day: '', month: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function signup(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, phone: form.phone, birthday_day: form.day, birthday_month: form.month } },
      });
      if (error) { setMsg(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.name,
          phone: form.phone,
          email: form.email,
          birthday_day: Number(form.day) || null,
          birthday_month: Number(form.month) || null,
          referral_code: form.name.toLowerCase().replace(/\s+/g, '').slice(0, 10) + Math.floor(Math.random() * 99),
        });
      }
    }
    setLoading(false);
    router.push('/home');
  }

  return (
    <div className="phone">
      <div style={{ position: 'relative' }}>
        <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80" alt="Birthday celebration" style={{ width: '100%', height: 240, objectFit: 'cover' }} />
        <div style={{ background: '#DC2626', color: 'white', textAlign: 'center', padding: '24px 20px 28px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>🎁 BIRTHDAY SEASON</div>
          <div style={{ fontSize: 22, fontWeight: 800, margin: '6px 0' }}>Giftland</div>
          <h1 style={{ fontSize: 24, lineHeight: 1.3, marginBottom: 10 }}>Your Birthday Comes Every Year. Your Chance to Get Gifted Starts Now.</h1>
          <p style={{ fontSize: 15, lineHeight: 1.5, opacity: 0.95 }}>Join Giftland for birthday surprises, anonymous gifts, referral rewards, and a chance to win our end-of-year grand prize.</p>
          <a href="#signup" className="btn" style={{ background: 'white', color: '#DC2626', marginTop: 16, display: 'block' }}>YES! I WANT TO JOIN GIFTLAND</a>
        </div>
      </div>

      <div style={{ padding: '28px 20px' }}>
        <h2>What if your next birthday came with more than wishes?</h2>
        <p className="subtitle" style={{ lineHeight: 1.6 }}>Imagine waking up to an unexpected gift. Imagine someone choosing to make your day special. That is the excitement of Giftland.</p>
        <div className="card"><strong>🎂 Your birthday.</strong><p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Be considered for birthday gifts around your special day.</p></div>
        <div className="card"><strong>📆 Your birthday week & month.</strong><p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>More opportunities beyond a single day.</p></div>
        <div className="card"><strong>🏆 Top Referrer Challenge.</strong><p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Invite friends. The top referrer can win a special prize.</p></div>
        <div className="card"><strong>💌 Anonymous gifting.</strong><p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Send or receive gifts without revealing who sent them.</p></div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Gifts and prizes are opportunities, not guaranteed. See official campaign rules.</p>
      </div>

      <form id="signup" onSubmit={signup} style={{ background: '#FEE2E2', padding: '28px 20px 40px' }}>
        <h2 style={{ color: '#DC2626', textAlign: 'center' }}>Create your free account</h2>
        <p className="subtitle" style={{ textAlign: 'center' }}>Start hosting, gifting, and entering raffles.</p>
        {msg && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{msg}</p>}
        <input className="input" placeholder="Full name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Phone number" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input className="input" type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} />
          <input className="input" placeholder="Month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
        </div>
        <input className="input" type="password" placeholder="Create password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating…' : 'YES! SIGN ME UP FOR GIFTLAND 🎁'}</button>
        <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 10 }}>Birthday (day & month) is used for raffle eligibility.</p>
      </form>

      <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: '#6B7280' }}>© 2026 Giftland</div>
    </div>
  );
}
