'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function EventLink() {
  const { code } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase || !code) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase.from('events').select('*').eq('share_code', code).single();
      setEvent(data);
    })();
  }, [code]);

  async function attend() {
    if (!user) { setNote('Sign in first, then open this link again.'); return; }
    if (!event) return;
    const { error } = await supabase.from('event_attendees').upsert({ event_id: event.id, user_id: user.id, status: 'attending' }, { onConflict: 'event_id,user_id' });
    setNote(error ? error.message : 'You’re attending. It will show under My Events.');
  }

  if (!event) return <div style={{ padding: 40, fontFamily: 'Inter, system-ui, sans-serif' }}>Loading event…</div>;
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 }}>
      <div style={{ fontWeight: 800, color: '#DC2626', marginBottom: 12 }}>Giftland</div>
      {event.image_url && <img src={event.image_url} alt="" style={{ width: '100%', borderRadius: 12, maxHeight: 280, objectFit: 'contain', background: '#000' }} />}
      <h1>{event.title}</h1>
      <p>{event.event_date || ''} {event.location ? '• ' + event.location : ''}</p>
      <button onClick={attend} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 24, padding: '14px 20px', fontWeight: 700, width: '100%' }}>I’m attending</button>
      {note && <p style={{ marginTop: 12 }}>{note}</p>}
    </div>
  );
}
