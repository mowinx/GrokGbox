'use client';
import { useState } from 'react';

const views = ['dashboard', 'vendors', 'hosts', 'orders', 'transactions', 'reports', 'system'];

export default function Admin() {
  const [view, setView] = useState('dashboard');
  return (
    <div className="desktop">
      <div className="sidebar">
        <div className="logo">🎁 Giftland Admin</div>
        {views.map(v => (
          <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>{v}</button>
        ))}
      </div>
      <div className="main">
        {view === 'dashboard' && (
          <>
            <h1>Admin Dashboard</h1>
            <div className="stats">
              <div className="stat"><div>Vendors</div><div className="value">48</div></div>
              <div className="stat"><div>Hosts</div><div className="value">312</div></div>
              <div className="stat"><div>Orders today</div><div className="value">156</div></div>
              <div className="stat"><div>Cash gifts</div><div className="value">₦2.4M</div></div>
            </div>
          </>
        )}
        {view === 'vendors' && (
          <>
            <h1>Vendors</h1>
            <div className="card">
              <table>
                <tr><th>Vendor</th><th>Status</th><th></th></tr>
                <tr><td>Shoprite Lagos</td><td><span className="tag tag-green">Approved</span></td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
                <tr><td>Spar VI</td><td><span className="tag tag-gold">Pending</span></td><td><button className="btn btn-sm">Approve</button></td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'hosts' && (
          <>
            <h1>Hosts</h1>
            <div className="card">
              <table>
                <tr><th>Host</th><th>Events</th><th>KYC</th></tr>
                <tr><td>Adaeze Okonkwo</td><td>4</td><td><span className="tag tag-green">Verified</span></td></tr>
                <tr><td>Amaka Kalu</td><td>1</td><td><span className="tag tag-gold">Pending</span></td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'orders' && (
          <>
            <h1>Orders</h1>
            <div className="card">
              <table>
                <tr><th>Order</th><th>Host</th><th>Vendor</th><th>Status</th></tr>
                <tr><td>#GL-10482</td><td>Emma’s Birthday</td><td>Shoprite</td><td><span className="tag tag-green">Delivered</span></td></tr>
                <tr><td>#GL-10491</td><td>Wedding</td><td>Game</td><td><span className="tag tag-gold">Processing</span></td></tr>
              </table>
            </div>
          </>
        )}
        {view === 'transactions' && (
          <>
            <h1>Transactions</h1>
            <div className="stats">
              <div className="stat"><div>Fees (month)</div><div className="value">₦186K</div></div>
              <div className="stat"><div>Cash held</div><div className="value">₦2.4M</div></div>
              <div className="stat"><div>Fee rate</div><div className="value">2.5%</div></div>
            </div>
          </>
        )}
        {view === 'reports' && <h1>Reports</h1>}
        {view === 'system' && (
          <>
            <h1>System</h1>
            <div className="stats">
              <div className="stat"><div>Uptime</div><div className="value">99.97%</div></div>
              <div className="stat"><div>Active users</div><div className="value">1,842</div></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
