'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const views = ['dashboard', 'vendors', 'hosts', 'orders', 'transactions', 'reports', 'gifts', 'system'];

export default function Admin() {
  const router = useRouter();
  const [view, setView] = useState('dashboard');
  const [ok, setOk] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', category: '' });

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/admin/login'); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role !== 'admin') { router.push('/admin/login'); return; }
      setOk(true);
      loadProducts();
    })();
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  }

  async function addProduct(e) {
    e.preventDefault();
    const { error } = await supabase.from('products').insert({ name: form.name, price: Number(form.price), category: form.category, active: true });
    if (error) { alert(error.message); return; }
    setForm({ name: '', price: '', category: '' });
    loadProducts();
  }

  if (!ok) return <div style={{ padding: 40 }}>Checking admin access…</div>;

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
            <p className="subtitle">Overview of vendors, hosts, and platform activity</p>
            <div className="stats">
              <div className="stat"><div>Vendors</div><div className="value">48</div></div>
              <div className="stat"><div>Hosts</div><div className="value">312</div></div>
              <div className="stat"><div>Orders today</div><div className="value">156</div></div>
              <div className="stat"><div>Cash gifts</div><div className="value">₦2.4M</div></div>
            </div>
          </>
        )}
        {view === 'gifts' && (
          <>
            <h1>Gift items</h1>
            <p className="subtitle">These appear on host wishlists.</p>
            <form className="card" onSubmit={addProduct}>
              <input className="input" placeholder="Gift name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <input className="input" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <button className="btn" type="submit">Add gift item</button>
            </form>
            {products.map(p => (
              <div key={p.id} className="card"><strong>{p.name}</strong> — ₦{Number(p.price).toLocaleString()}</div>
            ))}
          </>
        )}
        {view === 'vendors' && <h1>Vendors</h1>}
        {view === 'hosts' && <h1>Hosts</h1>}
        {view === 'orders' && <h1>Orders</h1>}
        {view === 'transactions' && <h1>Transactions</h1>}
        {view === 'reports' && <h1>Reports</h1>}
        {view === 'system' && <h1>System</h1>}
      </div>
    </div>
  );
}
