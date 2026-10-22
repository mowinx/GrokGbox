'use client';
import Link from 'next/link';

export default function Wallet() {
  return (
    <div className="phone">
      <div className="phone-content">
        <Link href="/home" style={{ color: '#DC2626', fontWeight: 600 }}>← Profile</Link>
        <h1 style={{ marginTop: 8 }}>Wallet</h1>
        <p className="subtitle">Cash gifts are held here until you withdraw.</p>
        <div className="card" style={{ textAlign: 'center', background: '#FEE2E2' }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Available</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#DC2626' }}>₦75,000</div>
        </div>
        <div className="card">
          <strong>Payment method</strong>
          <div>GTBank •••• 4521</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Adaeze Okonkwo</div>
        </div>
        <button className="btn">Withdraw to bank</button>
      </div>
    </div>
  );
}
