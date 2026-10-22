'use client';
import { useState } from 'react';

const views = ['dashboard', 'hosts', 'orders', 'products', 'financials', 'wallet', 'settings'];

export default function Vendor() {
  const [view, setView] = useState('dashboard');
  return (
    <div className="desktop">
      <div className="sidebar">
        <div className="logo">🎁 Giftland Vendor</div>
        <div style={{ padding: '0 20px 12px', fontSize: 13, color: '#9CA3AF' }}>Shoprite Lagos</div>
        {views.map(v => (
          <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>{v}</button>
        ))}
      </div>
      <div className="main">
        {view === 'dashboard' && (
          <>
            <h1>Vendor Dashboard</h1>
            <div className="stats">
              <div className="stat"><div>Received</div><div className="value">156</div></div>
              <div className="stat"><div>Pending</div><div className="value">24</div></div>
              <div className="stat"><div>Processing</div><div className="value">18</div></div>
              <div className="stat"><div>Delivered</div><div className="value">114</div></div>
            </div>
          </>
        )}
        {view === 'hosts' && (
          <>
            <h1>Hosts</h1>
            <div className="card">
              <table>
                <tr><th>Host</th><th>Event</th><th>Purchased</th></tr>
                <tr><td>Adaeze</td><td>Emma’s Birthday</td><td>5</td></tr>
                <tr><td>Chidi</td><td>Wedding</td><td>7</td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'orders' && (
          <>
            <h1>Orders</h1>
            <div className="card">
              <table>
                <tr><th>Order</th><th>Item</th><th>Status</th><th></th></tr>
                <tr><td>#GL-10491</td><td>Perfume</td><td><span className="tag tag-gold">Processing</span></td><td><button className="btn btn-sm">Update</button></td></tr>
                <tr><td>#GL-10502</td><td>Gift Basket</td><td><span className="tag tag-red">Pending</span></td><td><button className="btn btn-sm">Process</button></td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'products' && (
          <>
            <h1>Products</h1>
            <button className="btn btn-sm" style={{ marginBottom: 12 }}>+ Add Product</button>
            <div className="card">
              <table>
                <tr><th>Product</th><th>Price</th><th>Sold</th></tr>
                <tr><td>Headphones</td><td>₦199,000</td><td>18</td></tr>
                <tr><td>Perfume</td><td>₦165,000</td><td>22</td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'financials' && (
          <>
            <h1>Financials</h1>
            <div className="stats">
              <div className="stat"><div>Gross</div><div className="value">₦4.8M</div></div>
              <div className="stat"><div>Fees</div><div className="value">₦120K</div></div>
              <div className="stat"><div>Net</div><div className="value">₦4.68M</div></div>
              <div className="stat"><div>Pending</div><div className="value">₦320K</div></div>
            </div>
          </>
        )}
        {view === 'wallet' && (
          <>
            <h1>Wallet</h1>
            <div className="card" style={{ maxWidth: 360, textAlign: 'center', background: '#FEE2E2' }}>
              <div>Available</div>
              <div className="value" style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>₦320,000</div>
            </div>
            <button className="btn" style={{ maxWidth: 240, marginTop: 12 }}>Withdraw</button>
          </>
        )}
        {view === 'settings' && (
          <>
            <h1>Settings</h1>
            <div className="card" style={{ maxWidth: 400 }}>
              <button className="btn" style={{ marginBottom: 8 }}>Personal Account</button>
              <button className="btn btn-outline">Store Settings</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
