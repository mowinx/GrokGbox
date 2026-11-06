'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const views = ['dashboard', 'gifts', 'campaign gifts', 'events', 'campaigns', 'hosts', 'analysis', 'transactions', 'reports', 'system'];

export default function Admin() {
  const router = useRouter();
  const [view, setView] = useState('dashboard');
  const [ok, setOk] = useState(false);
  const [products, setProducts] = useState([]);
  const [campaignGifts, setCampaignGifts] = useState([]);
  const [events, setEvents] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '' });
  const [cgForm, setCgForm] = useState({ name: '', price: '' });
  const [image, setImage] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [eventGifts, setEventGifts] = useState([]);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role !== 'admin') { router.push('/admin/login'); return; }
      setOk(true);
      refresh();
    })();
  }, []);

  async function refresh() {
    const [p, cg, ev, c, h] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('campaign_gifts').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*, profiles(full_name, username)').order('event_date', { ascending: false }),
      supabase.from('campaigns').select('*, profiles(full_name, username)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setProducts(p.data || []);
    setCampaignGifts(cg.data || []);
    setEvents(ev.data || []);
    setCampaigns(c.data || []);
    setHosts(h.data || []);
  }

  function readImage(file, setter) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  }

  async function loadEvent(e) {
    let host = e.profiles?.username;
    if (!host && e.host_id) {
      const { data } = await supabase.from('profiles').select('username, full_name').eq('id', e.host_id).single();
      host = data?.username || data?.full_name;
    }
    const { data: gifts } = await supabase.from('gifts').select('*, products(name, price, image_url)').eq('event_id', e.id);
    const ids = [...new Set((gifts || []).map(g => g.sender_id).filter(Boolean))];
    const { data: people } = ids.length ? await supabase.from('profiles').select('id, username, full_name').in('id', ids) : { data: [] };
    const byId = Object.fromEntries((people || []).map(p => [p.id, p]));
    setSelected({ ...e, hostUser: host || 'host' });
    setEventGifts((gifts || []).map(g => ({ ...g, sender: byId[g.sender_id] })));
    setView('event-summary');
  }
    setSelected(product);
    const { data: wish } = await supabase.from('wishlist_items').select('event_id, events(title, host_id, profiles(full_name))').eq('product_id', product.id);
    const eventsMap = {};
    (wish || []).forEach(w => {
      if (!w.event_id) return;
      eventsMap[w.event_id] = eventsMap[w.event_id] || { title: w.events?.title, host: w.events?.profiles?.full_name, buyers: [] };
    });
    const { data: gifts } = await supabase.from('gifts').select('event_id, sender_id, profiles(full_name, username)').eq('product_id', product.id);
    (gifts || []).forEach(g => {
      eventsMap[g.event_id] = eventsMap[g.event_id] || { title: 'Event', host: '', buyers: [] };
      eventsMap[g.event_id].buyers.push(g.profiles?.username || g.profiles?.full_name || 'Someone');
    });
    setDetail(Object.entries(eventsMap).map(([id, v]) => ({ id, ...v })));
    setView('gift-report');
  }

  if (!ok) return <div style={{ padding: 40 }}>Checking admin access…</div>;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="desktop">
      <div className="sidebar" style={{ background: '#7F1D1D' }}>
        <div className="logo">Giftland Admin</div>
        {views.map(v => (
          <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>{v}</button>
        ))}
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }}>Sign out</button>
      </div>
      <div className="main">
        {view === 'dashboard' && (
          <>
            <h1>Admin Dashboard</h1>
            <div className="stats">
              <div className="stat"><div>Users</div><div className="value">{hosts.length}</div></div>
              <div className="stat"><div>Events</div><div className="value">{events.length}</div></div>
              <div className="stat"><div>Campaigns</div><div className="value">{campaigns.length}</div></div>
              <div className="stat"><div>Gifts</div><div className="value">{products.length}</div></div>
            </div>
          </>
        )}
        {view === 'gifts' && (
          <>
            <h1>Gift items</h1>
            <form className="card" onSubmit={async e => {
              e.preventDefault();
              const { error } = await supabase.from('products').insert({ name: form.name, price: Number(form.price), category: form.category, image_url: image, active: true });
              if (error) { alert(error.message); return; }
              setForm({ name: '', price: '', category: '' }); setImage(''); refresh();
            }}>
              <input className="input" placeholder="Gift name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <input className="input" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setImage)} />
              {image && <img src={image} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />}
              <button className="btn" type="submit">Add gift item</button>
            </form>
            {products.map(p => (
              <div key={p.id} className="card" onClick={() => openGift(p)} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
                <div><strong>{p.name}</strong><div>₦{Number(p.price).toLocaleString()}</div></div>
                <span className="tag tag-green">Active</span>
              </div>
            ))}
          </>
        )}
        {view === 'gift-report' && selected && (
          <>
            <button onClick={() => setView('gifts')}>← Gifts</button>
            <h1>{selected.name}</h1>
            {(detail || []).map(d => (
              <div key={d.id} className="card">
                <strong>{d.title}</strong>
                <div>Host: {d.host || '—'}</div>
                <div>Purchased: {d.buyers.length}</div>
                <div>By: {d.buyers.join(', ') || 'No purchases yet'}</div>
              </div>
            ))}
            {!detail?.length && <div className="card">No host has added this gift yet.</div>}
          </>
        )}
        {view === 'campaign gifts' && (
          <>
            <h1>Campaign gifts</h1>
            <p className="subtitle">Exclusive prizes a campaign host can pick. They pay for these.</p>
            <form className="card" onSubmit={async e => {
              e.preventDefault();
              const { error } = await supabase.from('campaign_gifts').insert({ name: cgForm.name, price: Number(cgForm.price), image_url: image, active: true });
              if (error) { alert(error.message); return; }
              setCgForm({ name: '', price: '' }); setImage(''); refresh();
            }}>
              <input className="input" placeholder="Item name" value={cgForm.name} onChange={e => setCgForm({ ...cgForm, name: e.target.value })} />
              <input className="input" placeholder="Price" value={cgForm.price} onChange={e => setCgForm({ ...cgForm, price: e.target.value })} />
              <input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setImage)} />
              <button className="btn" type="submit">Add campaign gift</button>
            </form>
            {campaignGifts.map(g => (
              <div key={g.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {g.image_url && <img src={g.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
                <div><strong>{g.name}</strong><div>₦{Number(g.price || 0).toLocaleString()}</div></div>
              </div>
            ))}
          </>
        )}
        {view === 'events' && (
          <>
            <h1>Events</h1>
            <h2>Active</h2>
            {events.filter(e => !e.event_date || e.event_date >= today).map(e => (
              <div key={e.id} className="card" onClick={() => loadEvent(e)}>
                <strong>{e.title}</strong>
                <div>{e.event_date || 'No date'} · @{e.hostUser || e.profiles?.username || 'host'}</div>
              </div>
            ))}
            <h2>Past</h2>
            {events.filter(e => e.event_date && e.event_date < today).map(e => (
              <div key={e.id} className="card" onClick={() => loadEvent(e)}>
                <strong>{e.title}</strong>
                <div>{e.event_date} · ended</div>
              </div>
            ))}
          </>
        )}
        {view === 'event-summary' && selected && (
          <>
            <button onClick={() => setView('events')}>← Events</button>
            <h1>{selected.title}</h1>
            <div className="card">
              <div>Host: @{selected.hostUser || selected.profiles?.username || 'host'}</div>
              <div>Date: {selected.event_date || '—'}</div>
              <div>Type: {selected.event_type}</div>
              <div>Public: {selected.is_public ? 'Yes' : 'No'}</div>
            </div>
            <h2>Gifts given</h2>
            {eventGifts.map(g => (
              <div key={g.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{g.is_cash ? `Cash ₦${Number(g.amount||0).toLocaleString()}` : (g.products?.name || 'Gift')}</strong>
                  <div>From: {g.is_anonymous ? 'Anonymous' : (g.sender?.username || g.profiles?.username || 'user')}</div>
                  <div>Status: {g.status === 'ready' ? 'Ready' : g.status === 'delivered' ? 'Delivered' : 'Not Redeemed'}</div>
                </div>
                {g.status !== 'ready' && g.status !== 'delivered' && (
                  <button className="btn btn-sm" onClick={async () => {
                    await supabase.from('gifts').update({ status: 'ready' }).eq('id', g.id);
                    loadEvent(selected);
                  }}>Mark ready</button>
                )}
                {g.status === 'ready' && <span className="tag tag-red">Ready</span>}
                {g.status === 'delivered' && <span className="tag tag-green">Delivered</span>}
              </div>
            ))}
            {!eventGifts.length && <div className="card">No gifts yet.</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-sm" onClick={async () => { await supabase.from('events').update({ active: false }).eq('id', selected.id); alert('Event made inactive'); }}>Inactive</button>
              <button className="btn btn-sm btn-outline" onClick={async () => { await supabase.from('events').update({ hold: true }).eq('id', selected.id); alert('Event on hold'); }}>Hold</button>
              <button className="btn btn-sm btn-outline" onClick={async () => { await supabase.from('events').update({ suspended: true, active: false }).eq('id', selected.id); alert('Event suspended'); }}>Suspend</button>
            </div>
          </>
        )}
        {view === 'campaigns' && (
          <>
            <h1>Campaigns</h1>
            {campaigns.map(c => (
              <div key={c.id} className="card" onClick={async () => {
                const { data: prizes } = await supabase.from('campaign_prizes').select('*').eq('campaign_id', c.id);
                const { data: parts } = await supabase.from('campaign_participants').select('*, profiles(username)').eq('campaign_id', c.id);
                setSelected({ ...c, prizes, parts });
                setView('campaign-summary');
              }}>
                <strong>{c.title}</strong>
                <div>Host @{c.profiles?.username} · {c.active ? 'Active' : 'Off'}</div>
              </div>
            ))}
          </>
        )}
        {view === 'campaign-summary' && selected && (
          <>
            <button onClick={() => setView('campaigns')}>← Campaigns</button>
            <h1>{selected.title}</h1>
            <div className="card">Ends {selected.end_date}. Share target {selected.share_target}.</div>
            <h2>Prizes</h2>
            {(selected.prizes || []).map(p => <div key={p.id} className="card">{p.name} {p.winner_id ? '· won' : '· ?'}</div>)}
            <h2>Participants</h2>
            {(selected.parts || []).map(p => <div key={p.id} className="card">@{p.profiles?.username} · {p.shares} shares</div>)}
          </>
        )}
        {view === 'hosts' && (
          <>
            <h1>Users</h1>
            {hosts.map(h => (
              <div key={h.id} className="card">
                <strong>{h.full_name || '—'}</strong>
                <div>@{h.username || '—'} · {h.email} · {h.role || 'user'}</div>
              </div>
            ))}
          </>
        )}
        {view === 'orders' && <h1>Orders</h1>}
        {view === 'transactions' && <h1>Transactions</h1>}
        {view === 'analysis' && (
          <>
            <h1>Analysis</h1>
            <div className="stats">
              <div className="stat"><div>Hosts</div><div className="value">{hosts.length}</div></div>
              <div className="stat"><div>Events</div><div className="value">{events.length}</div></div>
              <div className="stat"><div>Birthdays</div><div className="value">{events.filter(e => e.event_type === 'birthday').length}</div></div>
              <div className="stat"><div>Uploads</div><div className="value">{events.filter(e => e.event_type === 'video').length}</div></div>
              <div className="stat"><div>Live</div><div className="value">{events.filter(e => e.event_type === 'live').length}</div></div>
              <div className="stat"><div>Campaigns</div><div className="value">{campaigns.length}</div></div>
              <div className="stat"><div>Gift items</div><div className="value">{products.length}</div></div>
              <div className="stat"><div>Campaign gifts</div><div className="value">{campaignGifts.length}</div></div>
            </div>
          </>
        )}
        {view === 'system' && <h1>System</h1>}
      </div>
    </div>
  );
}
