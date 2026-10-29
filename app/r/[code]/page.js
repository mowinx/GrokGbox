'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ReferralLanding() {
  const { code } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      localStorage.setItem('giftland_ref', code);
      router.replace('/?ref=' + encodeURIComponent(code));
    }
  }, [code, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32 }}>🎁</div>
        <div style={{ fontWeight: 700, marginTop: 8 }}>Joining Giftland…</div>
      </div>
    </div>
  );
}
