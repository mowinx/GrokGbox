'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!supabase) { setErr('Database not connected'); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); return; }
    localStorage.setItem('giftland_last', String(Date.now()));
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    router.push(profile?.role === 'admin' ? '/admin' : '/home');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF7F7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: 360, background: 'white', borderRadius: 16, padding: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#DC2626', marginBottom: 4 }}>Giftland</div>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>Sign in to continue.</p>
        <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <p style={{ color: '#DC2626', fontSize: 13 }}>{err}</p>}
        <button className="btn" type="submit">Sign in</button>
        <p style={{ fontSize: 13, marginTop: 12 }}><a href="/" style={{ color: '#DC2626' }}>New here? Create an account</a></p>
      </form>
    </div>
  );
}
