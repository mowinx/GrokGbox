'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function CampaignLink() {
  const { code } = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const by = search.get('by') || '';
  const [campaign, setCampaign] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      if (!supabase || !code) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase.from('campaigns').select('*').eq('share_code', code).single();
      setCampaign(data);
      if (!user) {
        localStorage.setItem('giftland_campaign', code);
        if (by) localStorage.setItem('giftland_ref', by);
        router.replace('/?ref=' + encodeURIComponent(by || '') + '&campaign=' + code);
        return;
      }
      if (by) {
        const { data: participant } = await supabase.from('profiles').select('id').eq('username', by).single();
        if (participant && participant.id !== user.id) {
          await supabase.from('campaign_shares').insert({ campaign_id: data.id, participant_id: participant.id, visitor_id: user.id });
          const { count } = await supabase.from('campaign_shares').select('*', { count: 'exact', head: true }).eq('campaign_id', data.id).eq('participant_id', participant.id);
          await supabase.from('campaign_participants').update({ shares: count || 0 }).eq('campaign_id', data.id).eq('user_id', participant.id);
        }
      }
    })();
  }, [code, by]);

  if (!campaign) return <div style={{ padding: 40 }}>Opening campaign…</div>;
  return (
    <div style={{ maxWidth: 430, margin: '0 auto', padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {campaign.image_url && <img src={campaign.image_url} alt="" style={{ width: '100%', borderRadius: 12 }} />}
      <h1>{campaign.title}</h1>
      <p>Share target: {campaign.share_target} friends</p>
      <button onClick={() => router.push('/home')} style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: 24, padding: '14px 20px', fontWeight: 700 }}>Open in app</button>
    </div>
  );
}
