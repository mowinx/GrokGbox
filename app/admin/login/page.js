'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AdminLogin() {
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
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setErr('This account is not an admin.');
      return;
    }
    router.push('/admin');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: 360, background: 'white', borderRadius: 16, padding: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#DC2626', marginBottom: 4 }}>Giftland Admin</div>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>Admin sign in only. This is separate from the public app.</p>
        <input className="input" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <p style={{ color: '#DC2626', fontSize: 13 }}>{err}</p>}
        <button className="btn" type="submit">Sign in</button>
      </form>
    </div>
  );
}
